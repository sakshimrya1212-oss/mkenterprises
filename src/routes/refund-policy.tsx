import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Layout";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({ meta: [{ title: "Refund Policy — MK Enterprises" }, { name: "description", content: "Refund Policy at MK Enterprises." }, { property: "og:title", content: "Refund Policy — MK Enterprises" }, { property: "og:description", content: "Refund Policy at MK Enterprises." }] }),
  component: Refund,
});

function Refund() {
  return (
    <>
      <PageHero title="Refund Policy" />
      <div className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-muted-foreground">Unopened products can be returned within 7 days of delivery. Refunds are processed to the original payment method within 5–7 working days after inspection.</div>
    </>
  );
}
