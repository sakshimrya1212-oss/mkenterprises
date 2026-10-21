import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/Layout";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({ meta: [{ title: "Privacy Policy — MK Enterprises" }, { name: "description", content: "Privacy Policy at MK Enterprises." }, { property: "og:title", content: "Privacy Policy — MK Enterprises" }, { property: "og:description", content: "Privacy Policy at MK Enterprises." }] }),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <PageHero title="Privacy Policy" />
      <div className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-muted-foreground">We collect only the details needed to process and deliver your order (name, phone, email, address). We never sell your data. Payments are processed securely by our payment partner.</div>
    </>
  );
}
