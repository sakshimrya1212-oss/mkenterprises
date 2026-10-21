import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  MessageCircle,
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/Layout";
import { getOrderSummary } from "@/lib/orders.functions";
import { inr } from "@/lib/products";
import { getStoredOrders } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";
import { sendCustomerInvoiceWhatsApp, type WhatsAppOrderDetails } from "@/lib/whatsapp";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Order — MK Enterprises" },
      { name: "description", content: "Track your MK Enterprises Ayurvedic order live status and invoice." },
      { property: "og:title", content: "Track Order — MK Enterprises" },
      { property: "og:description", content: "Track your Ayurvedic order live." },
    ],
  }),
  component: TrackPage,
});

const STEPS = [
  { key: "PLACED", label: "Order Placed", desc: "Received & verified" },
  { key: "CONFIRMED", label: "Confirmed", desc: "Packed & ready to dispatch" },
  { key: "SHIPPED", label: "Out for Delivery", desc: "In transit with courier" },
  { key: "DELIVERED", label: "Delivered", desc: "Safely received" },
];

function getStepIndex(status: string) {
  switch (status) {
    case "DELIVERED":
      return 3;
    case "SHIPPED":
      return 2;
    case "CONFIRMED":
      return 1;
    case "CANCELLED":
      return -1;
    case "COD_PENDING":
    default:
      return 0;
  }
}

function TrackPage() {
  const fn = useServerFn(getOrderSummary);
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any | "none" | null>(null);

  // Auto-fill from localStorage if customer just placed an order
  useEffect(() => {
    try {
      const stored = getStoredOrders();
      if (stored && stored.length > 0 && stored[0]) {
        const latest = stored[0];
        if (!orderNo && latest.order_number) setOrderNo(latest.order_number);
        if (!phone && latest.phone) setPhone(latest.phone);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanNo = orderNo.trim().toUpperCase().replace(/^#/, "");
    const cleanPhone = phone.trim().replace(/\D/g, "").slice(-10);

    if (!cleanNo || !cleanPhone) return;

    setLoading(true);
    try {
      let foundOrder: any = null;

      // 1. Live Query to Supabase orders table
      try {
        const { data: supaList, error } = await supabase
          .from("orders")
          .select("*")
          .ilike("order_number", `%${cleanNo}%`);

        if (!error && Array.isArray(supaList) && supaList.length > 0) {
          const match = supaList.find((o: any) => {
            const ordPhone = (o.phone || "").replace(/\D/g, "").slice(-10);
            return (
              ordPhone === cleanPhone ||
              ordPhone.endsWith(cleanPhone) ||
              cleanPhone.endsWith(ordPhone)
            );
          });
          if (match) {
            foundOrder = match;
          }
        }
      } catch (err) {
        console.warn("Supabase direct query note:", err);
      }

      // 2. Query via server function if direct query didn't find
      if (!foundOrder) {
        try {
          const srvRes = await fn({ data: { orderNumber: cleanNo, phone: cleanPhone } });
          if (srvRes) foundOrder = srvRes;
        } catch (srvErr) {
          console.warn("Server function track note:", srvErr);
        }
      }

      // 3. Fallback to local admin orders cache
      if (!foundOrder) {
        const local = getStoredOrders().find((o) => {
          const oNum = o.order_number.toUpperCase().replace(/^#/, "");
          const oPhone = o.phone.replace(/\D/g, "").slice(-10);
          return (oNum === cleanNo || oNum.includes(cleanNo)) && (oPhone === cleanPhone || cleanPhone.endsWith(oPhone));
        });
        if (local) {
          foundOrder = {
            order_number: local.order_number,
            customer_name: local.customer_name,
            phone: local.phone,
            address: local.address,
            items: local.items,
            subtotal: local.subtotal,
            discount: local.discount,
            shipping: local.shipping,
            cod_fee: local.cod_fee,
            total: local.total,
            payment_method: local.payment_method,
            status: local.status,
            created_at: local.created_at,
          };
        }
      }

      setOrderData(foundOrder ?? "none");
    } catch (e) {
      console.error("Tracking lookup error:", e);
      setOrderData("none");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return { label: "Confirmed & In Preparation", color: "bg-blue-100 text-blue-800 border-blue-300" };
      case "SHIPPED":
        return { label: "Dispatched / Out for Delivery", color: "bg-purple-100 text-purple-800 border-purple-300" };
      case "DELIVERED":
        return { label: "Delivered Successfully", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      case "CANCELLED":
        return { label: "Cancelled", color: "bg-rose-100 text-rose-800 border-rose-300" };
      default:
        return { label: "Order Received (Cash on Delivery)", color: "bg-amber-100 text-amber-800 border-amber-300" };
    }
  };

  const currentStep = orderData && orderData !== "none" ? getStepIndex(orderData.status) : 0;
  const isCancelled = orderData && orderData !== "none" && orderData.status === "CANCELLED";

  return (
    <>
      <PageHero
        title="Track Your Order"
        sub="Enter your Order ID & 10-digit mobile number to view live order progress and tax invoice."
      />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
        {/* Tracking Search Card */}
        <form
          onSubmit={handleTrack}
          className="rounded-2xl border border-gold-dark/40 bg-card p-6 shadow-md space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Truck className="h-5 w-5 text-gold-dark" />
            <h2 className="text-base font-bold text-foreground uppercase tracking-brand">
              Enter Order Details
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Order ID / Number
              </label>
              <Input
                placeholder="e.g. MKMVIL... or #MKMVIL..."
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                required
                className="font-mono text-sm uppercase"
              />
              <span className="text-[10px] text-muted-foreground">
                Found in your SMS / WhatsApp / confirmation screen
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                10-Digit Mobile Number
              </label>
              <Input
                placeholder="Enter 10-digit mobile"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                required
                className="text-sm"
              />
              <span className="text-[10px] text-muted-foreground">
                Mobile number used during checkout
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-gradient font-bold uppercase tracking-wider text-black shadow hover:opacity-90 py-5"
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Checking Order Status..." : "Track My Order"}
          </Button>
        </form>

        {/* Not Found State */}
        {orderData === "none" && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-center text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200 space-y-2">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
            <p className="font-bold text-base">No Order Found</p>
            <p className="text-xs text-rose-700 dark:text-rose-300">
              We couldn't locate an order matching Order ID <strong>"{orderNo}"</strong> and phone <strong>"{phone}"</strong>.
            </p>
            <p className="text-[11px] text-muted-foreground pt-2">
              Please double check the code or contact our support directly on WhatsApp.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/919111722209?text=${encodeURIComponent(
                  `Hello MK Enterprises, I need help tracking my order. Order ID: ${orderNo}, Phone: ${phone}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <MessageCircle className="h-4 w-4" /> Ask Support on WhatsApp (+91 91117 22209)
              </a>
            </div>
          </div>
        )}

        {/* Result Found State */}
        {orderData && orderData !== "none" && (
          <div className="rounded-2xl border-2 border-gold-dark/40 bg-card p-6 shadow-xl space-y-6">
            {/* Header: Order ID & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Order ID
                </span>
                <p className="font-mono text-xl font-black text-foreground">
                  #{orderData.order_number}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3" />
                  Placed on: {new Date(orderData.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block rounded-full px-3.5 py-1 text-xs font-bold border shadow-sm ${
                    getStatusBadge(orderData.status).color
                  }`}
                >
                  {getStatusBadge(orderData.status).label}
                </span>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-end gap-1">
                  <CreditCard className="h-3 w-3" />
                  Payment: {orderData.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                </p>
              </div>
            </div>

            {/* VISUAL TIMELINE STEP PROGRESS */}
            {!isCancelled ? (
              <div className="py-2">
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute left-4 top-4 h-0.5 w-[calc(100%-2rem)] bg-muted -z-0" />
                  <div
                    className="absolute left-4 top-4 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
                    style={{
                      width: `${(Math.min(currentStep, 3) / 3) * (100 - (100 / 4))}%`,
                    }}
                  />

                  {/* 4 Step Dots */}
                  <div className="relative z-10 grid grid-cols-4 text-center">
                    {STEPS.map((step, idx) => {
                      const isComplete = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm ${
                              isComplete
                                ? "bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950"
                                : "bg-muted text-muted-foreground"
                            } ${isCurrent ? "scale-110 ring-4 ring-gold/40" : ""}`}
                          >
                            {isComplete ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                          </div>
                          <p
                            className={`mt-2 text-[11px] font-bold ${
                              isComplete ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="hidden sm:block text-[9px] text-muted-foreground mt-0.5 max-w-[80px]">
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
                This order has been marked as cancelled. If this is an error, please reach out to customer support.
              </div>
            )}

            {/* Delivery Address & Customer Details */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <MapPin className="h-4 w-4 text-gold-dark" />
                Delivery Address:
              </div>
              <p className="font-semibold text-foreground">
                {orderData.customer_name}{" "}
                <span className="font-normal text-muted-foreground">
                  (+91 {orderData.phone})
                </span>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {orderData.address?.line1 || "Customer Address"}
                {orderData.address?.line2 ? `, ${orderData.address.line2}` : ""}
                {orderData.address?.landmark ? `, Near ${orderData.address.landmark}` : ""}
                <br />
                {orderData.address?.city || "Ambikapur"},{" "}
                {orderData.address?.state || "Chhattisgarh"} -{" "}
                {orderData.address?.pincode || "497001"}
              </p>
            </div>

            {/* Items Summary Table */}
            {Array.isArray(orderData.items) && orderData.items.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4 text-xs">
                <span className="font-bold text-foreground">
                  Ordered Products ({orderData.items.length}):
                </span>
                <div className="space-y-1.5 divide-y divide-border/40">
                  {orderData.items.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between pt-1.5 text-muted-foreground">
                      <span>
                        <strong className="text-foreground">{it.qty} ×</strong> {it.name}{" "}
                        {it.variant ? `(${it.variant})` : ""}
                      </span>
                      <span className="font-semibold text-foreground">
                        {inr(it.price * it.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-border pt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{inr(orderData.subtotal || orderData.total)}</span>
                  </div>
                  {(orderData.discount > 0 || orderData.coupon) && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Coupon Discount:</span>
                      <span>−{inr(orderData.discount || 0)}</span>
                    </div>
                  )}
                  {orderData.cod_fee > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>COD Handling Fee:</span>
                      <span>{inr(orderData.cod_fee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-2">
                    <span>Total Amount Payable:</span>
                    <span className="text-emerald-600 font-mono text-base">
                      {inr(orderData.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick WhatsApp Action Buttons */}
            <div className="grid gap-3 sm:grid-cols-2 border-t border-border pt-4">
              <Button
                onClick={() => {
                  const details: WhatsAppOrderDetails = {
                    orderNumber: orderData.order_number,
                    customerName: orderData.customer_name,
                    phone: phone || orderData.phone || "",
                    items: orderData.items || [],
                    subtotal: orderData.subtotal || orderData.total,
                    discount: orderData.discount || 0,
                    shipping: orderData.shipping || 0,
                    codFee: orderData.cod_fee || 0,
                    total: orderData.total,
                    paymentMethod: orderData.payment_method || "cod",
                    status: orderData.status,
                    address: orderData.address || {
                      line1: "Customer Address",
                      city: "Ambikapur",
                      state: "Chhattisgarh",
                      pincode: "497001",
                    },
                    createdAt: orderData.created_at,
                  };
                  sendCustomerInvoiceWhatsApp(details);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm py-5"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Send Invoice to WhatsApp
              </Button>

              <Button
                variant="outline"
                asChild
                className="text-xs border-gold-dark/40 hover:bg-gold-dark/10 py-5"
              >
                <a
                  href={`https://wa.me/919111722209?text=${encodeURIComponent(
                    `Hello MK Enterprises, I am inquiring about my order #${orderData.order_number}. Current status: ${orderData.status}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-emerald-600" />
                  Contact Support on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
