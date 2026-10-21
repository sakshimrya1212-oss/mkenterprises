import { products, type Product } from "./products";

export type AdminOrderStatus = "COD_PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type AdminOrderItem = {
  sku: string;
  qty: number;
  name: string;
  variant: string;
  price: number;
  image?: string | undefined;
  slug?: string | undefined;
};

export type AdminOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: {
    name: string;
    phone: string;
    email?: string;
    line1: string;
    line2?: string;
    landmark?: string;
    pincode: string;
    city: string;
    state: string;
  };
  items: AdminOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  cod_fee: number;
  total: number;
  coupon: string | null;
  payment_method: "cod" | "online";
  status: AdminOrderStatus;
  created_at: string;
};

export type ProductInventoryOverride = {
  sku: string;
  stock: number;
  price: number;
  mrp: number;
  isBestseller: boolean;
  isNew: boolean;
};

const SEED_ORDERS: AdminOrder[] = [];

const STORAGE_ORDERS_KEY = "mk_admin_orders_v2";
const STORAGE_INVENTORY_KEY = "mk_admin_inventory_v1";
const STORAGE_AUTH_KEY = "mk_admin_auth_v1";

export function getStoredAdminAuth(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_AUTH_KEY) === "true";
}

export function setStoredAdminAuth(val: boolean) {
  if (typeof window === "undefined") return;
  if (val) localStorage.setItem(STORAGE_AUTH_KEY, "true");
  else localStorage.removeItem(STORAGE_AUTH_KEY);
}

export function getStoredOrders(): AdminOrder[] {
  if (typeof window === "undefined") return [];
  try {
    // Purge obsolete v1 dummy orders
    if (localStorage.getItem("mk_admin_orders_v1")) {
      localStorage.removeItem("mk_admin_orders_v1");
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify([]));
      return [];
    }
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearAllStoredOrders() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("mk_admin_orders_v1");
  localStorage.removeItem("mk_admin_orders_v2");
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify([]));
}

export function saveStoredOrders(orders: AdminOrder[]) {
  if (typeof window === "undefined") return;
  localStorage.removeItem("mk_admin_orders_v1");
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
}

export function updateOrderStatusInStorage(orderNumber: string, status: AdminOrderStatus): AdminOrder[] {
  const list = getStoredOrders();
  const next = list.map((o) => (o.order_number === orderNumber ? { ...o, status } : o));
  saveStoredOrders(next);
  return next;
}

export function getStoredInventory(): Record<string, ProductInventoryOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_INVENTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredInventory(inv: Record<string, ProductInventoryOverride>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(inv));
}

export function exportOrdersToCsv(orders: AdminOrder[]) {
  const headers = [
    "Order ID",
    "Date",
    "Customer Name",
    "Phone",
    "Email",
    "City",
    "State",
    "Pincode",
    "Items Summary",
    "Subtotal",
    "Discount",
    "Shipping",
    "COD Fee",
    "Total",
    "Payment Method",
    "Status",
  ];

  const rows = orders.map((o) => [
    o.order_number,
    new Date(o.created_at).toLocaleString("en-IN"),
    `"${o.customer_name.replace(/"/g, '""')}"`,
    o.phone,
    o.email ?? "",
    `"${o.address.city.replace(/"/g, '""')}"`,
    `"${o.address.state.replace(/"/g, '""')}"`,
    o.address.pincode,
    `"${o.items.map((i) => `${i.name} (${i.qty})`).join("; ").replace(/"/g, '""')}"`,
    o.subtotal,
    o.discount,
    o.shipping,
    o.cod_fee,
    o.total,
    o.payment_method.toUpperCase(),
    o.status,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `mk_enterprises_orders_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
