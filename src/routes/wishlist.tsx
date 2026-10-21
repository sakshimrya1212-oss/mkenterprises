import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { useCart } from "@/lib/cart";
import { products } from "@/lib/products";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — MK Enterprises" }, { name: "description", content: "Your saved products." }, { property: "og:title", content: "Wishlist — MK Enterprises" }, { property: "og:description", content: "Your saved products." }] }),
  component: Wish,
});

function Wish() {
  const { wishlist } = useCart();
  const list = products.filter((p) => wishlist.includes(p.slug));
  return (
    <>
      <PageHero title="Wishlist" />
      <div className="mx-auto max-w-7xl px-4 py-10">
        {list.length === 0 ? <p className="text-center text-muted-foreground">No saved products yet.</p> : <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
    </>
  );
}
