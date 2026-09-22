import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { couponDiscount, formatINR, lookupCoupon, type Coupon } from "@/lib/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | SivakasiCrackers" },
      {
        name: "description",
        content:
          "Review your cracker order, update quantities, apply a coupon code and see your total before checkout.",
      },
      { property: "og:title", content: "Your Cart | SivakasiCrackers" },
      {
        property: "og:description",
        content: "Review your festival cracker order and apply discount coupons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, savings, setQuantity, removeItem } = useCart();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [checking, setChecking] = useState(false);

  const discount = coupon ? couponDiscount(coupon, subtotal) : 0;
  const deliveryCharge = subtotal === 0 || subtotal >= 2000 ? 0 : 120;
  const total = Math.max(subtotal - discount + deliveryCharge, 0);

  async function applyCoupon() {
    if (!code.trim()) return;
    setChecking(true);
    try {
      const found = await lookupCoupon(code);
      if (!found) {
        setCoupon(null);
        toast.error("That coupon code is not valid");
        return;
      }
      if (subtotal < Number(found.min_order_amount)) {
        setCoupon(null);
        toast.error(`Add items worth ${formatINR(Number(found.min_order_amount))} to use this coupon`);
        return;
      }
      setCoupon(found);
      toast.success(`Coupon ${found.code} applied`);
    } catch {
      toast.error("Could not check the coupon. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border bg-card p-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4">
              <Link to="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 rounded-xl border bg-card p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    width={816}
                    height={816}
                    className="size-24 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <Link
                      to="/product/$slug"
                      params={{ slug: item.slug }}
                      className="font-semibold hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatINR(item.price)} each · saves {formatINR(item.mrp - item.price)}
                    </p>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex items-center rounded-lg border">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="w-10 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Increase quantity"
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="mr-1 size-4" /> Remove
                      </Button>
                    </div>
                  </div>
                  <div className="text-right font-bold">{formatINR(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-xl border bg-card p-4">
              <h2 className="text-lg font-bold">Order summary</h2>
              <div className="mt-4 flex gap-2">
                <Input
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="Coupon code"
                />
                <Button onClick={applyCoupon} disabled={checking} variant="secondary">
                  Apply
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Try DIWALI10, FESTIVE500 or FIRST100.
              </p>

              <Separator className="my-4" />
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-success">
                  <dt>You save</dt>
                  <dd>-{formatINR(savings)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <dt>Coupon {coupon?.code}</dt>
                    <dd>-{formatINR(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Delivery</dt>
                  <dd>{deliveryCharge === 0 ? "Free" : formatINR(deliveryCharge)}</dd>
                </div>
              </dl>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
              <Button asChild className="mt-4 w-full" size="lg">
                <Link to="/checkout">Proceed to checkout</Link>
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link to="/shop">Continue shopping</Link>
              </Button>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
