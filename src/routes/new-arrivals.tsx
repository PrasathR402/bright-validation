import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";

import { ProductCard } from "@/components/shop/ProductCard";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesQuery, productsQuery } from "@/lib/shop";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — Latest Crackers | SivakasiCrackers" },
      { name: "description", content: "Discover the newest crackers, sparklers and gift boxes just added to our store." },
      { property: "og:title", content: "New Arrivals | SivakasiCrackers" },
      { property: "og:description", content: "Freshly launched crackers for this festival season." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewArrivalsPage,
});

function NewArrivalsPage() {
  const [cat, setCat] = useState<string>("");
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data = [], isLoading } = useQuery(
    productsQuery({ newArrivals: true, sort: "new", categorySlug: cat || undefined }),
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-[image:var(--gradient-festive)] px-4 py-10 text-primary-foreground">
        <div className="mx-auto max-w-6xl">
          <span className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground">
            <Sparkles className="size-3" /> Just landed
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">New arrivals</h1>
          <p className="mt-1 opacity-90">The latest crackers added this season. Signed-in customers get alerts when new items land.</p>
        </div>
      </section>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {[{ slug: "", name: "All" }, ...categories].map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${cat === c.slug ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : data.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">No new arrivals in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {data.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
