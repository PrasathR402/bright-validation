import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AddressForm } from "@/components/shop/AddressForm";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { addressesQuery, profileQuery } from "@/lib/account";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account | SivakasiCrackers" },
      {
        name: "description",
        content: "Manage your SivakasiCrackers profile details and saved delivery addresses.",
      },
      { property: "og:title", content: "My account | SivakasiCrackers" },
      { property: "og:description", content: "Your profile and saved delivery addresses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(profileQuery(user?.id));
  const { data: addresses = [] } = useQuery(addressesQuery(user?.id));

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);
    if (error) {
      toast.error("Could not save your details");
      return;
    }
    toast.success("Details saved");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  async function removeAddress(id: string) {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) {
      toast.error("Could not remove the address");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["addresses"] });
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My account</h1>
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </div>

        <form onSubmit={saveProfile} className="mt-6 space-y-4 rounded-xl border bg-card p-4">
          <h2 className="text-lg font-bold">Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNo">Mobile number</Label>
              <Input id="phoneNo" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Signed in as {user?.email ?? user?.phone}</p>
          <Button type="submit">Save details</Button>
        </form>

        <section className="mt-6 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Saved addresses</h2>
            <Button variant="secondary" onClick={() => setAdding((v) => !v)}>
              {adding ? "Cancel" : "Add address"}
            </Button>
          </div>

          {adding && (
            <div className="mt-4">
              <AddressForm
                userId={user?.id}
                onSaved={() => {
                  setAdding(false);
                  queryClient.invalidateQueries({ queryKey: ["addresses"] });
                }}
              />
            </div>
          )}

          <Separator className="my-4" />

          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No addresses saved yet.</p>
          ) : (
            <ul className="space-y-3">
              {addresses.map((address) => (
                <li key={address.id} className="flex items-start justify-between rounded-lg border p-3">
                  <div className="text-sm">
                    <p className="font-semibold">
                      {address.full_name} · {address.phone}
                    </p>
                    <p className="text-muted-foreground">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} -{" "}
                      {address.pincode}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove address"
                    className="text-destructive"
                    onClick={() => removeAddress(address.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
