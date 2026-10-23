import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { computeTotals } from "./pricing";

const addressSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().transform((v) => v.replace(/\D/g, "").slice(-10)).pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  line1: z.string().trim().min(3).max(200),
  line2: z.string().trim().max(200).optional().default(""),
  landmark: z.string().trim().max(100).optional().default(""),
  pincode: z.string().transform((v) => v.replace(/\D/g, "").slice(0, 6)).pipe(z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode")),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
});

const createSchema = z.object({
  lines: z.array(z.object({ sku: z.string().max(40), qty: z.number().int().min(1).max(20) })).min(1).max(30),
  coupon: z.string().max(30).nullable().optional(),
  method: z.enum(["cod", "online"]),
  address: addressSchema,
  note: z.string().max(500).optional(),
  accessToken: z.string().nullable().optional(),
});

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const razorpayAvailable = createServerFn({ method: "GET" }).handler(async () => ({
  available: !!(process.env["RAZORPAY_KEY_ID"] && process.env["RAZORPAY_KEY_SECRET"]),
}));

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => createSchema.parse(d))
  .handler(async ({ data }) => {
    const t = computeTotals(data.lines, data.coupon, data.method);
    if (t.items.length === 0) throw new Error("Your cart is empty");
    if (data.method === "cod" && !t.codAllowed) throw new Error("Cash on Delivery is not available for orders above ₹5,000");
    const db = await admin();

    let userId: string | null = null;
    if (data.accessToken) {
      const { data: u } = await db.auth.getUser(data.accessToken);
      userId = u.user?.id ?? null;
    }

    const orderNumber = "MK" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);
    const { address } = data;
    let razorpayOrderId: string | null = null;

    if (data.method === "online") {
      const keyId = process.env["RAZORPAY_KEY_ID"] || process.env["VITE_RAZORPAY_KEY_ID"];
      const secret = process.env["RAZORPAY_KEY_SECRET"];
      if (!keyId || !secret) throw new Error("Online payment is not set up yet. Please choose Cash on Delivery.");
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Basic " + btoa(`${keyId}:${secret}`) },
        body: JSON.stringify({ amount: Math.round(t.total * 100), currency: "INR", receipt: orderNumber }),
      });
      if (!res.ok) {
        console.error("Razorpay order failed", res.status, await res.text());
        throw new Error("Could not start payment. Please try again.");
      }
      razorpayOrderId = ((await res.json()) as { id: string }).id;
    }

    const { error } = await db.from("orders").insert({
      order_number: orderNumber,
      user_id: userId,
      customer_name: address.name,
      phone: address.phone,
      email: address.email || null,
      address,
      items: t.items,
      subtotal: t.subtotal,
      discount: t.discount,
      shipping: t.shipping,
      cod_fee: t.codFee,
      total: t.total,
      coupon: t.coupon,
      note: data.note || null,
      payment_method: data.method,
      status: data.method === "cod" ? "COD_PENDING" : "PENDING",
      razorpay_order_id: razorpayOrderId,
    });
    if (error) {
      console.warn("Supabase initial order insert note:", error);
    }
    return { orderNumber, total: t.total, razorpayOrderId, keyId: process.env["RAZORPAY_KEY_ID"] || process.env["VITE_RAZORPAY_KEY_ID"] || null };
  });

async function hmacHex(secret: string, msg: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const verifyPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ orderNumber: z.string().max(40), razorpay_order_id: z.string().max(60), razorpay_payment_id: z.string().max(60), razorpay_signature: z.string().max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const secret = process.env["RAZORPAY_KEY_SECRET"];
    if (!secret) throw new Error("Payment not configured");
    const db = await admin();
    const { data: order } = await db.from("orders").select("id, razorpay_order_id, status").eq("order_number", data.orderNumber).maybeSingle();
    if (!order || order.razorpay_order_id !== data.razorpay_order_id) throw new Error("Order not found");
    const expected = await hmacHex(secret, `${data.razorpay_order_id}|${data.razorpay_payment_id}`);
    const ok = expected === data.razorpay_signature;
    if (order.status === "PENDING" || order.status === "FAILED") {
      await db.from("orders").update({ status: ok ? "PAID" : "FAILED", razorpay_payment_id: data.razorpay_payment_id, updated_at: new Date().toISOString() }).eq("id", order.id);
    }
    return { ok };
  });

export const markPaymentFailed = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ orderNumber: z.string().max(40) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    await db.from("orders").update({ status: "FAILED" }).eq("order_number", data.orderNumber).eq("status", "PENDING");
    return { ok: true };
  });

const publicCols = "order_number, customer_name, address, items, subtotal, discount, shipping, cod_fee, total, payment_method, status, created_at";

export const getOrderSummary = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ orderNumber: z.string().max(40), phone: z.string().regex(/^\d{10}$/) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: o } = await db.from("orders").select(publicCols).eq("order_number", data.orderNumber.trim().toUpperCase()).eq("phone", data.phone).maybeSingle();
    return o ?? null;
  });
