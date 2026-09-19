import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { discountPercent, formatINR, productImage, type Product } from "@/lib/shop";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const image = productImage(product);
  const off = discountPercent(Number(product.mrp), Number(product.price));
  const inStock = product.stock > 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="relative block">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          width={816}
          height={816}
          className="aspect-square w-full object-cover"
        />
        {off > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            {off}% OFF
          </span>
        )}
        {product.is_new_arrival && (
          <span className="absolute right-2 top-2 rounded-full bg-gold px-2 py-1 text-xs font-semibold text-gold-foreground">
            New
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 text-sm font-semibold hover:text-primary sm:text-base"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">{formatINR(Number(product.price))}</span>
          {Number(product.mrp) > Number(product.price) && (
            <span className="text-sm text-muted-foreground line-through">
              {formatINR(Number(product.mrp))}
            </span>
          )}
        </div>
        <p className={`text-xs ${inStock ? "text-success" : "text-destructive"}`}>
          {inStock ? `In stock · ${product.stock} ${product.unit ?? "pcs"} left` : "Out of stock"}
        </p>
        <Button
          size="sm"
          className="mt-auto w-full"
          disabled={!inStock}
          onClick={() => {
            addItem({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: Number(product.price),
              mrp: Number(product.mrp),
              image,
              stock: product.stock,
            });
            toast.success(`${product.name} added to cart`);
          }}
        >
          <ShoppingCart className="mr-1 size-4" /> Add to cart
        </Button>
      </div>
    </div>
  );
}
