import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { featuredProductPosters } from "@/lib/products";

export function ProductPostersSlider() {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const total = featuredProductPosters.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  const scrollTo = (index: number) => {
    setActive(index);
    if (scrollRef.current) {
      const target = scrollRef.current.children[index] as HTMLElement;
      if (target) {
        target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };

  const next = () => scrollTo((active + 1) % total);
  const prev = () => scrollTo((active - 1 + total) % total);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-dark/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-dark mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official Clinical & Formulation Guides</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-brand text-foreground">
            Featured Product Highlights
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Swipe through verified product posters and formulation blueprints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prev}
            aria-label="Previous poster"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-dark/40 bg-card text-foreground transition hover:border-gold hover:bg-accent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next poster"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-dark/40 bg-card text-foreground transition hover:border-gold hover:bg-accent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Posters Horizontal Slider */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {featuredProductPosters.map((poster, idx) => {
          const isSelected = idx === active;
          return (
            <div
              key={idx}
              onClick={() => setActive(idx)}
              className={`group relative flex-none w-[270px] sm:w-[320px] md:w-[360px] snap-center flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 bg-card cursor-pointer ${
                isSelected 
                  ? "border-gold ring-2 ring-gold/40 shadow-gold" 
                  : "border-gold-dark/30 hover:border-gold/60 hover:shadow-md"
              }`}
            >
              {/* Poster Image */}
              <div className="relative aspect-[4/5] w-full bg-black/5 overflow-hidden">
                <img
                  src={poster.img}
                  alt={poster.title}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 rounded-full bg-ink/80 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-gold border border-gold/30">
                  {poster.tag}
                </span>

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold text-ink shadow-lg">
                    <Eye className="h-3.5 w-3.5" />
                    Inspect Poster
                  </span>
                </div>
              </div>

              {/* Bottom Card Bar */}
              <div className="p-4 flex items-center justify-between gap-3 border-t border-border bg-card">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{poster.title}</h3>
                  <p className="text-xs text-muted-foreground">Clinical Infographic</p>
                </div>
                <Button size="sm" variant="outline" asChild className="shrink-0 border-gold/40 text-gold-dark hover:bg-gold/10">
                  <Link to="/product/$slug" params={{ slug: poster.productSlug }} onClick={(e) => e.stopPropagation()}>
                    View Product
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots Indicator */}
      <div className="mt-4 flex justify-center gap-2">
        {featuredProductPosters.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to poster ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-8 bg-gold" : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
