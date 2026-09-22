import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export function AddressForm({
  userId,
  onSaved,
}: {
  userId?: string | undefined;
  onSaved: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        full_name: form.full_name,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2 || null,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error("Could not save the address");
      return;
    }
    toast.success("Address saved");
    onSaved(data.id);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="af-name">Full name</Label>
        <Input id="af-name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="af-phone">Mobile number</Label>
        <Input id="af-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="af-line1">Address line 1</Label>
        <Input id="af-line1" value={form.line1} onChange={(e) => update("line1", e.target.value)} required />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="af-line2">Address line 2 (optional)</Label>
        <Input id="af-line2" value={form.line2} onChange={(e) => update("line2", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="af-city">City</Label>
        <Input id="af-city" value={form.city} onChange={(e) => update("city", e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="af-state">State</Label>
        <Input id="af-state" value={form.state} onChange={(e) => update("state", e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="af-pincode">Pincode</Label>
        <Input
          id="af-pincode"
          inputMode="numeric"
          value={form.pincode}
          onChange={(e) => update("pincode", e.target.value)}
          required
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={busy} className="w-full">
          Save address
        </Button>
      </div>
    </form>
  );
}
