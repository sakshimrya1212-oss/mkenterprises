import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Heart, Home, Instagram, Facebook, Mail, MapPin, Menu, MessageCircle, Phone, Search, ShoppingBag, Truck, User, X } from "lucide-react";
import logo from "@/assets/logo-light.png";
import { useCart } from "@/lib/cart";
import { categories } from "@/lib/products";
import { CartDrawer } from "./CartDrawer";
import { DISCLAIMER, Divider } from "./SectionTitle";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "All Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count, setDrawerOpen } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-gold-gradient py-1.5 text-center text-xs font-semibold text-primary-foreground">
        Get 15% OFF on ₹499+ | Code: MK15
      </div>
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          <Link to="/" className="shrink-0"><img src={logo} alt="MK Enterprises" className="h-12 w-auto" /></Link>
          <nav className="hidden items-center gap-7 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="text-xs font-medium uppercase tracking-widest hover:text-gold" activeProps={{ className: "text-gold" }} activeOptions={{ exact: n.to === "/" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/shop" aria-label="Search" className="hover:text-gold"><Search className="h-5 w-5" /></Link>
            <Link to="/account" aria-label="Account" className="hidden hover:text-gold sm:block"><User className="h-5 w-5" /></Link>
            <Link to="/wishlist" aria-label="Wishlist" className="hidden hover:text-gold sm:block"><Heart className="h-5 w-5" /></Link>
            <button aria-label="Cart" onClick={() => setDrawerOpen(true)} className="relative hover:text-gold">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-primary-foreground">{count}</span>}
            </button>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col gap-3 border-t border-gold-dark/40 px-4 py-4 md:hidden">
            {nav.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-sm uppercase tracking-widest">{n.label}</Link>)}
            <Link to="/track-order" onClick={() => setOpen(false)} className="text-sm uppercase tracking-widest">Track Order</Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink pb-20 text-ink-foreground md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <img src={logo} alt="MK Enterprises" className="h-20 w-auto" />
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold">Partners in Growth & Innovation</p>
          <p className="mt-3 text-xs leading-relaxed text-ink-foreground/70">Premium Ayurvedic and herbal wellness products, delivered across India.</p>
          <div className="mt-4 space-y-2 text-xs text-ink-foreground/80">
            <a href="tel:+919111722209" className="flex items-center gap-2 hover:text-gold transition">
              <Phone className="h-4 w-4 shrink-0 text-gold" /> +91 91117 22209
            </a>
            <a href="mailto:enterprisesmk313@gmail.com" className="flex items-center gap-2 hover:text-gold transition">
              <Mail className="h-4 w-4 shrink-0 text-gold" /> enterprisesmk313@gmail.com
            </a>
            <p className="flex items-start gap-2 text-[11px] leading-snug text-ink-foreground/70">
              <MapPin className="h-4 w-4 shrink-0 text-gold mt-0.5" /> Ward No. 7, Rajmohini Agri College Road, Azeerma, Ambikapur, Surguja (C.G.) 497001
            </p>
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm uppercase tracking-brand text-gold">Categories</h4>
          <ul className="space-y-2 text-sm text-ink-foreground/70">
            {categories.map((c) => <li key={c.slug}><Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-gold">{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm uppercase tracking-brand text-gold">Information</h4>
          <ul className="space-y-2 text-sm text-ink-foreground/70">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link to="/refund-policy" className="hover:text-gold">Refund Policy</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-gold">Shipping Policy</Link></li>
            <li><Link to="/terms" className="hover:text-gold">Terms & Conditions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm uppercase tracking-brand text-gold">Quick Options</h4>
          <ul className="space-y-2 text-sm text-ink-foreground/70">
            <li><Link to="/" className="hover:text-gold">Home</Link></li>
            <li><Link to="/shop" className="hover:text-gold">All Products</Link></li>
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
          <div className="mt-5 flex gap-3 text-gold">
            <a href="https://wa.me/919111722209" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-white transition"><MessageCircle className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-white transition"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-white transition"><Facebook className="h-5 w-5" /></a>
          </div>
          <p className="mt-5 text-xs text-ink-foreground/60">We accept: UPI · Cards · Net Banking · Wallets · COD</p>
        </div>
      </div>
      <div className="border-t border-gold-dark/30 px-4 py-5 text-center">
        <p className="mx-auto max-w-3xl text-[11px] text-ink-foreground/50">{DISCLAIMER}</p>
        <Divider className="my-3" />
        <p className="text-xs text-ink-foreground/60">© 2026 MK Enterprises. All rights reserved.</p>
      </div>
    </footer>
  );
}

function MobileBar() {
  const { count, setDrawerOpen } = useCart();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-gold-dark/40 bg-ink py-2 text-[10px] uppercase text-ink-foreground md:hidden">
      <Link to="/" className="flex flex-col items-center gap-1"><Home className="h-5 w-5 text-gold" />Home</Link>
      <Link to="/track-order" className="flex flex-col items-center gap-1"><Truck className="h-5 w-5 text-gold" />Track</Link>
      <Link to="/wishlist" className="flex flex-col items-center gap-1"><Heart className="h-5 w-5 text-gold" />Wishlist</Link>
      <button onClick={() => setDrawerOpen(true)} className="flex flex-col items-center gap-1 uppercase"><ShoppingBag className="h-5 w-5 text-gold" />Cart ({count})</button>
    </div>
  );
}

export function WhatsAppFloatingButton() {
  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
      <a
        href="https://wa.me/919111722209?text=Hello%20MK%20Enterprises,%20I%20have%20an%20inquiry."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group flex items-center gap-2.5 rounded-full bg-[#25D366] p-3.5 text-white shadow-xl shadow-black/30 transition-all duration-300 hover:scale-105 hover:bg-[#20ba59] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        <MessageCircle className="h-6 w-6 text-white" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-in-out group-hover:max-w-xs group-hover:pr-2">
          Chat with Us
        </span>
      </a>
    </aside>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");
  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBar />
      <CartDrawer />
      <WhatsAppFloatingButton />
    </div>
  );
}

export function PageHero({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="bg-ink py-12 text-center text-ink-foreground">
      <h1 className="text-3xl uppercase tracking-brand text-gold-gradient md:text-4xl">{title}</h1>
      <Divider className="mt-3" />
      {sub && <p className="mt-3 text-sm text-ink-foreground/70">{sub}</p>}
    </div>
  );
}
