import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { discountPct, inr, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const { add, wishlist, toggleWish } = useCart();
  const va = product.variants[0];
  const wished = wishlist.includes(product.slug);
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md border border-gold-dark/40 bg-card transition hover:shadow-gold">
      <span className="absolute left-2 top-2 z-10 rounded-sm bg-ink px-2 py-0.5 text-[10px] font-semibold text-gold">{discountPct(va)}% OFF</span>
      <button aria-label="Add to wishlist" onClick={() => toggleWish(product.slug)} className="absolute right-2 top-2 z-10 rounded-full bg-card/90 p-1.5">
        <Heart className={`h-4 w-4 ${wished ? "fill-gold text-gold" : "text-ink"}`} />
      </button>
      <Link to="/product/$slug" params={{ slug: product.slug }} className="relative flex aspect-square items-center justify-center overflow-hidden bg-card p-3">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          loading="lazy" 
          className={`h-full w-full object-contain transition-all duration-500 ${
            product.images.length > 1 ? "group-hover:opacity-0 group-hover:scale-95" : "group-hover:scale-105"
          }`} 
        />
        {product.images.length > 1 && (
          <img
            src={product.images[1]}
            alt={`${product.name} poster preview`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-3 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
          />
        )}
        {product.images.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white/80 opacity-0 transition group-hover:opacity-100">
            +{product.images.length - 1} Posters
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="font-display text-sm font-semibold leading-snug hover:text-gold-dark">
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground">{va.label}</p>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="font-semibold">{inr(va.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{inr(va.mrp)}</span>
        </div>
        <Button size="sm" onClick={() => add(va.sku)}>Add to Cart</Button>
      </div>
    </div>
  );
}
