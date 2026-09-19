import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type Address = {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
};

export function profileQuery(userId?: string) {
  return queryOptions({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, email")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as Profile) ?? null;
    },
  });
}

export function addressesQuery(userId?: string) {
  return queryOptions({
    queryKey: ["addresses", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Address[]> => {
      const { data, error } = await supabase
        .from("addresses")
        .select("id, label, full_name, phone, line1, line2, city, state, pincode, is_default")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Address[];
    },
  });
}

export type Pincode = {
  pincode: string;
  city: string | null;
  state: string | null;
  delivery_charge: number;
  free_above: number | null;
  delivery_days: number;
  cod_available: boolean;
  is_active: boolean;
};

export async function lookupPincode(pincode: string): Promise<Pincode | null> {
  const { data, error } = await supabase
    .from("pincodes")
    .select("pincode, city, state, delivery_charge, free_above, delivery_days, cod_available, is_active")
    .eq("pincode", pincode.trim())
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return (data as Pincode) ?? null;
}

export function estimatedDelivery(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
