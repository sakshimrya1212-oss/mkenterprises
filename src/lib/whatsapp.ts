/**
 * WhatsApp Notification & Invoice Utility for MK Enterprises
 * Supports Option 1: Direct WhatsApp triggers (free, zero-setup, pre-formatted messages)
 */

export const ADMIN_WHATSAPP_NUMBER = "919111722209"; // MK Enterprises Admin (+91 91117 22209)

export interface WhatsAppOrderDetails {
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string | null;
  items: Array<{
    name: string;
    qty: number;
    price: number;
    variant?: string;
  }>;
  subtotal: number;
  discount: number;
  shipping: number;
  codFee: number;
  total: number;
  paymentMethod: "cod" | "online" | string;
  status?: string;
  address: {
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt?: string;
}

/**
 * Format Indian phone number for wa.me URL (removes spaces, +, leading zeroes, ensures country code)
 */
export function sanitizeWhatsAppPhone(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  // If it starts with 0 and is 11 digits, strip 0 and prepend 91
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = "91" + cleaned.slice(1);
  }
  // If 10 digits (standard Indian mobile), prepend 91
  else if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  return cleaned;
}

/**
 * Generate WhatsApp message for Admin when a new customer order is placed
 */
export function buildAdminNewOrderMessage(order: WhatsAppOrderDetails): string {
  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const itemsList = order.items
    .map(
      (it, idx) =>
        `${idx + 1}. *${it.name}* ${it.variant ? `(${it.variant})` : ""}\n   Qty: ${it.qty} × ₹${it.price} = *₹${it.qty * it.price}*`
    )
    .join("\n");

  const addressText = [
    order.address.line1,
    order.address.line2,
    order.address.landmark ? `(Landmark: ${order.address.landmark})` : "",
    `${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
  ]
    .filter(Boolean)
    .join(", ");

  const paymentText =
    order.paymentMethod.toLowerCase() === "cod" ? "Cash on Delivery (COD)" : "Online Paid (Prepaid)";

  return (
    `🚨 *NEW ORDER RECEIVED — MK Enterprises* 🚨\n\n` +
    `*Order ID:* #${order.orderNumber}\n` +
    `*Date:* ${dateStr}\n` +
    `*Payment Mode:* ${paymentText}\n\n` +
    `👤 *Customer Information:*\n` +
    `• Name: *${order.customerName}*\n` +
    `• Mobile: *+91 ${order.phone}*\n` +
    (order.email ? `• Email: ${order.email}\n` : "") +
    `\n📦 *Ordered Items:*\n${itemsList}\n\n` +
    `💰 *Payment Breakdown:*\n` +
    `• Subtotal: ₹${order.subtotal}\n` +
    (order.discount > 0 ? `• Discount: -₹${order.discount}\n` : "") +
    `• Delivery: ${order.shipping === 0 ? "FREE" : `₹${order.shipping}`}\n` +
    (order.codFee > 0 ? `• COD Handling: ₹${order.codFee}\n` : "") +
    `*TOTAL PAYABLE: ₹${order.total}*\n\n` +
    `📍 *Delivery Address:*\n${addressText}\n\n` +
    `🔗 *Admin Dashboard:* https://mkenterprises.com/admin`
  );
}

/**
 * Generate Customer WhatsApp Invoice Receipt
 */
export function buildCustomerInvoiceMessage(order: WhatsAppOrderDetails): string {
  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const itemsList = order.items
    .map(
      (it, idx) =>
        `${idx + 1}. *${it.name}* ${it.variant ? `(${it.variant})` : ""}\n   Qty: ${it.qty} × ₹${it.price} = *₹${it.qty * it.price}*`
    )
    .join("\n");

  const addressText = [
    order.address.line1,
    order.address.city,
    `${order.address.state} - ${order.address.pincode}`,
  ]
    .filter(Boolean)
    .join(", ");

  const paymentText =
    order.paymentMethod.toLowerCase() === "cod" ? "Cash on Delivery (COD)" : "Paid Online";

  return (
    `🌿 *MK ENTERPRISES — ORDER INVOICE* 🌿\n` +
    `_Pure Ayurvedic Wellness & Natural Health_\n\n` +
    `Namaste *${order.customerName}*,\n` +
    `Thank you for ordering with MK Enterprises! Your order has been successfully placed.\n\n` +
    `📄 *Invoice Summary:*\n` +
    `• *Order ID:* #${order.orderNumber}\n` +
    `• *Date:* ${dateStr}\n` +
    `• *Payment Method:* ${paymentText}\n` +
    `• *Status:* Order Received\n\n` +
    `🛍️ *Items:*\n${itemsList}\n\n` +
    `--------------------------------\n` +
    `Subtotal: ₹${order.subtotal}\n` +
    (order.discount > 0 ? `Discount: -₹${order.discount}\n` : "") +
    `Shipping: ${order.shipping === 0 ? "FREE" : `₹${order.shipping}`}\n` +
    (order.codFee > 0 ? `COD Handling: ₹${order.codFee}\n` : "") +
    `*NET TOTAL AMOUNT: ₹${order.total}*\n` +
    `--------------------------------\n\n` +
    `📍 *Shipping To:*\n${order.customerName}\n${addressText}\n\n` +
    `🔍 *Track Order Live:*\n` +
    `Visit our website and enter your Order ID *${order.orderNumber}* and phone *${order.phone}*:\n` +
    `https://mkenterprises.com/track-order\n\n` +
    `📞 *Customer Care / WhatsApp Support:*\n` +
    `+91 91117 22209 | Ambikapur, Surguja, CG`
  );
}

/**
 * Generate Status Update WhatsApp message for customer
 */
export function buildCustomerStatusUpdateMessage(
  order: WhatsAppOrderDetails,
  newStatus: "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "COD_PENDING" | string
): string {
  const orderId = order.orderNumber;
  const name = order.customerName;

  switch (newStatus) {
    case "CONFIRMED":
      return (
        `🌿 *MK Enterprises — Order Confirmed!* 🌿\n\n` +
        `Namaste *${name}*,\n` +
        `Great news! Your order *#${orderId}* has been *CONFIRMED* by our Ayurvedic dispensary team.\n\n` +
        `📦 *Order Details:*\n` +
        `• Total Amount: *₹${order.total}* (${order.paymentMethod.toUpperCase()})\n` +
        `• Status: Preparing for Dispatch\n\n` +
        `We are carefully packaging your Ayurvedic medicines and wellness products with care.\n\n` +
        `🔍 Track order status anytime: https://mkenterprises.com/track-order\n` +
        `Helpline: +91 91117 22209`
      );

    case "SHIPPED":
      return (
        `🚚 *MK Enterprises — Order Shipped!* 🚚\n\n` +
        `Namaste *${name}*,\n` +
        `Your order *#${orderId}* has been *DISPATCHED* and is on its way to you!\n\n` +
        `📍 *Delivery Destination:*\n` +
        `${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}\n\n` +
        `💰 *Amount Payable on Delivery:* *₹${order.total}*\n` +
        (order.paymentMethod.toLowerCase() === "cod"
          ? `⚠️ *Tip:* Please keep the exact cash of ₹${order.total} ready for our delivery courier.\n\n`
          : "") +
        `Expected Delivery: 3-5 business days.\n` +
        `Track: https://mkenterprises.com/track-order\n` +
        `Support: +91 91117 22209`
      );

    case "DELIVERED":
      return (
        `✅ *MK Enterprises — Order Delivered!* 🎉\n\n` +
        `Namaste *${name}*,\n` +
        `Your order *#${orderId}* has been marked as *DELIVERED*!\n\n` +
        `We hope our authentic Ayurvedic formulation brings vitality, health, and wellness to your life.\n\n` +
        `⭐ *Customer Feedback:*\n` +
        `If you need any dosage guidance or have questions, please reply directly to this chat.\n\n` +
        `Thank you for trusting *MK Enterprises*!\n` +
        `Website: https://mkenterprises.com`
      );

    case "CANCELLED":
      return (
        `⚠️ *MK Enterprises — Order Cancelled*\n\n` +
        `Namaste *${name}*,\n` +
        `Your order *#${orderId}* has been cancelled.\n\n` +
        `If this was done in error or you have questions, please contact our support team at +91 91117 22209.`
      );

    default:
      return (
        `🌿 *MK Enterprises — Order Update*\n\n` +
        `Namaste *${name}*,\n` +
        `Your order *#${orderId}* status has been updated to: *${newStatus.replace(/_/g, " ")}*.\n\n` +
        `Total: ₹${order.total}\n` +
        `Track your order: https://mkenterprises.com/track-order\n` +
        `Support: +91 91117 22209`
      );
  }
}

/**
 * Open WhatsApp with a pre-filled message (works seamlessly on desktop & mobile)
 */
export function openWhatsAppLink(phone: string, message: string) {
  const cleanPhone = sanitizeWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return url;
}

/**
 * Trigger Admin alert on new order
 */
export function sendAdminNewOrderWhatsApp(order: WhatsAppOrderDetails) {
  const msg = buildAdminNewOrderMessage(order);
  return openWhatsAppLink(ADMIN_WHATSAPP_NUMBER, msg);
}

/**
 * Trigger Customer Invoice on new order
 */
export function sendCustomerInvoiceWhatsApp(order: WhatsAppOrderDetails) {
  const msg = buildCustomerInvoiceMessage(order);
  return openWhatsAppLink(order.phone, msg);
}

/**
 * Trigger Status Update WhatsApp message to customer
 */
export function sendCustomerStatusWhatsApp(
  order: WhatsAppOrderDetails,
  newStatus: string
) {
  const msg = buildCustomerStatusUpdateMessage(order, newStatus);
  return openWhatsAppLink(order.phone, msg);
}
