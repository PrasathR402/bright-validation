import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-deep text-deep-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold">SivakasiCrackers</h3>
          <p className="mt-2 text-sm opacity-80">
            Festival crackers straight from Sivakasi at factory prices. Safe packing and on-time
            delivery for your celebrations.
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Shop</h4>
          <ul className="mt-2 space-y-1 text-sm opacity-80">
            <li>
              <Link to="/shop">All products</Link>
            </li>
            <li>
              <Link to="/category/$slug" params={{ slug: "gift-boxes" }}>
                Gift boxes
              </Link>
            </li>
            <li>
              <Link to="/category/$slug" params={{ slug: "combo-packs" }}>
                Combo packs
              </Link>
            </li>
            <li>
              <Link to="/cart">Cart</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Safety first</h4>
          <p className="mt-2 text-sm opacity-80">
            Burn crackers only in open spaces, keep water nearby and let children celebrate under
            adult supervision.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} SivakasiCrackers. All rights reserved.
      </div>
    </footer>
  );
}
