import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/lib/cart";
import { computeTotals, FREE_SHIPPING_MIN } from "@/lib/pricing";
import { inr } from "@/lib/products";

export function CartDrawer() {
  const { lines, drawerOpen, setDrawerOpen, setQty, remove, coupon, setCoupon } = useCart();
  const t = computeTotals(lines, coupon, null);
  const left = Math.max(0, FREE_SHIPPING_MIN - t.subtotal);
  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="uppercase tracking-brand">Your Cart</SheetTitle>
        </SheetHeader>
        {t.items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Your cart is empty.</p>
        ) : (
          <>
            <div className="rounded-md bg-muted p-3 text-xs">
              {left > 0 ? <>Add <b>{inr(left)}</b> more for FREE shipping</> : <>You've unlocked <b>FREE shipping</b>!</>}
              <Progress value={Math.min(100, (t.subtotal / FREE_SHIPPING_MIN) * 100)} className="mt-2 h-1.5" />
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto py-2">
              {t.items.map((i) => (
                <div key={i.sku} className="flex gap-3">
                  <img src={i.image} alt={i.name} className="h-16 w-16 rounded border object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.variant} · {inr(i.price)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button aria-label="Decrease" onClick={() => setQty(i.sku, i.qty - 1)} className="rounded border p-1"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm">{i.qty}</span>
                      <button aria-label="Increase" onClick={() => setQty(i.sku, i.qty + 1)} className="rounded border p-1"><Plus className="h-3 w-3" /></button>
                      <button aria-label="Remove" onClick={() => remove(i.sku)} className="ml-auto text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t pt-4">
              <Input placeholder="Coupon code (try MK15)" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              {t.couponError && <p className="text-xs text-destructive">{t.couponError}</p>}
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{inr(t.subtotal)}</span></div>
              {t.discount > 0 && <div className="flex justify-between text-sm text-success"><span>Discount ({t.coupon})</span><span>−{inr(t.discount)}</span></div>}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" asChild onClick={() => setDrawerOpen(false)}><Link to="/cart">View Cart</Link></Button>
                <Button asChild onClick={() => setDrawerOpen(false)}><Link to="/checkout">Checkout</Link></Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
