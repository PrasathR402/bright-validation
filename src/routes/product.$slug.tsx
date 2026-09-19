import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/shop/ProductCard";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cart";
import { discountPercent, formatINR, productImage, productQuery, productsQuery } from "@/lib/shop";

export const Route = createFileRoute("/product/$slug")({
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
          content: `Buy ${label} online at a festival discount price with stock availability and fast delivery.`,
        },
        { property: "og:title", content: `${label} | SivakasiCrackers` },
        {
          property: "og:description",
          content: `Order ${label} at factory prices from SivakasiCrackers.`,
        },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useQuery(productQuery(slug));
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: related = [] } = useQuery({
    ...productsQuery({ categorySlug: product?.categories?.slug, limit: 8 }),
    enabled: Boolean(product?.categories?.slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Button asChild className="mt-4">
            <Link to="/shop">Back to all crackers</Link>
          </Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const image = productImage(product);
  const off = discountPercent(Number(product.mrp), Number(product.price));
  const inStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-8 md:grid-cols-2">
          <img
            src={image}
            alt={product.name}
            width={816}
            height={816}
            className="w-full rounded-xl border object-cover"
          />
          <div>
            {product.categories && (
              <Link
                to="/category/$slug"
                params={{ slug: product.categories.slug }}
                className="text-sm font-medium text-primary"
              >
                {product.categories.name}
              </Link>
            )}
            <h1 className="mt-1 text-3xl font-extrabold">{product.name}</h1>
            <p className="mt-3 text-muted-foreground">{product.description}</p>

            <div className="mt-5 flex items-end gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatINR(Number(product.price))}
              </span>
              {Number(product.mrp) > Number(product.price) && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatINR(Number(product.mrp))}
                  </span>
                  <span className="rounded-full bg-gold px-2 py-1 text-xs font-bold text-gold-foreground">
                    {off}% OFF
                  </span>
                </>
              )}
            </div>

            <p className={`mt-2 text-sm font-medium ${inStock ? "text-success" : "text-destructive"}`}>
              {inStock ? `In stock · ${product.stock} ${product.unit ?? "pcs"} available` : "Out of stock"}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-lg border">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <Button
                size="lg"
                disabled={!inStock}
                onClick={() => {
                  addItem(
                    {
                      productId: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: Number(product.price),
                      mrp: Number(product.mrp),
                      image,
                      stock: product.stock,
                    },
                    quantity,
                  );
                  toast.success(`${quantity} × ${product.name} added to cart`);
                }}
              >
                <ShoppingCart className="mr-2 size-4" /> Add to cart
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/cart">Go to cart</Link>
              </Button>
            </div>
          </div>
        </div>

        {related.length > 1 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">You may also like</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related
                .filter((row) => row.id !== product.id)
                .slice(0, 4)
                .map((row) => (
                  <ProductCard key={row.id} product={row} />
                ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
