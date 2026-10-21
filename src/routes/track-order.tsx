import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/Layout";
import { getOrderSummary } from "@/lib/orders.functions";
import { inr } from "@/lib/products";

export const Route = createFileRoute("/track-order")({
  head: () => ({ meta: [{ title: "Track Order — MK Enterprises" }, { name: "description", content: "Track your MK Enterprises order." }, { property: "og:title", content: "Track Order — MK Enterprises" }, { property: "og:description", content: "Track your order." }] }),
  component: Track,
});

function Track() {
  const fn = useServerFn(getOrderSummary);
  const [no, setNo] = useState("");
  const [ph, setPh] = useState("");
  const [res, setRes] = useState<Awaited<ReturnType<typeof getOrderSummary>> | "none" | null>(null);
  const go = async () => {
    try { setRes((await fn({ data: { orderNumber: no, phone: ph } })) ?? "none"); } catch { setRes("none"); }
  };
  return (
    <>
      <PageHero title="Track Order" />
      <div className="mx-auto max-w-md space-y-3 px-4 py-12">
        <Input placeholder="Order ID (e.g. MKXXXX)" value={no} onChange={(e) => setNo(e.target.value)} />
        <Input placeholder="Mobile number" maxLength={10} value={ph} onChange={(e) => setPh(e.target.value.replace(/\D/g, ""))} />
        <Button className="w-full" onClick={go}>Track</Button>
        {res === "none" && <p className="text-sm text-destructive">No order found with these details.</p>}
        {res && res !== "none" && (
          <div className="rounded-md border border-gold-dark/40 bg-card p-4 text-sm">
            <p><b>Order:</b> {res.order_number}</p>
            <p><b>Status:</b> {res.status.replace(/_/g, " ")}</p>
            <p><b>Total:</b> {inr(res.total)}</p>
          </div>
        )}
      </div>
    </>
  );
}
