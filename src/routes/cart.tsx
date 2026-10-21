import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/Layout";
import { useCart } from "@/lib/cart";
import { computeTotals } from "@/lib/pricing";
import { inr } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — MK Enterprises" }, { name: "description", content: "Review the items in your cart." }, { property: "og:title", content: "Your Cart — MK Enterprises" }, { property: "og:description", content: "Review your cart." }] }),
  component: CartPage,
});

export function Summary({ t }: { t: ReturnType<typeof computeTotals> }) {
  const row = (l: string, v: string, cls = "") => <div className={`flex justify-between text-sm ${cls}`}><span>{l}</span><span>{v}</span></div>;
  return (
    <div className="space-y-2">
      {row("Subtotal", inr(t.subtotal))}
      {t.discount > 0 && row(`Discount (${t.coupon})`, "−" + inr(t.discount), "text-success")}
      {row("Shipping", t.shipping ? inr(t.shipping) : "FREE")}
      {t.codFee > 0 && row("COD fee", inr(t.codFee))}
      <div className="flex justify-between border-t pt-3 text-lg font-semibold"><span>Total</span><span>{inr(t.total)}</span></div>
      <p className="text-xs text-muted-foreground">Prices inclusive of GST</p>
    </div>
  );
}

function CartPage() {
  const { lines, setQty, remove, coupon, setCoupon } = useCart();
  const t = computeTotals(lines, coupon, null);
  return (
    <>
      <PageHero title="Your Cart" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {t.items.length === 0 ? (
          <div className="py-16 text-center"><p className="text-muted-foreground">Your cart is empty.</p><Button className="mt-6" asChild><Link to="/shop">Continue Shopping</Link></Button></div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              {t.items.map((i) => (
                <div key={i.sku} className="flex gap-4 rounded-md border border-gold-dark/30 bg-card p-4">
                  <img src={i.image} alt={i.name} className="h-24 w-24 rounded object-cover" />
                  <div className="flex-1">
                    <Link to="/product/$slug" params={{ slug: i.slug }} className="font-semibold">{i.name}</Link>
                    <p className="text-xs text-muted-foreground">{i.variant}</p>
                    <p className="mt-1 font-semibold">{inr(i.price * i.qty)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button aria-label="Decrease" onClick={() => setQty(i.sku, i.qty - 1)} className="rounded border p-1"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm">{i.qty}</span>
                      <button aria-label="Increase" onClick={() => setQty(i.sku, i.qty + 1)} className="rounded border p-1"><Plus className="h-3 w-3" /></button>
                      <button aria-label="Remove" onClick={() => remove(i.sku)} className="ml-auto text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-fit space-y-4 rounded-md border border-gold-dark/40 bg-card p-5">
              <h3 className="uppercase tracking-brand">Order Summary</h3>
              <Input placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              {t.couponError && <p className="text-xs text-destructive">{t.couponError}</p>}
              <Summary t={t} />
              <Button className="w-full" size="lg" asChild><Link to="/checkout">Proceed to Checkout</Link></Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
