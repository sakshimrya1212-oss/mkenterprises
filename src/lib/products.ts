import argoides200Img from "../assets/products/argoides-200.jpg";
import argoides450Img from "../assets/products/argoides-450.jpg";
import argoidesSachetsImg from "../assets/products/argoides_sachets.jpeg";
import gMomSyrupImg from "../assets/products/g-mom-syrup.jpg";
import jumboPlusImg from "../assets/products/jumbo-plus.jpg";
import kenkoGoldImg from "../assets/products/kenko-gold.jpg";
import kiyoPetImg from "../assets/products/kiyo-pet.jpg";
import mahaveniOilImg from "../assets/products/mahaveni-oil.jpg";
import mahodadhiImg from "../assets/products/mahodadhi.jpg";
import tenDaysSyrupImg from "../assets/products/ten-days-syrup.jpg";

export type Variant = { label: string; mrp: number; price: number; sku: string; stock: number };
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  concern: string[];
  images: string[];
  variants: [Variant, ...Variant[]];
  short: string;
  benefits: string[];
  howToUse: string;
  tags: string[];
};

export const categories = [
  { slug: "syrups", name: "Herbal Syrups" },
  { slug: "tablets", name: "Herbal Tablets" },
  { slug: "capsules", name: "Herbal Capsules" },
  { slug: "oils", name: "Herbal Oils" },
  { slug: "sachets", name: "Herbal Sachets" },
] as const;

export const concerns = [
  { slug: "digestive", name: "Digestive Care", icon: "Leaf" },
  { slug: "joint", name: "Joint & Muscle", icon: "Bone" },
  { slug: "immunity", name: "Immunity", icon: "Shield" },
  { slug: "urinary", name: "Urinary Care", icon: "Droplet" },
  { slug: "hair-skin", name: "Hair & Skin", icon: "Sparkles" },
  { slug: "energy", name: "Energy & Vitality", icon: "Zap" },
] as const;

const v = (sku: string, label: string, mrp: number, price: number): Variant => ({ sku, label, mrp, price, stock: 50 });
const p = (o: any, i: number): Product => pp(o, i);
const pp = (o: Omit<Product, "id" | "howToUse"> & { howToUse?: string }, i: number): Product => ({
  id: `mk-${String(i + 1).padStart(3, "0")}`,
  howToUse: o.howToUse ?? "Use as directed on the label or as advised by your physician.",
  ...o,
});

export const products: Product[] = [
  {
    slug: "mahaveni-pain-oil",
    name: "Mahaveni Instant Pain Relief Oil",
    category: "oils",
    concern: ["joint"],
    images: [mahaveniOilImg],
    variants: [v("MK-MAH-80", "80 ml", 399, 299)],
    short: "Fast-acting Ayurvedic massage oil for neck, wrist, joint and elbow pain relief.",
    benefits: [
      "Instant relief from neck, joint, wrist & elbow discomfort",
      "Deeply penetrates to soothe muscle stiffness & aches",
      "Ayurvedic blend of herbal extracts & essential oils",
      "Non-sticky, quick-absorbing formula",
    ],
    howToUse: "Apply gently to the affected area 2–3 times daily and massage softly. For external use only.",
    tags: ["bestseller"],
  },
  {
    slug: "argoides-syrup-200ml",
    name: "Argoides Ayurvedic Syrup (200 ml)",
    category: "syrups",
    concern: ["urinary", "immunity"],
    images: [argoides200Img],
    variants: [v("MK-ARG-200", "200 ml", 299, 229)],
    short: "Ayurvedic formulation with superior oxygen radical absorbance capacity for daily vitality.",
    benefits: [
      "Superior Oxygen Radical Absorbance Capacity (ORAC)",
      "Supports natural defense and immune health",
      "Authentic Vitahurbs Ayurvedic formulation",
      "Gentle and restorative daily herbal tonic",
    ],
    howToUse: "Take 10–15 ml twice daily after meals with water, or as directed by a physician.",
    tags: ["bestseller"],
  },
  {
    slug: "argoides-syrup-450ml",
    name: "Argoides Ayurvedic Syrup (450 ml)",
    category: "syrups",
    concern: ["urinary", "immunity"],
    images: [argoides450Img],
    variants: [v("MK-ARG-450", "450 ml", 549, 429)],
    short: "Family pack of Argoides Ayurvedic Syrup for antioxidant defense and sustained vitality.",
    benefits: [
      "Economical 450 ml family pack",
      "High antioxidant potential for cell vitality",
      "Promotes general well-being and stamina",
      "100% natural Ayurvedic formulation",
    ],
    howToUse: "Take 10–15 ml twice daily with lukewarm water, or as advised by your healthcare practitioner.",
    tags: ["bestseller"],
  },
  {
    slug: "argoides-sachets",
    name: "Argoides Ayurvedic Sachets (10 x 10g)",
    category: "sachets",
    concern: ["immunity", "energy"],
    images: [argoidesSachetsImg],
    variants: [v("MK-ARG-SAC", "10 x 10g Sachets", 499, 399)],
    short: "Convenient Ayurvedic instant wellness drink sachets loaded with natural antioxidants.",
    benefits: [
      "Rich in natural antioxidants and herbal extracts",
      "Convenient single-serve 10g sachets",
      "Quick dissolving formula for instant nourishment",
      "Supports daily energy, metabolism and immunity",
    ],
    howToUse: "Dissolve 1 sachet in 150–200 ml of fresh drinking water, stir well and consume once daily.",
    tags: ["new"],
  },
  {
    slug: "g-mom-syrup",
    name: "G-Mom Maternal & Women Wellness Syrup",
    category: "syrups",
    concern: ["immunity", "energy"],
    images: [gMomSyrupImg],
    variants: [v("MK-GMO-200", "200 ml", 349, 269)],
    short: "Sugar-free syrup with L-Arginine, Proanthocyanidins, EPA, DHA & Glutathione.",
    benefits: [
      "Enriched with L-Arginine, Proanthocyanidins, EPA & DHA",
      "Contains powerful antioxidant Glutathione",
      "100% Sugar-Free formula safe for daily consumption",
      "Delicious Mango-Pineapple flavour",
    ],
    howToUse: "Take 10 ml twice daily after meals, or as recommended by your physician.",
    tags: ["bestseller", "new"],
  },
  {
    slug: "jumbo-plus-effervescent",
    name: "Jumbo Plus Effervescent Tablets (20 Tabs)",
    category: "tablets",
    concern: ["energy"],
    images: [jumboPlusImg],
    variants: [v("MK-JMB-20", "20 Effervescent Tablets", 399, 299)],
    short: "Refreshing orange flavour effervescent tablets for men's stamina, vigor and anti-aging support.",
    benefits: [
      "Supports stamina, energy and overall vigor",
      "Sexual health and vitality support for men",
      "Anti-aging and antioxidant properties",
      "Delicious, fast-absorbing orange effervescent drink",
    ],
    howToUse: "Drop 1 tablet into a glass of 200 ml water, let it fizz completely and drink immediately once daily.",
    tags: ["bestseller"],
  },
  {
    slug: "kenko-gold",
    name: "Kenko Gold Multivitamin HPMC Capsules",
    category: "capsules",
    concern: ["energy", "immunity"],
    images: [kenkoGoldImg],
    variants: [v("MK-KNG-30", "30 Capsules", 999, 749)],
    short: "Powerful multivitamin HPMC capsules for stamina, brain power, stress relief and anti-aging.",
    benefits: [
      "Boosts daily stamina and physical energy",
      "Enhances brain power, focus and cognitive function",
      "Effective daily stress relief and mental calm",
      "Vegetarian HPMC capsules with anti-aging action",
    ],
    howToUse: "Take 1 capsule daily after a meal with a full glass of water.",
    tags: ["bestseller", "new"],
  },
  {
    slug: "kiyo-pet",
    name: "Kiyo Pet Digestive Enzyme Therapy Capsules",
    category: "capsules",
    concern: ["digestive"],
    images: [kiyoPetImg],
    variants: [v("MK-KIY-30", "30 Capsules", 499, 369)],
    short: "Perfect digestive enzyme therapy in HPMC capsules to relieve indigestion and support gut health.",
    benefits: [
      "Digestive enzyme therapy formula for optimal gut health",
      "Relieves acidity, bloating, and stomach discomfort",
      "Enhances nutrient absorption from meals",
      "Gentle vegetarian HPMC capsules",
    ],
    howToUse: "Take 1 capsule twice daily after meals with water, or as directed by a healthcare professional.",
    tags: ["bestseller"],
  },
  {
    slug: "mahodadhi-syrup",
    name: "Mahodadhi Joint & Muscular Relief Syrup",
    category: "syrups",
    concern: ["joint"],
    images: [mahodadhiImg],
    variants: [v("MK-MHD-450", "450 ml", 499, 399)],
    short: "Traditional Ayurvedic syrup formulated with Sunts & herbs for joint and muscular pain relief.",
    benefits: [
      "Soothes joint inflammation, stiffness and muscular pain",
      "Infused with Sunts and time-tested Ayurvedic herbs",
      "Improves joint mobility and flexibility",
      "Safe herbal tonic for long-term comfort",
    ],
    howToUse: "Take 15–20 ml twice daily with warm water after meals, or as advised by your physician.",
    tags: ["bestseller"],
  },
  {
    slug: "ten-days-syrup",
    name: "10days Complete Wellness Syrup (200 ml)",
    category: "syrups",
    concern: ["hair-skin", "energy", "immunity"],
    images: [tenDaysSyrupImg],
    variants: [v("MK-10D-200", "200 ml", 349, 269)],
    short: "Complete daily wellness tonic with 30+ powerful ingredients for nutrition, immunity & glowing skin.",
    benefits: [
      "30+ powerful botanical & nutraceutical ingredients",
      "Supports hormonal balance and women's wellness",
      "Boosts energy, stamina, immunity and healthy skin",
      "Holistic mental wellness and stress support",
    ],
    howToUse: "Take 10 ml twice daily with water before or after meals.",
    tags: ["bestseller", "new"],
  },
].map(p);

export const PRODUCTS_STORAGE_KEY = "mk_custom_products_v1";

export function getAllProducts(): Product[] {
  if (typeof window === "undefined") return products;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return products;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : products;
  } catch {
    return products;
  }
}

export function saveAllProducts(list: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("mk_products_updated"));
}

export function resetDefaultProducts(): Product[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    window.dispatchEvent(new Event("mk_products_updated"));
  }
  return products;
}

export const getProduct = (slug: string) => getAllProducts().find((x) => x.slug === slug);
export const findVariant = (sku: string) => {
  for (const pr of getAllProducts()) {
    const va = pr.variants.find((x) => x.sku === sku);
    if (va) return { product: pr, variant: va };
  }
  return undefined;
};
export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const discountPct = (va: Variant) => Math.round(((va.mrp - va.price) / va.mrp) * 100);


