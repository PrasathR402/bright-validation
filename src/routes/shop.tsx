import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { ProductCard } from "@/components/shop/ProductCard";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesQuery, productsQuery, type ProductFilters } from "@/lib/shop";

type ShopSearch = {
  q?: string;
  category?: string;
  sort?: ProductFilters["sort"];
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search['q'] === "string" && search['q'] ? search['q'] : undefined,
    category:
      typeof search['category'] === "string" && search['category'] ? search['category'] : undefined,
    sort:
      search['sort'] === "price-asc" ||
      search['sort'] === "price-desc" ||
      search['sort'] === "new" ||
      search['sort'] === "popular"
        ? search['sort']
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Crackers — Search, Filter & Sort | SivakasiCrackers" },
      {
        name: "description",
        content:
          "Browse every cracker we stock. Search by name, filter by category and sort by price to find the best festival deals.",
      },
      { property: "og:title", content: "All Crackers | SivakasiCrackers" },
      {
        property: "og:description",
        content: "Search, filter and sort our full range of festival crackers and combo packs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const [term, setTerm] = useState(search.q ?? "");

  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: products, isLoading } = useQuery(
    productsQuery({ search: search.q, categorySlug: search.category, sort: search.sort }),
  );

  function update(next: Partial<ShopSearch>) {
    navigate({ search: (prev) => ({ ...prev, ...next }) });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">All crackers</h1>
        <p className="text-sm text-muted-foreground">
          {products ? `${products.length} products` : "Loading products…"}
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              update({ q: term || undefined });
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Search by product name"
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <Select
            value={search.category ?? "all"}
            onValueChange={(value) => update({ category: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="sm:w-52">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={search.sort ?? "popular"}
            onValueChange={(value) =>
              update({ sort: value === "popular" ? undefined : (value as ProductFilters["sort"]) })
            }
          >
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
            {Array.from({ length: 8 }).map((_, index) => (
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
            No crackers matched your search. Try another name or category.
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
