import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, concerns, products } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  validateSearch: z.object({ concern: z.string().optional(), q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Shop All Products — MK Enterprises" },
      { name: "description", content: "Browse all Ayurvedic syrups, tablets, capsules, oils and herbal sachets from MK Enterprises." },
      { property: "og:title", content: "Shop All Products — MK Enterprises" },
      { property: "og:description", content: "Browse the full MK Enterprises herbal range." },
    ],
  }),
  component: Shop,
});

export function ProductGrid({ fixedCategory, search = {} }: { fixedCategory?: string; search?: { concern?: string | undefined; q?: string | undefined } }) {
  const [q, setQ] = useState(search.q ?? "");
  const [cat, setCat] = useState(fixedCategory ?? "");
  const [concern, setConcern] = useState(search.concern ?? "");
  const [sort, setSort] = useState("featured");
  const list = useMemo(() => {
    let l = products.filter((p) => (!cat || p.category === cat) && (!concern || p.concern.includes(concern)) && (!q || p.name.toLowerCase().includes(q.toLowerCase())));
    if (sort === "low") l = [...l].sort((a, b) => a.variants[0].price - b.variants[0].price);
    if (sort === "high") l = [...l].sort((a, b) => b.variants[0].price - a.variants[0].price);
    return l;
  }, [q, cat, concern, sort]);
  const sel = "h-9 rounded-md border border-input bg-card px-3 text-sm";
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap gap-3">
        <Input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs bg-card" />
        {!fixedCategory && (
          <select aria-label="Category" className={sel} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        )}
        <select aria-label="Concern" className={sel} value={concern} onChange={(e) => setConcern(e.target.value)}>
          <option value="">All concerns</option>
          {concerns.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select aria-label="Sort" className={sel} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>
      {list.length === 0 ? <p className="py-16 text-center text-muted-foreground">No products found. <Link to="/shop" className="text-gold-dark underline">Clear filters</Link></p> : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}

function Shop() {
  const search = Route.useSearch();
  return (
    <>
      <PageHero title="All Products" sub={`${products.length} herbal wellness products`} />
      <ProductGrid search={search} key={search.concern ?? ""} />
    </>
  );
}
