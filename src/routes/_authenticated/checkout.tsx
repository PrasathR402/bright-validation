import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AddressForm } from "@/components/shop/AddressForm";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import {
  addressesQuery,
  estimatedDelivery,
  formatDate,
  lookupPincode,
  type Address,
  type Pincode,
} from "@/lib/account";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { couponDiscount, formatINR, lookupCoupon, type Coupon } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | SivakasiCrackers" },
      {
        name: "description",
        content:
          "Choose a delivery address, check pincode serviceability, apply a coupon and place your cracker order.",
      },
      { property: "og:title", content: "Checkout | SivakasiCrackers" },
      { property: "og:description", content: "Place your festival cracker order securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, subtotal, clear } = useCart();
  const { data: addresses = [] } = useQuery(addressesQuery(user?.id));

  const [selectedId, setSelectedId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [serviceability, setServiceability] = useState<Pincode | null>(null);
  const [checked, setChecked] = useState(false);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [payment, setPayment] = useState("cod");
  const [placing, setPlacing] = useState(false);

  const selected: Address | undefined =
    addresses.find((row) => row.id === selectedId) ?? addresses[0];

  const discount = coupon ? couponDiscount(coupon, subtotal) : 0;
  const freeAbove = serviceability?.free_above ? Number(serviceability.free_above) : 2000;
  const deliveryCharge =
    serviceability && subtotal < freeAbove ? Number(serviceability.delivery_charge) : 0;
  const total = Math.max(subtotal - discount + deliveryCharge, 0);
  const codAllowed = serviceability?.cod_available ?? false;

  async function checkPincode() {
    if (!selected) {
      toast.error("Add a delivery address first");
      return;
    }
    const found = await lookupPincode(selected.pincode);
    setServiceability(found);
    setChecked(true);
    if (!found) {
      toast.error(`We do not deliver to ${selected.pincode} yet`);
      return;
    }
    if (!found.cod_available && payment === "cod") setPayment("upi");
    toast.success(`Delivery available to ${selected.pincode}`);
  }

  async function applyCoupon() {
    if (!code.trim()) return;
    const found = await lookupCoupon(code);
    if (!found || subtotal < Number(found.min_order_amount)) {
      setCoupon(null);
      toast.error("This coupon cannot be applied to your order");
      return;
    }
    setCoupon(found);
    toast.success(`Coupon ${found.code} applied`);
  }

  async function placeOrder() {
    if (!user || !selected) return;
    if (!serviceability) {
      toast.error("Check the delivery pincode first");
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);
    const orderNumber = `SC${Date.now().toString().slice(-9)}`;
    const eta = estimatedDelivery(serviceability.delivery_days);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "placed",
        payment_method: payment,
        payment_status: payment === "cod" ? "pending" : "pending",
        subtotal,
        discount,
        delivery_charge: deliveryCharge,
        total,
        coupon_code: coupon?.code ?? null,
        estimated_delivery: eta.toISOString().slice(0, 10),
        shipping_address: selected as unknown as Record<string, unknown>,
      })
      .select("id, order_number")
      .single();

    if (error || !order) {
      setPlacing(false);
      toast.error("Could not place the order. Please try again.");
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        image_url: item.image,
        unit_price: item.price,
        mrp: item.mrp,
        quantity: item.quantity,
        line_total: item.price * item.quantity,
      })),
    );

    setPlacing(false);
    if (itemsError) {
      toast.error("Order saved but items could not be added. Please contact us.");
      return;
    }

    clear();
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    navigate({ to: "/order/$id", params: { id: order.id } });
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <Button asChild className="mt-4">
            <Link to="/shop">Start shopping</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Checkout</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Delivery address</h2>
                <Button variant="secondary" size="sm" onClick={() => setAdding((v) => !v)}>
                  {adding ? "Cancel" : "Add new"}
                </Button>
              </div>

              {adding && (
                <div className="mt-4">
                  <AddressForm
                    userId={user?.id}
                    onSaved={(id) => {
                      setAdding(false);
                      setSelectedId(id);
                      setServiceability(null);
                      setChecked(false);
                      queryClient.invalidateQueries({ queryKey: ["addresses"] });
                    }}
                  />
                </div>
              )}

              {addresses.length > 0 && (
                <RadioGroup
                  className="mt-4 space-y-3"
                  value={selected?.id ?? ""}
                  onValueChange={(value) => {
                    setSelectedId(value);
                    setServiceability(null);
                    setChecked(false);
                  }}
                >
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm"
                    >
                      <RadioGroupItem value={address.id} className="mt-1" />
                      <span>
                        <span className="font-semibold">
                          {address.full_name} · {address.phone}
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                          {address.state} - {address.pincode}
                        </span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={checkPincode} disabled={!selected}>
                  Check delivery
                </Button>
                {checked && serviceability && (
                  <p className="text-sm text-success">
                    Delivers to {serviceability.pincode} by{" "}
                    {formatDate(estimatedDelivery(serviceability.delivery_days))}
                  </p>
                )}
                {checked && !serviceability && (
                  <p className="text-sm text-destructive">
                    Sorry, this pincode is not serviceable yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl border bg-card p-4">
              <h2 className="text-lg font-bold">Payment method</h2>
              <RadioGroup value={payment} onValueChange={setPayment} className="mt-4 space-y-3">
                {[
                  { value: "upi", label: "UPI" },
                  { value: "card", label: "Credit / Debit card" },
                  { value: "netbanking", label: "Net banking" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                    <RadioGroupItem value={option.value} />
                    {option.label}
                  </label>
                ))}
                <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  <RadioGroupItem value="cod" disabled={!codAllowed} />
                  Cash on delivery{" "}
                  {!codAllowed && (
                    <span className="text-xs text-muted-foreground">
                      (not available for this pincode)
                    </span>
                  )}
                </label>
              </RadioGroup>
              <p className="mt-3 text-xs text-muted-foreground">
                Online payments are collected after confirmation — card, UPI and net banking go live
                once the payment provider is connected.
              </p>
            </section>
          </div>

          <aside className="h-fit rounded-xl border bg-card p-4">
            <h2 className="text-lg font-bold">Order summary</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatINR(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <Separator className="my-4" />
            <div className="space-y-2">
              <Label htmlFor="coupon">Coupon code</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="DIWALI10"
                />
                <Button variant="secondary" onClick={applyCoupon}>
                  Apply
                </Button>
              </div>
            </div>

            <Separator className="my-4" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Coupon {coupon?.code}</dt>
                  <dd>-{formatINR(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd>
                  {!serviceability
                    ? "Check pincode"
                    : deliveryCharge === 0
                      ? "Free"
                      : formatINR(deliveryCharge)}
                </dd>
              </div>
            </dl>
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
            <Button className="mt-4 w-full" size="lg" onClick={placeOrder} disabled={placing}>
              Place order
            </Button>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
