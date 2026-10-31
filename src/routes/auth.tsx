import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShoppingBag, Store } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ensureProfile } from "@/hooks/useAuth";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or join — ArtisanLink" },
      {
        name: "description",
        content:
          "Create an ArtisanLink account as an artisan to sell handmade crafts, or as a buyer to discover them.",
      },
      { property: "og:title", content: "Sign in or join ArtisanLink" },
      {
        property: "og:description",
        content: "One account for artisans and buyers of handmade Indian crafts.",
      },
    ],
  }),
  component: AuthPage,
});

type Role = "artisan" | "buyer";

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"login" | "signup">(search.mode ?? "login");
  const [role, setRole] = useState<Role>("artisan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const profile = await ensureProfile(data.user);
      navigate({
        to: profile?.role === "buyer" ? "/buyer-dashboard" : "/artisan-dashboard",
        replace: true,
      });
    });
  }, [navigate]);

  async function goToDashboard() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const profile = await ensureProfile(data.user);
    navigate({
      to: profile?.role === "buyer" ? "/buyer-dashboard" : "/artisan-dashboard",
      replace: true,
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    setBusy(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name: name.trim(), role },
        },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        setConfirmSent(true);
        toast.success("Check your email to confirm your account.");
        return;
      }
      toast.success("Welcome to ArtisanLink!");
      await goToDashboard();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in.");
    await goToDashboard();
  }

  if (confirmSent) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-md px-5 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">Confirm your email</h1>
          <p className="mt-3 text-muted-foreground">
            We sent a link to <span className="font-medium text-foreground">{email}</span>. Open it
            to finish creating your account, then come back and sign in.
          </p>
          <Button
            variant="outline"
            size="touch"
            className="mt-6"
            onClick={() => {
              setConfirmSent(false);
              setMode("login");
            }}
          >
            Back to sign in
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-md px-5 py-10">
        <h1 className="font-display text-3xl font-semibold">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {mode === "signup"
            ? "Tell us who you are, and we will set up the right home screen for you."
            : "Sign in to manage your shop or saved crafts."}
        </p>

        <form onSubmit={submit} className="surface-card mt-6 space-y-5 p-5">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label className="text-base">I am a…</Label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "artisan", label: "I'm an Artisan", Icon: Store },
                    { value: "buyer", label: "I'm a Buyer", Icon: ShoppingBag },
                  ] as const
                ).map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    aria-pressed={role === value}
                    className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center text-sm font-medium transition-colors ${
                      role === value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="size-6" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">
                Your name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kamala Devi"
                className="h-14 text-base"
                autoComplete="name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-14 text-base"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="h-14 text-base"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>

          <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>
            {busy && <Loader2 className="size-5 animate-spin" />}
            {mode === "signup" ? "Sign up" : "Sign in"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to ArtisanLink?"}{" "}
            <button
              type="button"
              className="font-semibold text-primary underline"
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}
