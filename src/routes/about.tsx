import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About MK Enterprises — MK Enterprises" }, { name: "description", content: "About MK Enterprises at MK Enterprises." }, { property: "og:title", content: "About MK Enterprises — MK Enterprises" }, { property: "og:description", content: "About MK Enterprises at MK Enterprises." }] }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero title="About MK Enterprises" />
      <div className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-muted-foreground">MK Enterprises brings premium Ayurvedic and herbal wellness products to homes across India, with a focus on quality, honest information and reliable delivery.</div>
    </>
  );
}
