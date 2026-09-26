import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Menu, Package, Search, ShoppingCart, Sparkles, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { categoriesQuery } from "@/lib/shop";

export function SiteHeader() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { count } = useCart();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: unread = 0 } = useQuery({
    queryKey: ["notifications", "unread", user?.id],
    enabled: !!user,
    refetchInterval: 60000,
    queryFn: async () => {
      const { count: c } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);
      return c ?? 0;
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  const [term, setTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    navigate({ to: "/shop", search: (prev) => ({ ...prev, q: term || undefined }) });
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
              <Link to="/new-arrivals" className="rounded-md px-2 py-2 text-sm font-semibold text-primary hover:bg-muted" onClick={() => setMenuOpen(false)}>
                New arrivals
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

        {user ? (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Link to="/notifications">
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-gold text-[11px] font-bold text-gold-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="My orders">
              <Link to="/orders">
                <Package className="size-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="My account">
              <Link to="/account">
                <User className="size-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Sign out" onClick={signOut}>
              <LogOut className="size-5" />
            </Button>
          </div>
        ) : (
          <Button asChild variant="secondary" size="sm">
            <Link to="/auth">
              <Package className="mr-1 size-4" /> Sign in
            </Link>
          </Button>
        )}
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
          <Link
            to="/new-arrivals"
            className="rounded-full bg-gold px-3 py-1.5 text-sm font-bold text-gold-foreground"
          >
            New Arrivals
          </Link>
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
