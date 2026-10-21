import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, Package, Search, Truck, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/site/Layout";
import { getOrderSummary } from "@/lib/orders.functions";
import { inr } from "@/lib/products";
import { getStoredOrders } from "@/lib/admin";
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

function TrackPage() {
  const fn = useServerFn(getOrderSummary);
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any | "none" | null>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderNo.trim() || !phone.trim()) return;

    setLoading(true);
    try {
      const cleanNo = orderNo.trim().toUpperCase();
      const cleanPhone = phone.trim().replace(/\D/g, "");

      // First query server database
      let res = await fn({ data: { orderNumber: cleanNo, phone: cleanPhone } });

      // Fallback to local admin orders cache if not returned by server
      if (!res) {
        const local = getStoredOrders().find(
          (o) =>
            o.order_number.toUpperCase() === cleanNo &&
            o.phone.replace(/\D/g, "") === cleanPhone
        );
        if (local) {
          res = {
            order_number: local.order_number,
            customer_name: local.customer_name,
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

      setOrderData(res ?? "none");
    } catch {
      // Local fallback
      const cleanNo = orderNo.trim().toUpperCase();
      const cleanPhone = phone.trim().replace(/\D/g, "");
      const local = getStoredOrders().find(
        (o) =>
          o.order_number.toUpperCase() === cleanNo &&
          o.phone.replace(/\D/g, "") === cleanPhone
      );
      if (local) {
        setOrderData({
          order_number: local.order_number,
          customer_name: local.customer_name,
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
        });
      } else {
        setOrderData("none");
      }
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
        return { label: "Order Received (COD Pending)", color: "bg-amber-100 text-amber-800 border-amber-300" };
    }
  };

  return (
    <>
      <PageHero
        title="Track Your Order"
        sub="Check live status, dispatch progress, and download your WhatsApp invoice."
      />

      <div className="mx-auto max-w-xl space-y-6 px-4 py-12">
        {/* Form Card */}
        <form onSubmit={handleTrack} className="rounded-2xl border border-gold-dark/40 bg-card p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Order ID
            </label>
            <Input
              placeholder="e.g. MK123456"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              10-Digit Mobile Number
            </label>
            <Input
              placeholder="Enter mobile used during checkout"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-gold-gradient font-bold text-black">
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Searching Order..." : "Track Order"}
          </Button>
        </form>

        {/* Not Found State */}
        {orderData === "none" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
            <p className="font-semibold">No order found with these details.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please verify your Order ID and 10-digit mobile number, or contact us on WhatsApp (+91 91117 22209).
            </p>
          </div>
        )}

        {/* Result State */}
        {orderData && orderData !== "none" && (
          <div className="rounded-2xl border border-gold-dark/40 bg-card p-6 shadow-lg space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
              <div>
                <span className="text-xs text-muted-foreground">Order ID</span>
                <p className="font-mono text-lg font-bold text-foreground">#{orderData.order_number}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold border ${getStatusBadge(orderData.status).color}`}>
                {getStatusBadge(orderData.status).label}
              </span>
            </div>

            {/* Customer & Total */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Recipient:</span>
                <p className="font-semibold text-foreground">{orderData.customer_name}</p>
                <p className="text-muted-foreground">{orderData.address?.city}, {orderData.address?.state}</p>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">Total Amount:</span>
                <p className="text-base font-bold text-emerald-600">{inr(orderData.total)}</p>
                <p className="text-muted-foreground uppercase text-[10px]">{orderData.payment_method}</p>
              </div>
            </div>

            {/* Items */}
            {Array.isArray(orderData.items) && orderData.items.length > 0 && (
              <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5 border">
                <p className="font-semibold text-foreground">Ordered Items:</p>
                {orderData.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-muted-foreground">
                    <span>{it.qty} × {it.name} {it.variant ? `(${it.variant})` : ""}</span>
                    <span className="font-medium text-foreground">{inr(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* WhatsApp Invoice Button */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
              <p className="text-xs font-medium text-foreground">
                Need a copy of your receipt or invoice?
              </p>
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Send Invoice to My WhatsApp
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
