import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/account";
import { formatINR } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "My orders | SivakasiCrackers" },
      { name: "description", content: "View your order history and track deliveries." },
      { property: "og:title", content: "My orders | SivakasiCrackers" },
      { property: "og:description", content: "Your SivakasiCrackers order history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["orders", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">My orders</h1>
        {isLoading ? (
          <p className="mt-6 text-muted-foreground">Loading…</p>
        ) : data.length === 0 ? (
          <div className="mt-6 rounded-xl border bg-card p-6 text-center">
            <p>You haven't placed any orders yet.</p>
            <Button asChild className="mt-3">
              <Link to="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {data.map((o) => (
              <li key={o.id}>
                <Link
                  to="/order/$id"
                  params={{ id: o.id }}
                  className="flex items-center justify-between rounded-xl border bg-card p-4 hover:border-primary"
                >
                  <div>
                    <p className="font-semibold">{o.order_number}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(new Date(o.created_at))}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatINR(Number(o.total))}</p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold capitalize">
                      {o.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
