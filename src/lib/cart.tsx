import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartLine } from "./pricing";

type Ctx = {
  lines: CartLine[];
  wishlist: string[];
  coupon: string;
  setCoupon: (c: string) => void;
  add: (sku: string, qty?: number) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  toggleWish: (slug: string) => void;
  drawerOpen: boolean;
  setDrawerOpen: (o: boolean) => void;
  count: number;
};
const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWish] = useState<string[]>([]);
  const [coupon, setCoupon] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setLines(JSON.parse(localStorage.getItem("mk_cart") || "[]"));
      setWish(JSON.parse(localStorage.getItem("mk_wish") || "[]"));
      setCoupon(localStorage.getItem("mk_coupon") || "");
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("mk_cart", JSON.stringify(lines));
    localStorage.setItem("mk_wish", JSON.stringify(wishlist));
    localStorage.setItem("mk_coupon", coupon);
  }, [lines, wishlist, coupon, loaded]);

  const add = (sku: string, qty = 1) => {
    setLines((ls) => {
      const e = ls.find((l) => l.sku === sku);
      return e ? ls.map((l) => (l.sku === sku ? { ...l, qty: Math.min(l.qty + qty, 20) } : l)) : [...ls, { sku, qty }];
    });
    setDrawerOpen(true);
  };
  const setQty = (sku: string, qty: number) =>
    setLines((ls) => (qty < 1 ? ls.filter((l) => l.sku !== sku) : ls.map((l) => (l.sku === sku ? { ...l, qty: Math.min(qty, 20) } : l))));
  const remove = (sku: string) => setLines((ls) => ls.filter((l) => l.sku !== sku));
  const toggleWish = (slug: string) => setWish((w) => (w.includes(slug) ? w.filter((x) => x !== slug) : [...w, slug]));

  return (
    <CartCtx.Provider value={{ lines, wishlist, coupon, setCoupon, add, setQty, remove, clear: () => { setLines([]); setCoupon(""); }, toggleWish, drawerOpen, setDrawerOpen, count: lines.reduce((s, l) => s + l.qty, 0) }}>
      {children}
    </CartCtx.Provider>
  );
}
export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
};
