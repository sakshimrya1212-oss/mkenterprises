import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { 
  Play, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

import video1 from "@/assets/testimonial_video/1.mp4";
import video2 from "@/assets/testimonial_video/2.mp4";
import video3 from "@/assets/testimonial_video/3.mp4";
import video4 from "@/assets/testimonial_video/4.mp4";
import video5 from "@/assets/testimonial_video/5.mp4";
import video6 from "@/assets/testimonial_video/6.mp4";

export interface VideoReview {
  id: string;
  videoUrl: string;
  name: string;
  location: string;
  title: string;
  quote: string;
  productName: string;
  productSlug: string;
  rating: number;
  duration?: string;
}

export const videoReviews: VideoReview[] = [
  {
    id: "vid-1",
    videoUrl: video1,
    name: "Rameshwar Lal",
    location: "Varanasi, UP",
    title: "Relief from Joint Stiffness",
    quote: "Knee pain mein bahut aaram mila. Mahaveni oil lagane ke baad chalne firne mein koi dikkat nahi hoti.",
    productName: "Mahaveni Pain Relief Oil",
    productSlug: "mahaveni-pain-oil",
    rating: 5,
  },
  {
    id: "vid-2",
    videoUrl: video2,
    name: "Sunita Agarwal",
    location: "Jaipur, Rajasthan",
    title: "Daily Energy & Vitality",
    quote: "Argoides syrup ne meri thakan bilkul door kardi. 100% natural Ayurvedic tonic hai, pura din energy bani rehti hai.",
    productName: "Argoides Ayurvedic Syrup",
    productSlug: "argoides-syrup-200ml",
    rating: 5,
  },
  {
    id: "vid-3",
    videoUrl: video3,
    name: "Priyanka Sharma",
    location: "Delhi NCR",
    title: "Immunity & Glowing Skin",
    quote: "10days wellness syrup is unbelievable! 30+ natural herbs hain, skin glow and digestion dono me bahut fark dekha.",
    productName: "10days Complete Wellness",
    productSlug: "ten-days-syrup",
    rating: 5,
  },
  {
    id: "vid-4",
    videoUrl: video4,
    name: "Dr. Vivek Mehta",
    location: "Ahmedabad, Gujarat",
    title: "Pure Vegetarian HPMC Formula",
    quote: "Kenko Gold multivitamin capsules provide sustained cognitive focus and physical stamina without synthetic additives.",
    productName: "Kenko Gold Multivitamin",
    productSlug: "kenko-gold",
    rating: 5,
  },
  {
    id: "vid-5",
    videoUrl: video5,
    name: "Manju Devi",
    location: "Patna, Bihar",
    title: "Mobility & Joint Comfort",
    quote: "Sunts aur traditional herbs ka ye Mahodadhi syrup joint pain aur swelling ke liye sabse behtar aur safe hai.",
    productName: "Mahodadhi Joint Relief",
    productSlug: "mahodadhi-syrup",
    rating: 5,
  },
  {
    id: "vid-6",
    videoUrl: video6,
    name: "Rahul Verma",
    location: "Bengaluru, Karnataka",
    title: "Convenient Instant Sachet",
    quote: "Argoides sachets are so easy to dissolve in water during travel and gym sessions. Taste is also refreshing!",
    productName: "Argoides Herbal Sachets",
    productSlug: "argoides-sachets",
    rating: 5,
  },
];

export function VideoTestimonials() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({
    "vid-1": true,
    "vid-2": true,
    "vid-3": true,
    "vid-4": true,
    "vid-5": true,
    "vid-6": true,
  });
  const [modalVideo, setModalVideo] = useState<VideoReview | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (playingId === id) {
      video.pause();
      setPlayingId(null);
    } else {
      // Pause any previously playing video
      if (playingId && videoRefs.current[playingId]) {
        videoRefs.current[playingId]?.pause();
      }
      video.play().catch(() => {});
      setPlayingId(id);
    }
  };

  const toggleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRefs.current[id];
    if (!video) return;
    const isMuted = !mutedStates[id];
    video.muted = isMuted;
    setMutedStates((prev) => ({ ...prev, [id]: isMuted }));
  };

  const openModal = (review: VideoReview, e: React.MouseEvent) => {
    e.stopPropagation();
    // Pause any card video
    if (playingId && videoRefs.current[playingId]) {
      videoRefs.current[playingId]?.pause();
      setPlayingId(null);
    }
    setModalVideo(review);
  };

  const closeModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    setModalVideo(null);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Autoplay modal video when opened
  useEffect(() => {
    if (modalVideo && modalVideoRef.current) {
      modalVideoRef.current.currentTime = 0;
      modalVideoRef.current.play().catch(() => {});
    }
  }, [modalVideo]);

  return (
    <section className="relative overflow-hidden bg-ink py-20 text-ink-foreground">
      {/* Background glow styling */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-7xl h-96 bg-gold/5 blur-3xl rounded-full" />

      <div className="mx-auto max-w-7xl px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real Customer Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-brand text-gold-gradient">
              Customer Video Testimonials
            </h2>
            <p className="mt-2 text-sm md:text-base text-ink-foreground/75 max-w-2xl">
              Hear verified customers share their genuine health transformations with MK Enterprises Ayurvedic formulations.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous testimonials"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-ink-soft text-gold transition hover:border-gold hover:bg-gold/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next testimonials"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-ink-soft text-gold transition hover:border-gold hover:bg-gold/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video Slider Reel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videoReviews.map((rev) => {
            const isPlaying = playingId === rev.id;
            const isMuted = mutedStates[rev.id] ?? true;

            return (
              <div
                key={rev.id}
                className="group relative flex-none w-[260px] sm:w-[300px] snap-start flex flex-col rounded-2xl border border-gold-dark/40 bg-ink-soft overflow-hidden transition-all duration-300 hover:border-gold hover:shadow-gold"
              >
                {/* Video Player Box */}
                <div 
                  className="relative aspect-[9/14] w-full bg-black cursor-pointer overflow-hidden"
                  onClick={() => togglePlay(rev.id)}
                >
                  <video
                    ref={(el) => {
                      videoRefs.current[rev.id] = el;
                    }}
                    src={rev.videoUrl}
                    preload="metadata"
                    playsInline
                    muted={isMuted}
                    loop
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                    onEnded={() => setPlayingId(null)}
                  />

                  {/* Gradient overlays for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-black/50 pointer-events-none" />

                  {/* Top Bar with Verified Badge & Controls */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified User
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => toggleMute(rev.id, e)}
                        className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-gold transition border border-white/10"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={(e) => openModal(rev, e)}
                        className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-gold transition border border-white/10"
                        title="Fullscreen view"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Center Play/Pause Indicator Button */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/90 text-ink shadow-lg shadow-gold/30 transition-transform duration-300 group-hover:scale-110">
                        <Play className="h-7 w-7 fill-ink translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Video Meta inside player */}
                  <div className="absolute bottom-3 inset-x-3 z-10 pointer-events-none">
                    <div className="flex items-center gap-1 text-gold mb-1">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-white drop-shadow leading-snug">
                      {rev.name}
                    </p>
                    <p className="text-[11px] text-white/80 drop-shadow">
                      {rev.location} · <span className="text-gold">{rev.productName}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Products CTA strip */}
        <div className="mt-8 pt-8 border-t border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-medium text-white">Join 10,000+ satisfied customers nationwide</p>
            <p className="text-xs text-ink-foreground/70">100% genuine Ayurvedic medicines with fast Pan-India shipping & COD.</p>
          </div>
          <Button asChild className="bg-gold text-ink font-semibold hover:bg-gold-light">
            <Link to="/shop">Explore All Products</Link>
          </Button>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      {modalVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={closeModal}
        >
          <div 
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gold/40 bg-ink shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white/90 hover:text-gold transition border border-white/20"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video Player */}
            <div className="relative aspect-[9/14] max-h-[72vh] w-full bg-black">
              <video
                ref={modalVideoRef}
                src={modalVideo.videoUrl}
                controls
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              />
            </div>

            {/* Modal Info Footer */}
            <div className="p-5 bg-ink border-t border-gold/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-white">{modalVideo.name}</h3>
                  <p className="text-xs text-gold">{modalVideo.location} · Verified Buyer</p>
                </div>
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: modalVideo.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-ink-foreground/80 italic">"{modalVideo.quote}"</p>
              <Button asChild className="mt-2 w-full bg-gold text-ink font-semibold hover:bg-gold-light" onClick={closeModal}>
                <Link to="/product/$slug" params={{ slug: modalVideo.productSlug }}>
                  Shop {modalVideo.productName}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
