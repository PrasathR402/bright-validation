import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileDown } from "lucide-react";

const STEPS = ["placed", "packed", "shipped", "delivered"] as const;

import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/account";
import { formatINR } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/order/$id")({
  head: () => ({
    meta: [
      { title: "Order confirmed | SivakasiCrackers" },
      {
        name: "description",
        content: "Your SivakasiCrackers order is confirmed. See items, totals and delivery date.",
      },
      { property: "og:title", content: "Order confirmed | SivakasiCrackers" },
      { property: "og:description", content: "Order confirmation and delivery details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderPage,
});

type ShippingAddress = {
  full_name?: string;
  phone?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
};

function OrderPage() {
  const { id } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const { data: order, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, payment_method, subtotal, discount, delivery_charge, total, coupon_code, estimated_delivery, shipping_address, created_at",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("id, product_name, image_url, unit_price, quantity, line_total")
        .eq("order_id", id);
      if (itemsError) throw itemsError;
      const { data: history } = await supabase
        .from("order_status_history")
        .select("status, created_at")
        .eq("order_id", id)
        .order("created_at");
      return { order, items: items ?? [], history: history ?? [] };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
          Loading your order…
        </main>
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <Button asChild className="mt-4">
            <Link to="/shop">Back to shop</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const order = data.order;
  const address = (order.shipping_address ?? {}) as ShippingAddress;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-xl border bg-card p-6 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <h1 className="mt-3 text-2xl font-bold capitalize">Order {order.status}</h1>
          <p className="mt-1 text-muted-foreground">
            Order {order.order_number} · {formatINR(Number(order.total))}
          </p>
          {order.estimated_delivery && (
            <p className="mt-1 text-sm">
              Estimated delivery by {formatDate(new Date(order.estimated_delivery))}
            </p>
          )}
        </div>

        <section className="mt-6 rounded-xl border bg-card p-4 print:hidden">
          <h2 className="text-lg font-bold">Tracking</h2>
          <ol className="mt-4 grid grid-cols-4 gap-2">
            {STEPS.map((step, i) => {
              const current = STEPS.indexOf(order.status as (typeof STEPS)[number]);
              const done = i <= current;
              const at = data.history.find((h) => h.status === step);
              return (
                <li key={step} className="flex flex-col items-center text-center">
                  <span
                    className={`grid size-9 place-items-center rounded-full text-sm font-bold ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {i + 1}
                  </span>
                  <span className={`mt-2 text-xs font-semibold capitalize sm:text-sm ${done ? "" : "text-muted-foreground"}`}>
                    {step}
                  </span>
                  {at && (
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(new Date(at.created_at))}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          {order.status === "cancelled" && (
            <p className="mt-3 text-sm text-destructive">This order was cancelled.</p>
          )}
        </section>

        <section className="mt-6 rounded-xl border bg-card p-4">
          <h2 className="text-lg font-bold">Items</h2>
          <ul className="mt-3 space-y-3">
            {data.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 text-sm">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    loading="lazy"
                    className="size-14 rounded-lg object-cover"
                  />
                )}
                <span className="flex-1">
                  {item.product_name} × {item.quantity}
                </span>
                <span className="font-semibold">{formatINR(Number(item.line_total))}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatINR(Number(order.subtotal))}</dd>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</dt>
                <dd>-{formatINR(Number(order.discount))}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>
                {Number(order.delivery_charge) === 0
                  ? "Free"
                  : formatINR(Number(order.delivery_charge))}
              </dd>
            </div>
            <div className="flex justify-between font-bold">
              <dt>Total</dt>
              <dd>{formatINR(Number(order.total))}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-xl border bg-card p-4 text-sm">
          <h2 className="text-lg font-bold">Delivering to</h2>
          <p className="mt-2 font-semibold">
            {address.full_name} · {address.phone}
          </p>
          <p className="text-muted-foreground">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} -{" "}
            {address.pincode}
          </p>
          <p className="mt-2 text-muted-foreground">
            Payment method: {String(order.payment_method).toUpperCase()}
          </p>
        </section>

        <div className="mt-6 flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <FileDown className="mr-1 size-4" /> Download invoice
          </Button>
          <Button asChild variant="outline">
            <Link to="/shop">Continue shopping</Link>
          </Button>
          <Button asChild>
            <Link to="/orders">My orders</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
