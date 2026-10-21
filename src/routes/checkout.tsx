import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { computeTotals } from "@/lib/pricing";
import { createOrder } from "@/lib/orders.functions";
import { Summary } from "./cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — MK Enterprises" }, { name: "description", content: "Secure checkout." }, { property: "og:title", content: "Checkout — MK Enterprises" }, { property: "og:description", content: "Secure checkout." }] }),
  component: Checkout,
});

function Checkout() {
  const { lines, coupon, clear } = useCart();
  const nav = useNavigate();
  const place = useServerFn(createOrder);
  const [method, setMethod] = useState<"cod" | "online">("cod");
  const [busy, setBusy] = useState(false);
  const [a, setA] = useState({ name: "", phone: "", email: "", line1: "", line2: "", landmark: "", pincode: "", city: "", state: "" });
  const t = computeTotals(lines, coupon, method);
  const f = (k: keyof typeof a, label: string, extra = {}) => (
    <Input placeholder={label} value={a[k]} onChange={(e) => setA({ ...a, [k]: e.target.value })} {...extra} />
  );

  const submit = async () => {
    setBusy(true);
    try {
      const { data: s } = await supabase.auth.getSession();
      const r = await place({ data: { lines, coupon, method, address: a, accessToken: s.session?.access_token ?? null } });
      clear();
      nav({ to: "/track-order" });
      toast.success(`Order ${r.orderNumber} placed! Save this ID to track your order.`, { duration: 15000 });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  };

  if (t.items.length === 0) return <div className="py-20 text-center"><p className="text-muted-foreground">Your cart is empty.</p><Button className="mt-4" asChild><Link to="/shop">Shop Now</Link></Button></div>;
  return (
    <>
      <PageHero title="Checkout" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <section className="space-y-3 rounded-md border bg-card p-5">
            <h3 className="uppercase tracking-brand">1. Contact & Address</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {f("name", "Full name")}
              {f("phone", "Mobile (10 digits)", { maxLength: 10 })}
              {f("email", "Email (optional)")}
              {f("pincode", "Pincode", { maxLength: 6 })}
            </div>
            {f("line1", "Address line 1")}
            {f("line2", "Address line 2")}
            <div className="grid gap-3 sm:grid-cols-3">{f("landmark", "Landmark")}{f("city", "City")}{f("state", "State")}</div>
          </section>
          <section className="space-y-3 rounded-md border bg-card p-5">
            <h3 className="uppercase tracking-brand">2. Shipping Policy</h3>
            <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-gold-dark">1.</span>
                <span><b>Dispatch & Courier:</b> Orders are processed and dispatched within 24–48 hours through certified express couriers across India.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-gold-dark">2.</span>
                <span><b>Delivery Timeline:</b> Estimated doorstep delivery within 3–7 working days with full tracking updates.</span>
              </li>
            </ul>
          </section>
        </div>
        <div className="h-fit space-y-4 rounded-md border border-gold-dark/40 bg-card p-5 md:sticky md:top-32">
          <h3 className="uppercase tracking-brand">Order Summary</h3>
          {t.items.map((i) => <p key={i.sku} className="text-sm">{i.name} × {i.qty}</p>)}
          <Summary t={t} />
          <Button className="w-full" size="lg" disabled={busy} onClick={submit}>{busy ? "Placing…" : "Place Order"}</Button>
        </div>
      </div>
    </>
  );
}
