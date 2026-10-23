import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus, Truck, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductImageGallery } from "@/components/site/ProductImageGallery";
import { DISCLAIMER, SectionTitle } from "@/components/site/SectionTitle";
import { useCart } from "@/lib/cart";
import { categories, discountPct, getProduct, inr, products } from "@/lib/products";
import { videoReviews } from "@/components/site/VideoTestimonials";

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
  const [vi, setVi] = useState(0);
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const { add, wishlist, toggleWish, setDrawerOpen } = useCart();
  const nav = useNavigate();
  const va = p.variants[vi] ?? p.variants[0];
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4);
  const soldOut = va.stock <= 0;
  const productReviews = videoReviews.filter((r) => r.productSlug === p.slug);

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
          {/* Enhanced Ecommerce Product Gallery & Slider */}
          <ProductImageGallery images={p.images} productName={p.name} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold">{p.name}</h1>
          <p className="mt-2 text-muted-foreground">{p.short}</p>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{inr(va.price)}</span>
            {va.mrp > va.price && (
              <>
                <span className="text-muted-foreground line-through">{inr(va.mrp)}</span>
                <span className="rounded-sm bg-ink px-2 py-0.5 text-xs font-semibold text-gold">{discountPct(va)}% OFF</span>
              </>
            )}
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
            <TabsList className="w-full flex justify-start overflow-x-auto">
              <TabsTrigger value="desc">Description</TabsTrigger>
              <TabsTrigger value="use">How to Use</TabsTrigger>
              {p.images.length > 1 && (
                <TabsTrigger value="posters" className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  Posters ({p.images.length - 1})
                </TabsTrigger>
              )}
              <TabsTrigger value="reviews">Reviews {productReviews.length > 0 ? `(${productReviews.length})` : ""}</TabsTrigger>
            </TabsList>
            <TabsContent value="desc" className="text-sm text-muted-foreground">
              <p>{p.short}</p>
              <ul className="mt-3 list-inside list-disc space-y-1">{p.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
              <p className="mt-3">Ingredients: please refer to the product label & formulation posters.</p>
            </TabsContent>
            <TabsContent value="use" className="text-sm text-muted-foreground">{p.howToUse}</TabsContent>
            {p.images.length > 1 && (
              <TabsContent value="posters" className="pt-2">
                <p className="text-xs text-muted-foreground mb-3">Clinical and informative posters for {p.name}:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {p.images.slice(1).map((posterSrc, idx) => (
                    <div key={idx} className="group relative rounded-lg border border-gold-dark/30 bg-card p-2 overflow-hidden shadow-sm hover:border-gold">
                      <img src={posterSrc} alt={`${p.name} poster ${idx + 1}`} className="w-full h-auto object-contain transition group-hover:scale-102" />
                      <p className="mt-2 text-[11px] font-medium text-center text-foreground">Clinical Guide {idx + 1}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
            <TabsContent value="reviews" className="text-sm text-muted-foreground">
              {productReviews.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {productReviews.map((pr) => (
                    <div key={pr.id} className="rounded-lg border border-gold/30 bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{pr.name}</p>
                          <p className="text-xs text-muted-foreground">{pr.location} · Verified Buyer</p>
                        </div>
                        <div className="flex gap-0.5 text-gold">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-gold" />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-xs italic text-foreground/80">"{pr.quote}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border p-4 text-center">
                  <p>Verified reviews are currently being compiled for this batch.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Check out customer video reviews on our homepage!</p>
                </div>
              )}
            </TabsContent>
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
