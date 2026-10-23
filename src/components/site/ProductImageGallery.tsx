import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut, Sparkles } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const touchStartX = useRef<number | null>(null);

  const total = images.length;
  const currentImg = images[activeIndex] ?? images[0];

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? 0;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    touchStartX.current = null;
  };

  const openLightbox = (index?: number) => {
    if (typeof index === "number") setActiveIndex(index);
    setZoomLevel(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoomLevel(1);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Slider Frame */}
      <div 
        className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-gold-dark/40 bg-card p-4 transition-all hover:border-gold hover:shadow-gold"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImg}
          alt={`${productName} view ${activeIndex + 1}`}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />

        {/* Poster / View Badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/80 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-gold border border-gold/30">
          {activeIndex === 0 ? (
            <span>Product View</span>
          ) : (
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Clinical Poster {activeIndex}
            </span>
          )}
        </div>

        {/* Counter Pill */}
        <div className="absolute right-3 bottom-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white/90">
          {activeIndex + 1} / {total}
        </div>

        {/* Fullscreen / Lightbox Zoom Button */}
        <button
          onClick={() => openLightbox()}
          aria-label="Expand image"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/80 backdrop-blur-md text-gold border border-gold/30 shadow-md transition hover:scale-110 hover:bg-gold hover:text-ink opacity-90 group-hover:opacity-100"
          title="Click to zoom / view full poster"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Navigation Chevron Buttons (shown if > 1 image) */}
        {total > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-ink/80 text-gold border border-gold/30 backdrop-blur-md shadow-lg transition-all opacity-80 hover:opacity-100 hover:scale-110 hover:bg-gold hover:text-ink md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-ink/80 text-gold border border-gold/30 backdrop-blur-md shadow-lg transition-all opacity-80 hover:opacity-100 hover:scale-110 hover:bg-gold hover:text-ink md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Strip */}
      {total > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          {images.map((imgSrc, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`group relative flex-none h-20 w-20 overflow-hidden rounded-lg border-2 p-1 bg-card transition-all ${
                  isActive 
                    ? "border-gold ring-2 ring-gold/40 scale-102" 
                    : "border-border hover:border-gold/50 opacity-70 hover:opacity-100"
                }`}
                title={idx === 0 ? "Product Bottle" : `Poster ${idx}`}
              >
                <img
                  src={imgSrc}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="h-full w-full object-contain"
                />
                <span className="absolute bottom-0 inset-x-0 bg-ink/80 text-[9px] font-medium text-gold text-center py-0.5 backdrop-blur-xs">
                  {idx === 0 ? "Bottle" : `Poster ${idx}`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in"
          onClick={closeLightbox}
        >
          {/* Top Controls Bar */}
          <div 
            className="absolute top-4 inset-x-4 flex items-center justify-between z-20 text-white max-w-6xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-serif font-semibold text-gold text-lg">{productName}</span>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-white/80">
                {activeIndex === 0 ? "Main View" : `Infographic Poster ${activeIndex}`} ({activeIndex + 1}/{total})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.5, 3))}
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-ink transition"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.5, 1))}
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-ink transition"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={closeLightbox}
                className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-red-500 transition"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Main Image Container */}
          <div 
            className="relative flex items-center justify-center w-full max-w-5xl h-[75vh] overflow-auto cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImg}
              alt={productName}
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-full max-w-full object-contain transition-transform duration-200"
            />
          </div>

          {/* Modal Navigation Arrows */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-gold border border-gold/40 hover:bg-gold hover:text-ink transition"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-gold border border-gold/40 hover:bg-gold hover:text-ink transition"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Modal Thumbnails Strip */}
          {total > 1 && (
            <div 
              className="absolute bottom-4 inset-x-4 flex justify-center gap-2 overflow-x-auto z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((imgSrc, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-16 w-16 rounded-md overflow-hidden border-2 bg-card p-1 transition ${
                    idx === activeIndex ? "border-gold ring-2 ring-gold/50" : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={imgSrc} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
