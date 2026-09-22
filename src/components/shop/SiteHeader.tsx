import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Package, Search, ShoppingCart, Sparkles, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { categoriesQuery } from "@/lib/shop";

export function SiteHeader() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { count } = useCart();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    navigate({ to: "/shop", search: { q: term || undefined, category: undefined, sort: undefined } });
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="bg-deep px-4 py-1.5 text-center text-xs text-deep-foreground sm:text-sm">
        Festival season sale is live · Free delivery on orders above ₹2,000
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-4">
            <SheetTitle className="mb-4">Categories</SheetTitle>
            <nav className="flex flex-col gap-1">
              <Link to="/shop" className="rounded-md px-2 py-2 text-sm hover:bg-muted" onClick={() => setMenuOpen(false)}>
                All products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to="/category/$slug"
                  params={{ slug: category.slug }}
                  className="rounded-md px-2 py-2 text-sm hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="text-lg font-extrabold leading-none tracking-tight">
            Sivakasi<span className="text-primary">Crackers</span>
          </span>
        </Link>

        <form onSubmit={submitSearch} className="ml-auto hidden flex-1 max-w-md items-center gap-2 sm:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search sparklers, gift boxes, rockets…"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <Button asChild variant="ghost" size="icon" className="relative ml-auto sm:ml-2" aria-label="Cart">
          <Link to="/cart">
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </Button>
      </div>

      <form onSubmit={submitSearch} className="mx-auto flex max-w-6xl gap-2 px-4 pb-3 sm:hidden">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search crackers…"
            className="pl-9"
          />
        </div>
      </form>

      <nav className="hidden border-t bg-secondary/50 lg:block">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/category/$slug"
              params={{ slug: category.slug }}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
