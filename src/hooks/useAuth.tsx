import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  user_id: string;
  role: string;
  name: string;
  email: string;
};

/** Makes sure a signed-in user has a profile row, using signup metadata. */
export async function ensureProfile(user: User): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, user_id, role, name, email")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return existing as Profile;

  const meta = (user.user_metadata ?? {}) as { name?: string; role?: string };
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      role: meta.role === "buyer" ? "buyer" : "artisan",
      name: meta.name ?? "",
      email: user.email ?? "",
    })
    .select("id, user_id, role, name, email")
    .maybeSingle();
  if (error) {
    console.error(error);
    return null;
  }
  return (data as Profile | null) ?? null;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      if (!next?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      void ensureProfile(next.user).then((p) => {
        if (active) {
          setProfile(p);
          setLoading(false);
        }
      });
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (!data.session?.user) {
        setLoading(false);
        return;
      }
      void ensureProfile(data.session.user).then((p) => {
        if (active) {
          setProfile(p);
          setLoading(false);
        }
      });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, profile, loading };
}
