import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type AuthSearch = { redirect?: string | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: typeof search['redirect'] === "string" ? (search['redirect'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in | SivakasiCrackers" },
      {
        name: "description",
        content:
          "Sign in to SivakasiCrackers with your mobile number and OTP or with your email to track orders and save delivery addresses.",
      },
      { property: "og:title", content: "Sign in | SivakasiCrackers" },
      {
        property: "og:description",
        content: "Mobile OTP or email sign in for your cracker orders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const { user, loading } = useAuth();
  const target = search.redirect ?? "/account";

  useEffect(() => {
    if (!loading && user) navigate({ to: target, replace: true });
  }, [loading, user, navigate, target]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use your mobile number or email to place and track orders.
        </p>

        <Tabs defaultValue="mobile" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mobile">Mobile OTP</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>
          <TabsContent value="mobile">
            <MobileForm />
          </TabsContent>
          <TabsContent value="email">
            <EmailForm />
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}

function MobileForm() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  function fullPhone() {
    const digits = phone.replace(/\D/g, "").slice(-10);
    return `+91${digits}`;
  }

  async function sendOtp() {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Enter a valid 10 digit mobile number");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone() });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("OTP sent to your mobile");
  }

  async function verify() {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone(),
      token: otp.trim(),
      type: "sms",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
  }

  return (
    <div className="mt-4 space-y-4 rounded-xl border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Mobile number</Label>
        <div className="flex items-center gap-2">
          <span className="rounded-md border px-3 py-2 text-sm text-muted-foreground">+91</span>
          <Input
            id="phone"
            inputMode="numeric"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="98765 43210"
            disabled={sent}
          />
        </div>
      </div>

      {sent && (
        <div className="space-y-2">
          <Label htmlFor="otp">Enter OTP</Label>
          <Input
            id="otp"
            inputMode="numeric"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="6 digit code"
          />
        </div>
      )}

      <Button className="w-full" disabled={busy} onClick={sent ? verify : sendOtp}>
        {sent ? "Verify and sign in" : "Send OTP"}
      </Button>
      {sent && (
        <Button variant="ghost" className="w-full" onClick={() => setSent(false)}>
          Change number
        </Button>
      )}
      <p className="text-xs text-muted-foreground">
        OTP messages need SMS sending switched on for the shop. If it is not ready yet, use email
        sign in.
      </p>
    </div>
  );
}

function EmailForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        toast.success("Check your email to confirm your account");
        return;
      }
      toast.success("Welcome to SivakasiCrackers");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4 rounded-xl border bg-card p-4">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {mode === "signup" ? "Create account" : "Sign in"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
      >
        {mode === "signup" ? "I already have an account" : "New here? Create an account"}
      </Button>
    </form>
  );
}
