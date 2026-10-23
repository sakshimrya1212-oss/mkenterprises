import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  CreditCard,
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  Info,
  BadgeAlert,
  MessageCircle,
  FileText,
  Send,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { computeTotals } from "@/lib/pricing";
import { createOrder, verifyPayment, markPaymentFailed } from "@/lib/orders.functions";
import { inr } from "@/lib/products";
import { getStoredOrders, saveStoredOrders, type AdminOrder } from "@/lib/admin";
import {
  sendAdminNewOrderWhatsApp,
  sendCustomerInvoiceWhatsApp,
  type WhatsAppOrderDetails,
} from "@/lib/whatsapp";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment & Checkout — MK Enterprises" },
      { name: "description", content: "Select your preferred payment method." },
      { property: "og:title", content: "Payment & Checkout — MK Enterprises" },
    ],
  }),
  component: PaymentPage,
});

interface SavedAddress {
  name: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  pincode: string;
  city?: string;
  state?: string;
}

function PaymentPage() {
  const { lines, coupon, clear } = useCart();
  const nav = useNavigate();
  const place = useServerFn(createOrder);
  const verify = useServerFn(verifyPayment);
  const failPayment = useServerFn(markPaymentFailed);

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [busy, setBusy] = useState(false);
  const [address, setAddress] = useState<SavedAddress | null>(null);
  const [placedOrder, setPlacedOrder] = useState<WhatsAppOrderDetails | null>(null);

  // Load saved shipping address from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mk_checkout_address");
      if (stored) {
        setAddress(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Could not parse saved address", e);
    }
  }, []);

  const pricingMethod = paymentMethod === "cod" ? "cod" : "online";
  const t = computeTotals(lines, coupon, pricingMethod);

  // Handle Cash on Delivery order placement
  const handlePlaceCodOrder = async () => {
    if (!address || !address.name || !address.phone || !address.line1) {
      toast.error("Please provide your delivery address first.", {
        description: "Redirecting to address details...",
      });
      nav({ to: "/checkout" });
      return;
    }

    setBusy(true);
    try {
      const cleanPhone = (address.phone || "").replace(/\D/g, "").slice(-10) || "9111722209";
      const cleanPincode = (address.pincode || "497001").replace(/\D/g, "").slice(0, 6) || "497001";
      const orderCity = (address.city || "").trim() || "Ambikapur";
      const orderState = (address.state || "").trim() || "Chhattisgarh";

      let generatedOrderNumber = "MK" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);

      // 1. Direct insert to Supabase database orders table
      try {
        const { error: supaInsertErr } = await supabase.from("orders").insert({
          order_number: generatedOrderNumber,
          customer_name: address.name.trim(),
          phone: cleanPhone,
          email: address.email || null,
          address: {
            name: address.name.trim(),
            phone: cleanPhone,
            email: address.email || null,
            line1: address.line1.trim(),
            line2: address.line2 || "",
            landmark: address.landmark || "",
            pincode: cleanPincode,
            city: orderCity,
            state: orderState,
          },
          items: t.items.map((it) => ({
            sku: it.sku || "MK-" + it.name.slice(0, 3).toUpperCase(),
            name: it.name,
            qty: it.qty,
            price: it.price,
            variant: it.variant || "Standard",
          })),
          subtotal: t.subtotal,
          discount: t.discount,
          shipping: t.shipping,
          cod_fee: t.codFee,
          total: t.total,
          coupon: coupon || null,
          payment_method: "cod",
          status: "COD_PENDING",
        });
        if (supaInsertErr) {
          console.warn("Direct Supabase order insert note:", supaInsertErr);
        }
      } catch (insertErr) {
        console.warn("Direct Supabase order insert catch:", insertErr);
      }

      // 2. Call server function placement as well
      try {
        const { data: s } = await supabase.auth.getSession();
        const r = await place({
          data: {
            lines,
            coupon,
            method: "cod",
            address: {
              name: address.name.trim(),
              phone: cleanPhone,
              email: address.email || "",
              line1: address.line1.trim(),
              line2: address.line2 || "",
              landmark: address.landmark || "",
              pincode: cleanPincode,
              city: orderCity,
              state: orderState,
            },
            accessToken: s.session?.access_token ?? null,
          },
        });
        if (r && r.orderNumber) {
          generatedOrderNumber = r.orderNumber;
        }
      } catch (srvErr) {
        console.warn("Backend server placement note (continuing with COD order):", srvErr);
      }

      const orderDetails: WhatsAppOrderDetails = {
        orderNumber: generatedOrderNumber,
        customerName: address.name,
        phone: cleanPhone,
        email: address.email || null,
        items: t.items.map((it) => ({
          name: it.name,
          qty: it.qty,
          price: it.price,
          variant: it.variant,
        })),
        subtotal: t.subtotal,
        discount: t.discount,
        shipping: t.shipping,
        codFee: t.codFee,
        total: t.total,
        paymentMethod: "cod",
        status: "COD_PENDING",
        address: {
          line1: address.line1,
          line2: address.line2 || "",
          landmark: address.landmark || "",
          pincode: address.pincode,
          city: address.city || "Ambikapur",
          state: address.state || "Chhattisgarh",
        },
        createdAt: new Date().toISOString(),
      };

      // Sync into admin local storage so admin panel reflects it immediately
      try {
        const adminOrder: AdminOrder = {
          id: "ord-" + Date.now(),
          order_number: orderDetails.orderNumber,
          customer_name: orderDetails.customerName,
          phone: orderDetails.phone,
          email: orderDetails.email ?? null,
          address: {
            name: orderDetails.customerName,
            phone: orderDetails.phone,
            ...(orderDetails.email ? { email: orderDetails.email } : {}),
            line1: orderDetails.address.line1,
            line2: orderDetails.address.line2 || "",
            landmark: orderDetails.address.landmark || "",
            pincode: orderDetails.address.pincode,
            city: orderDetails.address.city,
            state: orderDetails.address.state,
          },
          items: orderDetails.items.map((it) => ({
            sku: "MK-" + it.name.slice(0, 3).toUpperCase(),
            qty: it.qty,
            name: it.name,
            variant: it.variant || "Standard",
            price: it.price,
          })),
          subtotal: orderDetails.subtotal,
          discount: orderDetails.discount,
          shipping: orderDetails.shipping,
          cod_fee: orderDetails.codFee,
          total: orderDetails.total,
          coupon: coupon || null,
          payment_method: "cod",
          status: "COD_PENDING",
          created_at: orderDetails.createdAt || new Date().toISOString(),
        };
        const currentOrders = getStoredOrders();
        saveStoredOrders([adminOrder, ...currentOrders]);
      } catch (err) {
        console.error("Local storage order sync note:", err);
      }

      // Automatically launch WhatsApp alert for admin in new tab
      try {
        sendAdminNewOrderWhatsApp(orderDetails);
      } catch (err) {
        console.error("WhatsApp admin trigger error:", err);
      }

      setPlacedOrder(orderDetails);
      clear();
      localStorage.removeItem("mk_checkout_address");

      toast.success(`Order ${generatedOrderNumber} placed successfully!`, {
        description: "WhatsApp alert sent to Admin. You can now get your invoice on WhatsApp.",
        duration: 10000,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Handler for Razorpay online payment
  const handlePlaceRazorpayOrder = async () => {
    if (!address || !address.name || !address.phone || !address.line1) {
      toast.error("Please provide your delivery address first.", {
        description: "Redirecting to address details...",
      });
      nav({ to: "/checkout" });
      return;
    }

    setBusy(true);
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Unable to load Razorpay payment SDK. Please check your internet connection.");
      }

      const cleanPhone = (address.phone || "").replace(/\D/g, "").slice(-10) || "9111722209";
      const cleanPincode = (address.pincode || "497001").replace(/\D/g, "").slice(0, 6) || "497001";
      const orderCity = (address.city || "").trim() || "Ambikapur";
      const orderState = (address.state || "").trim() || "Chhattisgarh";

      const { data: s } = await supabase.auth.getSession();
      const res = await place({
        data: {
          lines,
          coupon,
          method: "online",
          address: {
            name: address.name.trim(),
            phone: cleanPhone,
            email: address.email || "",
            line1: address.line1.trim(),
            line2: address.line2 || "",
            landmark: address.landmark || "",
            pincode: cleanPincode,
            city: orderCity,
            state: orderState,
          },
          accessToken: s.session?.access_token ?? null,
        },
      });

      if (!res || !res.razorpayOrderId) {
        throw new Error("Could not initialize Razorpay order. Please choose Cash on Delivery.");
      }

      const rzpKey = res.keyId || import.meta.env["VITE_RAZORPAY_KEY_ID"];
      if (!rzpKey) {
        throw new Error("Razorpay payment gateway key is not available. Please try Cash on Delivery.");
      }

      const options = {
        key: rzpKey,
        amount: Math.round(t.total * 100),
        currency: "INR",
        name: "MK Enterprises",
        description: `Order #${res.orderNumber}`,
        image: "/favicon.png",
        order_id: res.razorpayOrderId,
        prefill: {
          name: address.name.trim(),
          contact: cleanPhone,
          email: address.email || "",
        },
        theme: {
          color: "#C59B27",
        },
        modal: {
          ondismiss: async () => {
            setBusy(false);
            try {
              await failPayment({ data: { orderNumber: res.orderNumber } });
            } catch (err) {}
            toast.info("Payment window closed.", {
              description: "You can retry paying or select Cash on Delivery.",
            });
          },
        },
        handler: async (resp: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setBusy(true);
            const verifyRes = await verify({
              data: {
                orderNumber: res.orderNumber,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              },
            });

            if (!verifyRes.ok) {
              throw new Error("Payment signature verification failed. Please contact support.");
            }

            const orderDetails: WhatsAppOrderDetails = {
              orderNumber: res.orderNumber,
              customerName: address.name,
              phone: cleanPhone,
              email: address.email || null,
              items: t.items.map((it) => ({
                name: it.name,
                qty: it.qty,
                price: it.price,
                variant: it.variant,
              })),
              subtotal: t.subtotal,
              discount: t.discount,
              shipping: t.shipping,
              codFee: 0,
              total: t.total,
              paymentMethod: "online",
              status: "PAID",
              address: {
                line1: address.line1,
                line2: address.line2 || "",
                landmark: address.landmark || "",
                pincode: address.pincode,
                city: address.city || "Ambikapur",
                state: address.state || "Chhattisgarh",
              },
              createdAt: new Date().toISOString(),
            };

            // Direct update to Supabase orders table
            try {
              await supabase
                .from("orders")
                .update({
                  status: "PAID",
                  razorpay_payment_id: resp.razorpay_payment_id,
                  updated_at: new Date().toISOString(),
                })
                .eq("order_number", res.orderNumber);
            } catch (supaErr) {
              console.warn("Direct Supabase update note:", supaErr);
            }

            // Sync into admin local storage
            try {
              const adminOrder: AdminOrder = {
                id: "ord-" + Date.now(),
                order_number: res.orderNumber,
                customer_name: orderDetails.customerName,
                phone: orderDetails.phone,
                email: orderDetails.email ?? null,
                address: {
                  name: orderDetails.customerName,
                  phone: orderDetails.phone,
                  ...(orderDetails.email ? { email: orderDetails.email } : {}),
                  line1: orderDetails.address.line1,
                  line2: orderDetails.address.line2 || "",
                  landmark: orderDetails.address.landmark || "",
                  pincode: orderDetails.address.pincode,
                  city: orderCity,
                  state: orderState,
                },
                items: orderDetails.items.map((it) => ({
                  sku: "MK-" + it.name.slice(0, 3).toUpperCase(),
                  qty: it.qty,
                  name: it.name,
                  variant: it.variant || "Standard",
                  price: it.price,
                })),
                subtotal: orderDetails.subtotal,
                discount: orderDetails.discount,
                shipping: orderDetails.shipping,
                cod_fee: 0,
                total: orderDetails.total,
                coupon: coupon || null,
                payment_method: "online",
                status: "PAID",
                created_at: orderDetails.createdAt || new Date().toISOString(),
              };
              const currentOrders = getStoredOrders();
              saveStoredOrders([adminOrder, ...currentOrders]);
            } catch (err) {
              console.error("Local storage order sync note:", err);
            }

            // WhatsApp alert to Admin
            try {
              sendAdminNewOrderWhatsApp(orderDetails);
            } catch (err) {
              console.error("WhatsApp admin trigger error:", err);
            }

            setPlacedOrder(orderDetails);
            clear();
            localStorage.removeItem("mk_checkout_address");

            toast.success(`Payment Verified! Order ${res.orderNumber} placed successfully!`, {
              description: "WhatsApp alert sent to Admin. You can now get your invoice on WhatsApp.",
              duration: 10000,
            });
          } catch (verifyErr) {
            toast.error(verifyErr instanceof Error ? verifyErr.message : "Payment verification error.");
          } finally {
            setBusy(false);
          }
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on("payment.failed", async (failResp: any) => {
        setBusy(false);
        try {
          await failPayment({ data: { orderNumber: res.orderNumber } });
        } catch (e) {}
        toast.error("Payment failed", {
          description: failResp.error?.description || "Transaction was declined or cancelled.",
        });
      });
      rzpInstance.open();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not initialize payment. Please try again.");
      setBusy(false);
    }
  };

  // Order Placed Success View with instant WhatsApp buttons
  if (placedOrder) {
    return (
      <>
        <PageHero
          title="Order Confirmed!"
          sub="Your Ayurvedic wellness order has been placed successfully."
        />

        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-card p-6 shadow-xl sm:p-8 space-y-6">
            {/* Header Badge */}
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                Thank You for Your Order!
              </h2>
              <p className="text-sm text-muted-foreground">
                Your order <span className="font-bold text-foreground">#{placedOrder.orderNumber}</span> has been received and is being prepared for dispatch.
              </p>
            </div>

            {/* Order Highlights Box */}
            <div className="grid gap-4 rounded-xl bg-muted/60 p-4 text-xs sm:grid-cols-3">
              <div>
                <span className="text-muted-foreground">Order ID:</span>
                <p className="text-sm font-bold text-foreground font-mono">#{placedOrder.orderNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Mode:</span>
                <p className="text-sm font-bold text-foreground uppercase">
                  {placedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid Online"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Payable:</span>
                <p className="text-sm font-bold text-emerald-600">{inr(placedOrder.total)}</p>
              </div>
            </div>

            {/* WHATSAPP AUTOMATION SECTION */}
            <div className="space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">
                  WhatsApp Order Updates & Invoice
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Button 1: Send Invoice to Customer WhatsApp */}
                <div className="flex flex-col justify-between rounded-lg border border-emerald-500/30 bg-white dark:bg-zinc-900 p-4 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <FileText className="h-4 w-4" />
                      Customer Invoice
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Get full itemized order invoice directly on your WhatsApp.
                    </p>
                  </div>
                  <Button
                    onClick={() => sendCustomerInvoiceWhatsApp(placedOrder)}
                    className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow"
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    Get Invoice on WhatsApp
                  </Button>
                </div>

                {/* Button 2: Send Order Confirmation on WhatsApp */}
                <div className="flex flex-col justify-between rounded-lg border border-blue-500/30 bg-white dark:bg-zinc-900 p-4 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                      <Send className="h-4 w-4" />
                      Order Confirmation
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Send your order details directly to MK Enterprises on WhatsApp for quick confirmation.
                    </p>
                  </div>
                  <Button
                    onClick={() => sendAdminNewOrderWhatsApp(placedOrder)}
                    variant="outline"
                    className="mt-3 w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold text-xs"
                  >
                    <Send className="mr-1.5 h-4 w-4" />
                    Confirm Order on WhatsApp
                  </Button>
                </div>
              </div>
            </div>

            {/* Items & Shipping Summary */}
            <div className="space-y-3 border-t pt-4 text-xs">
              <div className="flex justify-between items-center font-semibold text-foreground">
                <span>Shipping Address:</span>
                <span className="text-muted-foreground">
                  {placedOrder.customerName}
                </span>
              </div>
              <p className="text-muted-foreground">
                {placedOrder.address.line1}, {placedOrder.address.city}, {placedOrder.address.state} - {placedOrder.address.pincode}
              </p>

              <div className="border-t pt-3">
                <span className="font-semibold text-foreground">Items ({placedOrder.items.length}):</span>
                <div className="mt-2 space-y-1.5">
                  {placedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-muted-foreground">
                      <span>{it.qty} × {it.name} {it.variant ? `(${it.variant})` : ""}</span>
                      <span className="font-medium text-foreground">{inr(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <Button variant="outline" asChild className="text-xs">
                <Link to="/track-order">
                  <Package className="mr-1.5 h-4 w-4" /> Track Order Status
                </Link>
              </Button>
              <Button asChild className="bg-gold-gradient font-bold text-black text-xs">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (t.items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-4 bg-gold-gradient font-bold text-black" asChild>
          <Link to="/shop">Shop Ayurvedic Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHero
        title="Payment & Review"
        sub="Step 2 of 2: Select your payment method to complete your order."
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Step indicator breadcrumb */}
        <div className="mb-8 flex items-center justify-center gap-3 text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
          <Link to="/cart" className="hover:text-gold-dark transition">
            1. Cart
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/checkout" className="hover:text-gold-dark transition">
            2. Address & Shipping
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-bold text-gold-dark border-b-2 border-gold-dark pb-0.5">
            3. Payment (Final Step)
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Payment Options Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Delivery address preview card */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gold-dark" />
                  <h3 className="text-sm font-bold uppercase tracking-brand">
                    Delivering To
                  </h3>
                </div>
                <Link
                  to="/checkout"
                  className="flex items-center gap-1 text-xs font-semibold text-gold-dark hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" /> Change Address
                </Link>
              </div>

              {address ? (
                <div className="mt-3 text-sm space-y-1">
                  <p className="font-bold text-foreground">
                    {address.name}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({address.phone})
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                    {address.landmark ? `, Near ${address.landmark}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {[address.city, address.state, address.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between text-sm text-amber-600">
                  <span>No address details provided yet.</span>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/checkout">Add Address</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <h3 className="text-base font-bold uppercase tracking-brand flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gold-dark" /> Choose Payment Method
              </h3>

              {/* CARD 1: RAZORPAY (ONLINE PAYMENT - ACTIVE) */}
              <div
                onClick={() => setPaymentMethod("razorpay")}
                className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all shadow-sm ${
                  paymentMethod === "razorpay"
                    ? "border-gold-dark bg-gold-dark/5 ring-1 ring-gold-dark/30"
                    : "border-border bg-card hover:border-gold-dark/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="mt-1 h-4 w-4 text-gold-dark accent-gold-dark cursor-pointer"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-foreground">
                          Razorpay Online Payment
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> ACTIVE & SECURE
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Pay securely with UPI (Google Pay, PhonePe, Paytm, BHIM), Cards (Visa, Mastercard, RuPay) & Net Banking.
                      </p>

                      {/* Payment Badges Logos */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="rounded bg-muted px-2 py-1 font-semibold text-foreground">UPI / QR</span>
                        <span className="rounded bg-muted px-2 py-1 font-semibold text-foreground">PhonePe</span>
                        <span className="rounded bg-muted px-2 py-1 font-semibold text-foreground">Google Pay</span>
                        <span className="rounded bg-muted px-2 py-1 font-semibold text-foreground">Paytm</span>
                        <span className="rounded bg-muted px-2 py-1 font-semibold text-foreground">Visa / Mastercard / RuPay</span>
                        <span className="rounded bg-muted px-2 py-1 font-semibold text-foreground">Net Banking</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instant activation banner */}
                <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200">Instant Order Confirmation & 0% Extra Charges</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-300">
                        256-bit encrypted & verified by Razorpay. Orders placed online get priority express dispatch!
                      </p>
                    </div>
                  </div>
                </div>

                {paymentMethod === "razorpay" && (
                  <div className="mt-4 pt-3 border-t">
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={handlePlaceRazorpayOrder}
                      className="w-full bg-gold-gradient font-bold uppercase tracking-wider text-black hover:opacity-90 shadow-md py-6 text-sm sm:text-base cursor-pointer"
                      size="lg"
                    >
                      {busy ? (
                        "Opening Razorpay Payment..."
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Lock className="h-5 w-5" />
                          Pay {inr(t.total)} via Razorpay
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* CARD 2: CASH ON DELIVERY (ACTIVE) */}
              <div
                onClick={() => setPaymentMethod("cod")}
                className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all shadow-sm ${
                  paymentMethod === "cod"
                    ? "border-gold-dark bg-gold-dark/5"
                    : "border-border bg-card hover:border-gold-dark/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 h-4 w-4 text-gold-dark accent-gold-dark"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-foreground">
                          Cash on Delivery (COD)
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> AVAILABLE NOW
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          ₹0 HANDLING FEE
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Pay in cash or UPI QR directly to the delivery partner when your order arrives.
                      </p>
                      <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ No extra handling charges on COD (100% Free)
                      </p>
                    </div>
                  </div>
                </div>

                {paymentMethod === "cod" && (
                  <div className="mt-4 pt-3 border-t">
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={handlePlaceCodOrder}
                      className="w-full bg-gold-gradient font-bold uppercase tracking-wider text-black hover:opacity-90 shadow-md py-6"
                      size="lg"
                    >
                      {busy ? (
                        "Placing Your Order..."
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <ShieldCheck className="h-5 w-5" />
                          Confirm Order via Cash on Delivery ({inr(t.total)})
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="h-fit space-y-4 rounded-xl border border-gold-dark/40 bg-card p-5 shadow-sm lg:sticky lg:top-28">
            <h3 className="font-bold uppercase tracking-brand text-foreground">
              Order Summary
            </h3>

            {/* Item list */}
            <div className="space-y-2 border-b pb-3 max-h-56 overflow-y-auto">
              {t.items.map((i) => (
                <div key={i.sku} className="flex justify-between text-xs">
                  <span className="line-clamp-1 flex-1 pr-2">
                    {i.name} <span className="text-muted-foreground">× {i.qty}</span>
                  </span>
                  <span className="font-semibold">{inr(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{inr(t.subtotal)}</span>
              </div>
              {t.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({t.coupon})</span>
                  <span>−{inr(t.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{t.shipping ? inr(t.shipping) : "FREE"}</span>
              </div>
              {t.codFee > 0 && (
                <div className="flex justify-between">
                  <span>COD fee</span>
                  <span>{inr(t.codFee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 text-lg font-bold text-foreground">
                <span>Total</span>
                <span>{inr(t.total)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Prices inclusive of all applicable GST
              </p>
            </div>

            {/* Safety Guarantee */}
            <div className="rounded-lg bg-muted/60 p-3 text-xs space-y-1.5 text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-gold-dark" />
                100% Ayurvedic & Genuine Products
              </div>
              <p className="text-[11px]">
                Dispatched with tamper-proof packaging and real-time tracking updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
