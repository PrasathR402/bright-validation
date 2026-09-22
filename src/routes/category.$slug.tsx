import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ProductCard } from "@/components/shop/ProductCard";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesQuery, categoryImages, productsQuery, type ProductFilters } from "@/lib/shop";
import { useState } from "react";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const label = params.slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${label} — Buy Online | SivakasiCrackers` },
        {
          name: "description",
          content: `Shop ${label.toLowerCase()} online at festival discount prices with safe packing and home delivery.`,
        },
        { property: "og:title", content: `${label} | SivakasiCrackers` },
        {
          property: "og:description",
          content: `Festival prices on ${label.toLowerCase()} delivered to your door.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [sort, setSort] = useState<ProductFilters["sort"]>("popular");
  const { data: categories = [] } = useQuery(categoriesQuery);
  const category = categories.find((row) => row.slug === slug);
  const { data: products, isLoading } = useQuery(productsQuery({ categorySlug: slug, sort }));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
          <img
            src={categoryImages[slug]}
            alt={category?.name ?? slug}
            loading="lazy"
            width={816}
            height={816}
            className="size-24 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{category?.name ?? "Crackers"}</h1>
            <p className="text-sm text-muted-foreground">{category?.description}</p>
          </div>
          <Select value={sort ?? "popular"} onValueChange={(value) => setSort(value as ProductFilters["sort"])}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="new">Newest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-muted-foreground">
            Nothing here yet. New stock is added every week.
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
