import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bone, Droplet, Leaf, Shield, Sparkles, Star, Zap } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { Divider, SectionTitle } from "@/components/site/SectionTitle";
import { categories, concerns, products } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MK Enterprises — Premium Ayurvedic & Herbal Wellness" },
      { name: "description", content: "Shop Ayurvedic syrups, tablets, capsules, oils and herbal sachets. Free shipping over ₹499. UPI & COD available." },
      { property: "og:title", content: "MK Enterprises — Premium Ayurvedic & Herbal Wellness" },
      { property: "og:description", content: "Ayurvedic syrups, tablets, oils and herbal sachets delivered across India." },
    ],
  }),
  component: Index,
});

const icons = { Leaf, Bone, Shield, Droplet, Sparkles, Zap };
const slides = [
  { img: hero1, title: "Nature's Gold, Bottled", sub: "Premium Ayurvedic formulations for everyday wellness." },
  { img: hero2, title: "Rooted in Ayurveda", sub: "Get 15% OFF on orders above ₹499 with code MK15." },
];

function Index() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setS((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);
  const best = products.filter((p) => p.tags.includes("bestseller"));
  const fresh = products.filter((p) => p.tags.includes("new"));
  const catImg = (slug: string) => products.find((p) => p.category === slug)?.images[0];

  return (
    <>
      <section className="relative h-[420px] overflow-hidden bg-ink md:h-[520px]">
        {slides.map((sl, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === s ? "opacity-100" : "opacity-0"}`}>
            <img src={sl.img} alt="" width={1920} height={800} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-7xl px-6">
                <p className="text-xs uppercase tracking-brand text-gold">MK Enterprises</p>
                <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight text-gold-gradient md:text-6xl">{sl.title}</h1>
                <p className="mt-4 max-w-md text-ink-foreground/80">{sl.sub}</p>
                <Button size="lg" className="mt-8" asChild><Link to="/shop">Shop Now</Link></Button>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => setS(i)} className={`h-1.5 rounded-full transition-all ${i === s ? "w-8 bg-gold" : "w-3 bg-ink-foreground/40"}`} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle title="Select Your Concern" />
        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {concerns.map((c) => {
            const I = icons[c.icon];
            return (
              <Link key={c.slug} to="/shop" search={{ concern: c.slug }} className="group flex flex-col items-center gap-3 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-gold-dark bg-ink text-gold transition group-hover:shadow-gold"><I className="h-8 w-8" /></span>
                <span className="text-xs font-semibold uppercase tracking-wider">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <SectionTitle title="Our Bestsellers" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{best.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        <div className="mt-8 text-center"><Button variant="secondary" asChild><Link to="/shop">View All</Link></Button></div>
      </section>

      <section className="bg-ink py-16 text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl uppercase tracking-brand text-gold md:text-3xl">Shop By Category</h2>
            <Divider className="mt-3" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {categories.map((c) => (
              <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group overflow-hidden rounded-md border border-gold-dark/50">
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-card p-3"><img src={catImg(c.slug)} alt={c.name} loading="lazy" className="h-full w-full object-contain transition duration-500 group-hover:scale-105" /></div>
                <p className="bg-ink-soft py-3 text-center text-xs font-semibold uppercase tracking-widest text-gold">{c.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-gold-dark/40 bg-gold-gradient py-3">
        <div className="marquee flex w-max gap-12 whitespace-nowrap text-sm font-semibold uppercase tracking-widest text-primary-foreground">
          {Array.from({ length: 2 }).flatMap((_, k) => ["Ayurvedic Formulations", "Premium Quality", "Pan-India Delivery", "Secure Payments", "Cash on Delivery"].map((t) => <span key={k + t}>◆ {t}</span>))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="relative overflow-hidden rounded-md bg-ink p-10 text-center text-ink-foreground md:p-16">
          <p className="text-xs uppercase tracking-brand text-gold">Limited Offer</p>
          <h2 className="mt-3 text-3xl text-gold-gradient md:text-5xl">Flat 15% OFF</h2>
          <p className="mt-3 text-ink-foreground/70">On orders above ₹499. Use code <b className="text-gold">MK15</b> at checkout.</p>
          <Button className="mt-6" asChild><Link to="/shop">Shop the Range</Link></Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <SectionTitle title="New Arrivals" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{fresh.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle title="What Customers Say" sub="Real reviews from our verified buyers across India." />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: "Deepak Agarwal", c: "Delhi", t: "Packaging was premium and delivery was quick. Happy with my order." },
            { n: "Amit Chandra Sharma", c: "Jaipur", t: "Easy to order on COD. The syrup tastes good and quality feels great." },
            { n: "Urmila Srivastava", c: "Lucknow", t: "Good range of products and helpful support on WhatsApp." },
          ].map((r) => (
            <div key={r.n} className="rounded-md border border-gold-dark/40 bg-card p-6">
              <div className="flex gap-1 text-gold">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold" />)}</div>
              <p className="mt-3 text-sm text-muted-foreground">"{r.t}"</p>
              <p className="mt-4 text-sm font-semibold">{r.n} <span className="font-normal text-muted-foreground">· {r.c}</span></p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
