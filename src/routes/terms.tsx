import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Layout";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — MK Enterprises" }, { name: "description", content: "Terms & Conditions at MK Enterprises." }, { property: "og:title", content: "Terms & Conditions — MK Enterprises" }, { property: "og:description", content: "Terms & Conditions at MK Enterprises." }] }),
  component: Terms,
});

function Terms() {
  return (
    <>
      <PageHero title="Terms & Conditions" />
      <div className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-muted-foreground">By using this site you agree to our terms. Product information is for general wellness and is not medical advice.</div>
    </>
  );
}
