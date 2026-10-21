import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/products";

export const Route = createFileRoute("/account/orders")({
  head: () => ({ meta: [{ title: "My Orders — MK Enterprises" }, { name: "description", content: "Your order history." }, { property: "og:title", content: "My Orders — MK Enterprises" }, { property: "og:description", content: "Your order history." }] }),
  component: Orders,
});

function Orders() {
  const [rows, setRows] = useState<{ order_number: string; status: string; total: number; created_at: string }[] | null>(null);
  useEffect(() => {
    supabase.from("orders").select("order_number,status,total,created_at").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <>
      <PageHero title="My Orders" />
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-10">
        {rows?.length === 0 && <p className="text-center text-muted-foreground">No orders yet (sign in to see your orders).</p>}
        {rows?.map((o) => (
          <div key={o.order_number} className="flex justify-between rounded-md border bg-card p-4 text-sm">
            <span>{o.order_number} · {new Date(o.created_at).toLocaleDateString("en-IN")}</span>
            <span>{o.status.replace(/_/g, " ")} · {inr(o.total)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
