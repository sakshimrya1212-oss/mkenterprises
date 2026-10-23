import { findVariant } from "./products";

export const FREE_SHIPPING_MIN = 499;
export const SHIPPING_FEE = 49;
export const COD_FEE = 0;
export const COD_MAX_TOTAL = 5000;
export const COUPONS: Record<string, { pct: number; min: number }> = {
  MK15: { pct: 15, min: 499 },
};

export type CartLine = { sku: string; qty: number };

export function computeTotals(lines: CartLine[], coupon: string | null | undefined, method: "cod" | "online" | null) {
  const items = lines
    .map((l) => {
      const f = findVariant(l.sku);
      if (!f || l.qty < 1) return null;
      const qty = Math.min(Math.floor(l.qty), 20);
      return { sku: l.sku, qty, name: f.product.name, variant: f.variant.label, price: f.variant.price, image: f.product.images[0], slug: f.product.slug };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const code = coupon?.trim().toUpperCase() || null;
  const c = code ? COUPONS[code] : undefined;
  const couponValid = !!c && subtotal >= c.min;
  const discount = couponValid ? Math.round((subtotal * c!.pct) / 100) : 0;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const pre = subtotal - discount + shipping;
  const codAllowed = pre <= COD_MAX_TOTAL;
  const codFee = method === "cod" ? COD_FEE : 0;
  return { items, subtotal, discount, shipping, codFee, total: pre + codFee, coupon: couponValid ? code : null, couponError: code && !couponValid ? (c ? `Minimum order ₹${c.min} for ${code}` : "Invalid coupon") : null, codAllowed };
}
