import { createFileRoute } from "@tanstack/react-router";

async function hmacHex(secret: string, msg: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["RAZORPAY_WEBHOOK_SECRET"];
        if (!secret) return new Response("not configured", { status: 503 });
        const body = await request.text();
        const sig = request.headers.get("x-razorpay-signature") ?? "";
        if ((await hmacHex(secret, body)) !== sig) return new Response("bad signature", { status: 401 });
        const evt = JSON.parse(body) as { event: string; payload: { payment?: { entity: { order_id: string; id: string } } } };
        const p = evt.payload.payment?.entity;
        if (p && (evt.event === "payment.captured" || evt.event === "payment.failed")) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin
            .from("orders")
            .update({ status: evt.event === "payment.captured" ? "PAID" : "FAILED", razorpay_payment_id: p.id })
            .eq("razorpay_order_id", p.order_id)
            .in("status", ["PENDING", "FAILED"]);
        }
        return Response.json({ ok: true });
      },
    },
  },
});
