import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Layout";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({ meta: [{ title: "Shipping Policy — MK Enterprises" }, { name: "description", content: "Shipping Policy at MK Enterprises." }, { property: "og:title", content: "Shipping Policy — MK Enterprises" }, { property: "og:description", content: "Shipping Policy at MK Enterprises." }] }),
  component: Shipping,
});

function Shipping() {
  return (
    <>
      <PageHero title="Shipping Policy" />
      <div className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-muted-foreground">Free shipping on orders above ₹499; ₹49 otherwise. Orders ship within 1–2 working days and are delivered in 3–7 days across India. COD carries a ₹40 fee.</div>
    </>
  );
}
