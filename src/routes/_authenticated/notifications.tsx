import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Package, Sparkles, Tag } from "lucide-react";

import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/account";
import { offersQuery } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | SivakasiCrackers" },
      { name: "description", content: "Order updates, festival offers and new arrival alerts." },
      { property: "og:title", content: "Notifications | SivakasiCrackers" },
      { property: "og:description", content: "Your order updates and offer alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

const icons: Record<string, typeof Bell> = { order: Package, new_arrival: Sparkles, offer: Tag };

function NotificationsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, kind, link_url, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: offers = [] } = useQuery(offersQuery);

  async function markAllRead() {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }

  async function open(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        </div>

        {offers.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 font-semibold">Festival offers & discounts</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {offers.map((o) => (
                <div key={o.id} className="rounded-xl bg-[image:var(--gradient-festive)] p-4 text-primary-foreground">
                  {o.badge && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-gold-foreground">{o.badge}</span>}
                  <p className="mt-2 font-bold">{o.title}</p>
                  <p className="text-sm opacity-90">{o.subtitle}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="mb-2 font-semibold">Updates</h2>
          {data.length === 0 ? (
            <p className="text-muted-foreground">No notifications yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.map((n) => {
                const Icon = icons[n.kind] ?? Bell;
                return (
                  <li key={n.id}>
                    <a
                      href={n.link_url ?? "#"}
                      onClick={() => open(n.id)}
                      className={`flex gap-3 rounded-xl border p-4 ${n.is_read ? "bg-card" : "border-primary bg-secondary/60"}`}
                    >
                      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold capitalize">{n.title}</p>
                        {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(new Date(n.created_at))}</p>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <Button asChild variant="link" className="mt-4 px-0">
          <Link to="/new-arrivals">See all new arrivals →</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
