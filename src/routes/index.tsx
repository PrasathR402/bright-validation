import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgePercent, ShieldCheck, Truck } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesQuery, categoryImages, offersQuery, productsQuery } from "@/lib/shop";

import heroImage from "@/assets/hero-diwali.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SivakasiCrackers — Buy Diwali Crackers Online at Factory Prices" },
      {
        name: "description",
        content:
          "Shop sparklers, gift boxes, flower pots, rockets and combo packs online with festival discounts and safe home delivery.",
      },
      { property: "og:title", content: "SivakasiCrackers — Online Cracker Shop" },
      {
        property: "og:description",
        content:
          "Festival crackers from Sivakasi at factory prices. Gift boxes, sparklers, combos and more with fast delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function ProductGrid({ slugFilter }: { slugFilter: "best" | "new" }) {
  const { data, isLoading } = useQuery(
    productsQuery(
      slugFilter === "best"
        ? { bestSellers: true, limit: 8 }
        : { newArrivals: true, sort: "new", limit: 8 },
    ),
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {(data ?? []).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function HomePage() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: offers = [] } = useQuery(offersQuery);
  const banners = offers.filter((offer) => offer.kind === "banner");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative">
        <img
          src={heroImage}
          alt="Diwali celebration with sparklers and diyas"
          width={1600}
          height={912}
          className="h-[320px] w-full object-cover sm:h-[440px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-4 px-4 text-white">
            <span className="w-fit rounded-full bg-gold px-3 py-1 text-xs font-bold text-gold-foreground">
              Diwali Dhamaka · Up to 60% off
            </span>
            <h1 className="max-w-xl text-3xl font-extrabold leading-tight sm:text-5xl">
              Light up your festival with crackers straight from Sivakasi
            </h1>
            <p className="max-w-lg text-sm opacity-90 sm:text-base">
              Gift boxes, sparklers, flower pots, rockets and kid-safe collections at factory
              prices, delivered to your doorstep.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/shop">Shop all crackers</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/category/$slug" params={{ slug: "gift-boxes" }}>
                  Festival gift boxes
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 py-6 sm:grid-cols-3">
        {[
          { icon: Truck, title: "Safe delivery", text: "Licensed packing and tracked shipping" },
          { icon: BadgePercent, title: "Festival prices", text: "Discounts up to 60% on MRP" },
          { icon: ShieldCheck, title: "Genuine quality", text: "Sourced directly from Sivakasi" },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <item.icon className="size-6 text-primary" />
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </section>

      {banners.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-6">
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">Festival offers</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {banners.map((offer) => (
              <div
                key={offer.id}
                className="rounded-xl border bg-[image:var(--gradient-festive)] p-5 text-primary-foreground"
              >
                {offer.badge && (
                  <span className="rounded-full bg-gold px-2 py-1 text-xs font-bold text-gold-foreground">
                    {offer.badge}
                  </span>
                )}
                <h3 className="mt-3 text-lg font-bold">{offer.title}</h3>
                <p className="text-sm opacity-90">{offer.subtitle}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">Shop by category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/category/$slug"
              params={{ slug: category.slug }}
              className="group overflow-hidden rounded-xl border bg-card text-center shadow-[var(--shadow-card)]"
            >
              <img
                src={categoryImages[category.slug]}
                alt={category.name}
                loading="lazy"
                width={816}
                height={816}
                className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
              />
              <p className="p-2 text-sm font-semibold">{category.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">Best sellers</h2>
        <ProductGrid slugFilter="best" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">New arrivals</h2>
        <ProductGrid slugFilter="new" />
      </section>

      <SiteFooter />
    </div>
  );
}
