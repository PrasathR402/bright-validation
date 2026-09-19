import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import giftBoxes from "@/assets/cat-gift-boxes.jpg";
import sparklers from "@/assets/cat-sparklers.jpg";
import flowerPots from "@/assets/cat-flower-pots.jpg";
import groundChakkars from "@/assets/cat-ground-chakkars.jpg";
import rockets from "@/assets/cat-rockets.jpg";
import bombs from "@/assets/cat-bombs.jpg";
import fancyItems from "@/assets/cat-fancy-items.jpg";
import kidsCollection from "@/assets/cat-kids-collection.jpg";
import comboPacks from "@/assets/cat-combo-packs.jpg";

export const categoryImages: Record<string, string> = {
  "gift-boxes": giftBoxes,
  sparklers,
  "flower-pots": flowerPots,
  "ground-chakkars": groundChakkars,
  rockets,
  bombs,
  "fancy-items": fancyItems,
  "kids-collection": kidsCollection,
  "combo-packs": comboPacks,
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  mrp: number;
  price: number;
  stock: number;
  unit: string | null;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  category_id: string | null;
  categories?: { slug: string; name: string } | null;
};

export type Offer = {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  link_url: string | null;
  kind: string;
};

export function formatINR(value: number) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function discountPercent(mrp: number, price: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function productImage(product: Pick<Product, "image_url" | "categories">, slug?: string) {
  if (product.image_url) return product.image_url;
  const key = product.categories?.slug ?? slug ?? "";
  return categoryImages[key] ?? giftBoxes;
}

const PRODUCT_FIELDS =
  "id, slug, name, description, image_url, mrp, price, stock, unit, is_best_seller, is_new_arrival, category_id, categories(slug, name)";

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, description, sort_order")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Category[];
  },
});

export const offersQuery = queryOptions({
  queryKey: ["offers"],
  queryFn: async (): Promise<Offer[]> => {
    const { data, error } = await supabase
      .from("offers")
      .select("id, title, subtitle, badge, link_url, kind")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Offer[];
  },
});

export type ProductFilters = {
  categorySlug?: string;
  search?: string;
  sort?: "popular" | "price-asc" | "price-desc" | "new";
  bestSellers?: boolean;
  newArrivals?: boolean;
  limit?: number;
};

export function productsQuery(filters: ProductFilters = {}) {
  return queryOptions({
    queryKey: ["products", filters],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase.from("products").select(PRODUCT_FIELDS).eq("is_active", true);

      // category filtering is applied client-side below (embedded-table filters
      // require an inner join and would drop uncategorised rows)

      if (filters.search) query = query.ilike("name", `%${filters.search}%`);
      if (filters.bestSellers) query = query.eq("is_best_seller", true);
      if (filters.newArrivals) query = query.eq("is_new_arrival", true);

      if (filters.sort === "price-asc") query = query.order("price", { ascending: true });
      else if (filters.sort === "price-desc") query = query.order("price", { ascending: false });
      else if (filters.sort === "new") query = query.order("created_at", { ascending: false });
      else query = query.order("is_best_seller", { ascending: false }).order("name");

      if (filters.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw error;
      const rows = (data ?? []) as unknown as Product[];
      return filters.categorySlug
        ? rows.filter((row) => row.categories?.slug === filters.categorySlug)
        : rows;
    },
  });
}

export function productQuery(slug: string) {
  return queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_FIELDS)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Product) ?? null;
    },
  });
}

export type Coupon = {
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
};

export async function lookupCoupon(code: string): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from("coupons")
    .select("code, description, discount_type, discount_value, min_order_amount, max_discount")
    .eq("code", code.trim().toUpperCase())
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return (data as Coupon) ?? null;
}

export function couponDiscount(coupon: Coupon, subtotal: number) {
  if (subtotal < Number(coupon.min_order_amount)) return 0;
  const raw =
    coupon.discount_type === "percent"
      ? (subtotal * Number(coupon.discount_value)) / 100
      : Number(coupon.discount_value);
  const capped = coupon.max_discount ? Math.min(raw, Number(coupon.max_discount)) : raw;
  return Math.min(Math.round(capped), subtotal);
}
