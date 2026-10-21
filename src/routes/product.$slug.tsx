import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/site/ProductCard";
import { DISCLAIMER, SectionTitle } from "@/components/site/SectionTitle";
import { useCart } from "@/lib/cart";
import { categories, discountPct, getProduct, inr, products } from "@/lib/products";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return { slug: p.slug, name: p.name, short: p.short };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Product"} — MK Enterprises` },
      { name: "description", content: loaderData?.short ?? "Ayurvedic product from MK Enterprises." },
      { property: "og:title", content: `${loaderData?.name ?? "Product"} — MK Enterprises` },
      { property: "og:description", content: loaderData?.short ?? "" },
      { property: "og:type", content: "product" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useLoaderData();
  const p = getProduct(slug)!;
  const [img, setImg] = useState(0);
  const [vi, setVi] = useState(0);
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const { add, wishlist, toggleWish, setDrawerOpen } = useCart();
  const nav = useNavigate();
  const va = p.variants[vi] ?? p.variants[0];
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4);
  const soldOut = va.stock <= 0;
  const checkPin = () => {
    if (!/^\d{6}$/.test(pin)) return setPinMsg("Enter a valid 6-digit pincode");
    const d = new Date(Date.now() + 5 * 864e5).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    setPinMsg(`Delivery available. Estimated by ${d}. COD available.`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/">Home</Link> / <Link to="/category/$slug" params={{ slug: p.category }}>{categories.find((c) => c.slug === p.category)?.name}</Link> / {p.name}
      </nav>
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="group flex aspect-square items-center justify-center overflow-hidden rounded-md border border-gold-dark/40 bg-card p-4">
            <img src={p.images[img]} alt={p.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" />
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {p.images.map((s, i) => (
                <button key={i} onClick={() => setImg(i)} className={`h-20 w-20 overflow-hidden rounded border-2 p-1 ${i === img ? "border-gold" : "border-transparent"}`}>
                  <img src={s} alt={`${p.name} view ${i + 1}`} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-semibold">{p.name}</h1>
          <p className="mt-2 text-muted-foreground">{p.short}</p>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{inr(va.price)}</span>
            <span className="text-muted-foreground line-through">{inr(va.mrp)}</span>
            <span className="rounded-sm bg-ink px-2 py-0.5 text-xs font-semibold text-gold">{discountPct(va)}% OFF</span>
          </div>
          <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>

          {p.variants.length > 1 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider">Size</p>
              <div className="flex gap-2">
                {p.variants.map((x, i) => (
                  <button key={x.sku} onClick={() => setVi(i)} className={`rounded-md border px-4 py-2 text-sm ${i === vi ? "border-gold bg-accent font-semibold" : "border-input"}`}>{x.label}</button>
                ))}
              </div>
            </div>
          )}
          {p.variants.length === 1 && <p className="mt-6 text-sm"><b>Pack:</b> {va.label}</p>}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-md border">
              <button aria-label="Decrease" className="p-3" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center">{qty}</span>
              <button aria-label="Increase" className="p-3" onClick={() => setQty(Math.min(20, qty + 1))}><Plus className="h-4 w-4" /></button>
            </div>
            <button aria-label="Wishlist" onClick={() => toggleWish(p.slug)} className="rounded-md border p-3"><Heart className={`h-4 w-4 ${wishlist.includes(p.slug) ? "fill-gold text-gold" : ""}`} /></button>
          </div>
          {soldOut ? (
            <Button className="mt-6 w-full" variant="secondary" onClick={() => toast.success("We'll notify you when it's back in stock")}>Notify Me</Button>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button size="lg" variant="secondary" onClick={() => add(va.sku, qty)}>Add to Cart</Button>
              <Button size="lg" onClick={() => { add(va.sku, qty); setDrawerOpen(false); nav({ to: "/checkout" }); }}>Buy Now</Button>
            </div>
          )}

          <div className="mt-6 rounded-md border border-gold-dark/40 bg-card p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><Truck className="h-4 w-4 text-gold-dark" /> Check delivery</p>
            <div className="mt-2 flex gap-2">
              <Input placeholder="Pincode" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
              <Button variant="outline" onClick={checkPin}>Check</Button>
            </div>
            {pinMsg && <p className="mt-2 text-xs text-muted-foreground">{pinMsg}</p>}
          </div>

          <Tabs defaultValue="desc" className="mt-8">
            <TabsList>
              <TabsTrigger value="desc">Description</TabsTrigger>
              <TabsTrigger value="use">How to Use</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="desc" className="text-sm text-muted-foreground">
              <p>{p.short}</p>
              <ul className="mt-3 list-inside list-disc space-y-1">{p.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
              <p className="mt-3">Ingredients: please refer to the product label.</p>
            </TabsContent>
            <TabsContent value="use" className="text-sm text-muted-foreground">{p.howToUse}</TabsContent>
            <TabsContent value="reviews" className="text-sm text-muted-foreground">No reviews yet.</TabsContent>
          </Tabs>
          <p className="mt-6 rounded-md bg-muted p-3 text-[11px] text-muted-foreground">{DISCLAIMER}</p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <SectionTitle title="You May Also Like" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} product={r} />)}</div>
        </section>
      )}
    </div>
  );
}
