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

const SEED_ORDERS: AdminOrder[] = [
  {
    id: "ord-001",
    order_number: "MK9K28A12",
    customer_name: "Rajesh Sharma",
    phone: "9839012345",
    email: "rajesh.sharma@example.com",
    address: {
      name: "Rajesh Sharma",
      phone: "9839012345",
      email: "rajesh.sharma@example.com",
      line1: "Flat 402, Gomti Enclave, Gomti Nagar",
      line2: "Near Wave Mall",
      landmark: "Opposite High Court Gate",
      pincode: "226010",
      city: "Lucknow",
      state: "Uttar Pradesh",
    },
    items: [
      { sku: "MK-MAH-80", qty: 2, name: "Mahaveni Instant Pain Relief Oil", variant: "80 ml", price: 299, image: products[0]?.images[0], slug: products[0]?.slug },
      { sku: "MK-MHD-450", qty: 1, name: "Mahodadhi Joint & Muscular Relief Syrup", variant: "450 ml", price: 399, image: products[8]?.images[0], slug: products[8]?.slug },
    ],
    subtotal: 997,
    discount: 150,
    shipping: 0,
    cod_fee: 40,
    total: 887,
    coupon: "MK15",
    payment_method: "cod",
    status: "DELIVERED",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "ord-002",
    order_number: "MK8J15B44",
    customer_name: "Priya Verma",
    phone: "9811234567",
    email: "priya.verma@example.com",
    address: {
      name: "Priya Verma",
      phone: "9811234567",
      email: "priya.verma@example.com",
      line1: "B-42, South Extension Part II",
      line2: "2nd Floor",
      landmark: "Near Arya Samaj Mandir",
      pincode: "110049",
      city: "New Delhi",
      state: "Delhi",
    },
    items: [
      { sku: "MK-10D-200", qty: 2, name: "10days Complete Wellness Syrup", variant: "200 ml", price: 269, image: products[9]?.images[0], slug: products[9]?.slug },
      { sku: "MK-KNG-30", qty: 1, name: "Kenko Gold Multivitamin HPMC Capsules", variant: "30 Capsules", price: 749, image: products[6]?.images[0], slug: products[6]?.slug },
    ],
    subtotal: 1287,
    discount: 193,
    shipping: 0,
    cod_fee: 0,
    total: 1094,
    coupon: "MK15",
    payment_method: "online",
    status: "SHIPPED",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "ord-003",
    order_number: "MK7H91C30",
    customer_name: "Amit Patel",
    phone: "9725012389",
    email: "amit.patel@example.com",
    address: {
      name: "Amit Patel",
      phone: "9725012389",
      email: "amit.patel@example.com",
      line1: "14, Shanti Shantiniketan Society",
      line2: "Bodakdev",
      landmark: "Behind ISKCON Temple",
      pincode: "380054",
      city: "Ahmedabad",
      state: "Gujarat",
    },
    items: [
      { sku: "MK-ARG-450", qty: 2, name: "Argoides Ayurvedic Syrup (450 ml)", variant: "450 ml", price: 429, image: products[2]?.images[0], slug: products[2]?.slug },
      { sku: "MK-ARG-SAC", qty: 1, name: "Argoides Ayurvedic Sachets (10 x 10g)", variant: "10 x 10g Sachets", price: 399, image: products[3]?.images[0], slug: products[3]?.slug },
    ],
    subtotal: 1257,
    discount: 189,
    shipping: 0,
    cod_fee: 0,
    total: 1068,
    coupon: "MK15",
    payment_method: "online",
    status: "CONFIRMED",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "ord-004",
    order_number: "MK6G43D88",
    customer_name: "Sunita Rao",
    phone: "9845012999",
    email: "sunita.rao@example.com",
    address: {
      name: "Sunita Rao",
      phone: "9845012999",
      email: "sunita.rao@example.com",
      line1: "Villa 108, Prestige Silver Oak",
      line2: "ITPL Main Road, Whitefield",
      landmark: "Near Forum Value Mall",
      pincode: "560066",
      city: "Bengaluru",
      state: "Karnataka",
    },
    items: [
      { sku: "MK-GMO-200", qty: 2, name: "G-Mom Maternal & Women Wellness Syrup", variant: "200 ml", price: 269, image: products[4]?.images[0], slug: products[4]?.slug },
      { sku: "MK-KIY-30", qty: 1, name: "Kiyo Pet Digestive Enzyme Therapy Capsules", variant: "30 Capsules", price: 369, image: products[7]?.images[0], slug: products[7]?.slug },
    ],
    subtotal: 907,
    discount: 136,
    shipping: 0,
    cod_fee: 40,
    total: 811,
    coupon: "MK15",
    payment_method: "cod",
    status: "COD_PENDING",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "ord-005",
    order_number: "MK5F22E19",
    customer_name: "Vikram Singh",
    phone: "9414012345",
    email: "vikram.singh@example.com",
    address: {
      name: "Vikram Singh",
      phone: "9414012345",
      email: "vikram.singh@example.com",
      line1: "Plot 77, C-Scheme",
      line2: "Subhash Marg",
      landmark: "Near Statue Circle",
      pincode: "302001",
      city: "Jaipur",
      state: "Rajasthan",
    },
    items: [
      { sku: "MK-JMB-20", qty: 2, name: "Jumbo Plus Effervescent Tablets (20 Tabs)", variant: "20 Effervescent Tablets", price: 299, image: products[5]?.images[0], slug: products[5]?.slug },
    ],
    subtotal: 598,
    discount: 90,
    shipping: 0,
    cod_fee: 40,
    total: 548,
    coupon: "MK15",
    payment_method: "cod",
    status: "DELIVERED",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "ord-006",
    order_number: "MK4E88F72",
    customer_name: "Deepak Gupta",
    phone: "9935012345",
    email: "deepak.gupta@example.com",
    address: {
      name: "Deepak Gupta",
      phone: "9935012345",
      email: "deepak.gupta@example.com",
      line1: "112/240, Swaroop Nagar",
      line2: "Opposite Medical College",
      landmark: "Near Motijheel Gate 2",
      pincode: "208002",
      city: "Kanpur",
      state: "Uttar Pradesh",
    },
    items: [
      { sku: "MK-MAH-80", qty: 3, name: "Mahaveni Instant Pain Relief Oil", variant: "80 ml", price: 299, image: products[0]?.images[0], slug: products[0]?.slug },
    ],
    subtotal: 897,
    discount: 135,
    shipping: 0,
    cod_fee: 0,
    total: 762,
    coupon: "MK15",
    payment_method: "online",
    status: "DELIVERED",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: "ord-007",
    order_number: "MK3D77G55",
    customer_name: "Anjali Deshmukh",
    phone: "9822012345",
    email: "anjali.deshmukh@example.com",
    address: {
      name: "Anjali Deshmukh",
      phone: "9822012345",
      email: "anjali.deshmukh@example.com",
      line1: "A-501, Rohan Mithila, Viman Nagar",
      line2: "New Airport Road",
      landmark: "Near Symbiosis College",
      pincode: "411014",
      city: "Pune",
      state: "Maharashtra",
    },
    items: [
      { sku: "MK-KNG-30", qty: 1, name: "Kenko Gold Multivitamin HPMC Capsules", variant: "30 Capsules", price: 749, image: products[6]?.images[0], slug: products[6]?.slug },
      { sku: "MK-10D-200", qty: 1, name: "10days Complete Wellness Syrup", variant: "200 ml", price: 269, image: products[9]?.images[0], slug: products[9]?.slug },
    ],
    subtotal: 1018,
    discount: 153,
    shipping: 0,
    cod_fee: 0,
    total: 865,
    coupon: "MK15",
    payment_method: "online",
    status: "SHIPPED",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: "ord-008",
    order_number: "MK2C66H91",
    customer_name: "Rakesh Mishra",
    phone: "9450012345",
    email: null,
    address: {
      name: "Rakesh Mishra",
      phone: "9450012345",
      line1: "House No 28, Lanka",
      line2: "Near BHU Main Gate",
      landmark: "Near Sankat Mochan",
      pincode: "221005",
      city: "Varanasi",
      state: "Uttar Pradesh",
    },
    items: [
      { sku: "MK-ARG-200", qty: 2, name: "Argoides Ayurvedic Syrup (200 ml)", variant: "200 ml", price: 229, image: products[1]?.images[0], slug: products[1]?.slug },
      { sku: "MK-KIY-30", qty: 1, name: "Kiyo Pet Digestive Enzyme Therapy Capsules", variant: "30 Capsules", price: 369, image: products[7]?.images[0], slug: products[7]?.slug },
    ],
    subtotal: 827,
    discount: 124,
    shipping: 0,
    cod_fee: 40,
    total: 743,
    coupon: "MK15",
    payment_method: "cod",
    status: "COD_PENDING",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

const STORAGE_ORDERS_KEY = "mk_admin_orders_v1";
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
  if (typeof window === "undefined") return SEED_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_ORDERS;
  }
}

export function saveStoredOrders(orders: AdminOrder[]) {
  if (typeof window === "undefined") return;
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
