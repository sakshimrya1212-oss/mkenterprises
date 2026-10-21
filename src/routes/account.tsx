import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — MK Enterprises" }, { name: "description", content: "Sign in to your account." }, { property: "og:title", content: "My Account — MK Enterprises" }, { property: "og:description", content: "Sign in to your account." }] }),
  component: Account,
});

function Account() {
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [user, setUser] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  if (loc.pathname !== "/account") return <Outlet />;
  const auth = async (mode: "in" | "up") => {
    const r = mode === "in" ? await supabase.auth.signInWithPassword({ email, password: pw }) : await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin } });
    if (r.error) {
      toast.error(r.error.message);
      return;
    }
    if (mode === "up") toast.success("Check your email to confirm your account.");
  };
  return (
    <>
      <PageHero title="My Account" />
      <div className="mx-auto max-w-sm space-y-3 px-4 py-12">
        {user ? (
          <>
            <p className="text-sm">Signed in as <b>{user}</b></p>
            <Button variant="secondary" className="w-full" onClick={() => supabase.auth.signOut()}>Sign out</Button>
          </>
        ) : (
          <>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <div className="grid grid-cols-2 gap-2"><Button onClick={() => auth("in")}>Sign in</Button><Button variant="secondary" onClick={() => auth("up")}>Sign up</Button></div>
            <Button variant="outline" className="w-full" onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })}>Continue with Google</Button>
          </>
        )}
      </div>
    </>
  );
}
