import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  IndianRupee,
  LayoutDashboard,
  LineChart,
  Lock,
  LogOut,
  Mail,
  Menu,
  Minus,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Table as TableIcon,
  Tag,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-light.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, inr, products, type Product } from "@/lib/products";
import {
  exportOrdersToCsv,
  getStoredAdminAuth,
  getStoredInventory,
  getStoredOrders,
  saveStoredInventory,
  saveStoredOrders,
  setStoredAdminAuth,
  updateOrderStatusInStorage,
  type AdminOrder,
  type AdminOrderStatus,
  type ProductInventoryOverride,
} from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "MK Enterprises — Admin Dashboard" },
      { name: "description", content: "SB Admin Dashboard for MK Enterprises Ayurvedic Store & Inventory." },
    ],
  }),
  component: AdminPage,
});

type TabType = "dashboard" | "orders" | "products" | "inquiries" | "charts" | "tables";

const STATUS_CONFIG: Record<AdminOrderStatus, { label: string; badgeClass: string; bg: string }> = {
  COD_PENDING: { label: "COD Pending", badgeClass: "bg-amber-100 text-amber-800 border border-amber-300", bg: "#ffc107" },
  CONFIRMED: { label: "Confirmed", badgeClass: "bg-blue-100 text-blue-800 border border-blue-300", bg: "#007bff" },
  SHIPPED: { label: "Shipped", badgeClass: "bg-purple-100 text-purple-800 border border-purple-300", bg: "#6f42c1" },
  DELIVERED: { label: "Delivered", badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-300", bg: "#28a745" },
  CANCELLED: { label: "Cancelled", badgeClass: "bg-rose-100 text-rose-800 border border-rose-300", bg: "#dc3545" },
};

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Login form state (Only Admin ID & Password)
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Navigation & UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [inventoryOverrides, setInventoryOverrides] = useState<Record<string, ProductInventoryOverride>>({});
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPriceForm, setEditPriceForm] = useState({ price: 0, mrp: 0, stock: 50 });
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("ALL");
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load state on mount
  useEffect(() => {
    setIsAuthenticated(getStoredAdminAuth());
    setOrders(getStoredOrders());
    setInventoryOverrides(getStoredInventory());

    try {
      const storedInq = JSON.parse(localStorage.getItem("mk_contact_inquiries_v1") || "[]");
      setInquiries(storedInq);
    } catch {
      setInquiries([]);
    }

    // Try syncing any live orders from Supabase if table exists
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: AdminOrder[] = data.map((d: any) => ({
            id: d.id,
            order_number: d.order_number,
            customer_name: d.customer_name,
            phone: d.phone,
            email: d.email || null,
            address: {
              name: d.customer_name,
              phone: d.phone,
              email: d.email,
              line1: d.address_line1 || "Customer Address",
              city: d.city || "Ambikapur",
              state: d.state || "Chhattisgarh",
              pincode: d.pincode || "497001",
            },
            items: (d.items || []).map((it: any) => ({
              sku: it.sku || "MK-SKU",
              qty: it.qty || 1,
              name: it.name || "Ayurvedic Product",
              variant: it.variant || "Standard",
              price: it.price || 299,
            })),
            subtotal: d.subtotal || d.total,
            discount: d.discount || 0,
            shipping: 0,
            cod_fee: d.payment_method === "cod" ? 40 : 0,
            total: d.total,
            coupon: d.coupon || null,
            payment_method: d.payment_method === "online" ? "online" : "cod",
            status: d.status as AdminOrderStatus,
            created_at: d.created_at,
          }));
          setOrders(mapped);
          saveStoredOrders(mapped);
        }
      });
  }, []);

  // Login handler
  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    const id = adminId.trim().toLowerCase();
    const pass = adminPassword.trim();

    const isValidId = id === "admin" || id === "enterprisesmk313@gmail.com" || id === "mkadmin";
    const isValidPass = pass === "admin123" || pass === "admin" || pass === "admin@2026" || pass === "admin1234";

    if (isValidId && isValidPass) {
      setStoredAdminAuth(true);
      setIsAuthenticated(true);
      toast.success("Welcome, Administrator");
    } else {
      toast.error("Invalid Admin ID or Password");
    }
  };

  const handleLogout = () => {
    setStoredAdminAuth(false);
    setIsAuthenticated(false);
    setAdminPassword("");
    toast.info("Logged out of Admin Portal");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setOrders(getStoredOrders());
      setInventoryOverrides(getStoredInventory());
      try {
        const storedInq = JSON.parse(localStorage.getItem("mk_contact_inquiries_v1") || "[]");
        setInquiries(storedInq);
      } catch {
        setInquiries([]);
      }
      setRefreshing(false);
      toast.success("Dashboard data refreshed");
    }, 300);
  };

  const handleStatusChange = (orderNumber: string, newStatus: AdminOrderStatus) => {
    const updated = updateOrderStatusInStorage(orderNumber, newStatus);
    setOrders(updated);
    if (selectedOrder && selectedOrder.order_number === orderNumber) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    toast.success(`Order ${orderNumber} updated to ${STATUS_CONFIG[newStatus]?.label}`);
  };

  const adjustStock = (sku: string, delta: number) => {
    const current = inventoryOverrides[sku]?.stock ?? 50;
    const nextStock = Math.max(0, current + delta);
    const updated = {
      ...inventoryOverrides,
      [sku]: {
        ...(inventoryOverrides[sku] || {
          sku,
          stock: 50,
          price: 0,
          mrp: 0,
          isBestseller: false,
          isNew: false,
        }),
        stock: nextStock,
      },
    };
    setInventoryOverrides(updated);
    saveStoredInventory(updated);
    toast.success(`Stock updated: ${nextStock} units`);
  };

  const handleSavePriceEdit = () => {
    if (!editingProduct) return;
    const sku = editingProduct.variants[0].sku;
    const updated = {
      ...inventoryOverrides,
      [sku]: {
        ...(inventoryOverrides[sku] || {
          sku,
          stock: 50,
          price: editingProduct.variants[0].price,
          mrp: editingProduct.variants[0].mrp,
          isBestseller: editingProduct.tags.includes("bestseller"),
          isNew: editingProduct.tags.includes("new"),
        }),
        price: editPriceForm.price,
        mrp: editPriceForm.mrp,
        stock: editPriceForm.stock,
      },
    };
    setInventoryOverrides(updated);
    saveStoredInventory(updated);
    setEditingProduct(null);
    toast.success(`${editingProduct.name} pricing and stock updated!`);
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalRev = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0);
    const deliveredRev = orders
      .filter((o) => o.status === "DELIVERED")
      .reduce((sum, o) => sum + o.total, 0);
    const pendingCount = orders.filter((o) => o.status === "COD_PENDING" || o.status === "CONFIRMED").length;
    const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
    const lowStockCount = products.filter((p) => {
      const s = inventoryOverrides[p.variants[0].sku]?.stock ?? 50;
      return s < 15;
    }).length;

    return { totalRev, deliveredRev, pendingCount, deliveredCount, lowStockCount };
  }, [orders, inventoryOverrides]);

  // Filtered orders for DataTable
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        (o.address.city && o.address.city.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, searchQuery]);

  // Paginated DataTable entries
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredOrders.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredOrders, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / entriesPerPage) || 1;

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = productCategoryFilter === "ALL" || p.category === productCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.variants[0].sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [productCategoryFilter, searchQuery]);

  // If not authenticated, render Login Screen (Img 3 Clean Version)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b10] px-4 text-white">
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-gold-dark/40 bg-[#0d141d] p-8 shadow-2xl shadow-gold/5">
          <div className="text-center">
            <img src={logo} alt="MK Enterprises" className="mx-auto h-16 w-auto" />
            <h1 className="mt-4 text-2xl font-bold uppercase tracking-wider text-gold-gradient">
              Executive Admin Portal
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              MK Enterprises Ayurvedic Store & Inventory Management
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gold/80">
                Admin ID
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter Admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="border-gold-dark/40 bg-[#131d2b] pr-10 text-white placeholder:text-gray-500"
                  autoFocus
                />
                <User className="absolute right-3 top-2.5 h-4 w-4 text-gold/60" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gold/80">
                Admin Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="border-gold-dark/40 bg-[#131d2b] pr-10 text-white placeholder:text-gray-500"
                />
                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gold/60" />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full bg-gold-gradient font-semibold text-black hover:opacity-90">
                <ShieldCheck className="mr-2 h-4 w-4" /> Sign In to Dashboard
              </Button>
            </div>
          </form>

          <div className="mt-8 border-t border-gold-dark/20 pt-4 text-center">
            <Link to="/" className="inline-flex items-center text-xs text-muted-foreground hover:text-gold transition">
              <Store className="mr-1.5 h-3.5 w-3.5" /> Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated: Render Start Bootstrap SB Admin Dashboard (Img 2)
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa] text-gray-800 antialiased">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between bg-[#212529] px-4 text-white shadow-sm">
        {/* Left: Brand & Toggle */}
        <div className="flex items-center gap-3">
          <Link to="/admin" onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 text-lg font-bold tracking-tight text-white hover:text-gray-200">
            <img src={logo} alt="MK" className="h-7 w-auto" />
            <span>MK Enterprises</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
            title="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Center / Right: Search & User Tools */}
        <div className="flex items-center gap-4">
          {/* Search bar matching SB Admin */}
          <div className="hidden sm:flex items-center">
            <input
              type="text"
              placeholder="Search for..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 rounded-l border border-gray-600 bg-white px-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex h-8 w-9 items-center justify-center rounded-r bg-[#007bff] text-white hover:bg-blue-600"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"
            title="Refresh Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          {/* View Storefront Link */}
          <Link
            to="/"
            className="hidden sm:flex items-center gap-1 text-xs text-gray-300 hover:text-white"
            title="Open customer storefront"
          >
            <Store className="h-3.5 w-3.5 text-amber-400" />
            <span>Store</span>
          </Link>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-700 text-xs font-semibold text-gray-200">
              <User className="h-4 w-4" />
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-300 hover:text-rose-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WRAPPER: SIDEBAR + CONTENT */}
      <div className="flex flex-1">
        {/* Left Dark Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-56" : "hidden"
          } flex flex-col justify-between border-r border-gray-800 bg-[#212529] text-gray-400 transition-all duration-200 shrink-0`}
        >
          {/* Navigation Links */}
          <div className="p-3">
            {/* CORE */}
            <div className="mb-2 px-3 pt-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              CORE
            </div>
            <button
              onClick={() => { setActiveTab("dashboard"); setSelectedOrder(null); }}
              className={`flex w-full items-center gap-2.5 rounded px-3 py-2 text-xs font-medium transition ${
                activeTab === "dashboard"
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-800/60 hover:text-gray-200"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-blue-400" />
              <span>Dashboard</span>
            </button>

            {/* INTERFACE */}
            <div className="mb-2 mt-4 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              INTERFACE
            </div>
            
            {/* Layouts / Orders Tab */}
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex w-full items-center justify-between rounded px-3 py-2 text-xs font-medium transition ${
                activeTab === "orders"
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-800/60 hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
                <span>Orders ({orders.length})</span>
              </div>
              <ChevronRight className="h-3 w-3 text-gray-600" />
            </button>

            {/* Pages / 10 Products Tab */}
            <button
              onClick={() => setActiveTab("products")}
              className={`flex w-full items-center justify-between rounded px-3 py-2 text-xs font-medium transition ${
                activeTab === "products"
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-800/60 hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="h-4 w-4 text-amber-400" />
                <span>10 Products</span>
              </div>
              <ChevronRight className="h-3 w-3 text-gray-600" />
            </button>

            {/* Inquiries */}
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`flex w-full items-center justify-between rounded px-3 py-2 text-xs font-medium transition ${
                activeTab === "inquiries"
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-800/60 hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-purple-400" />
                <span>Inquiries ({inquiries.length})</span>
              </div>
              <ChevronRight className="h-3 w-3 text-gray-600" />
            </button>

          </div>

          {/* Sidebar Footer: Logged in as: MK Enterprises */}
          <div className="border-t border-gray-800 bg-[#1a1e24] p-3 text-xs">
            <div className="text-[11px] text-gray-500">Logged in as:</div>
            <div className="font-semibold text-gray-300">MK Enterprises</div>
          </div>
        </aside>

        {/* Right Main Content Body */}
        <main className="flex-1 overflow-x-hidden p-6">
          {/* TAB 1: MAIN SB ADMIN DASHBOARD (IMG 2) */}
          {(activeTab === "dashboard" || activeTab === "tables" || activeTab === "charts") && (
            <div className="space-y-6">
              {/* Header Title & Subtitle */}
              <div>
                <h1 className="text-3xl font-medium tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>

              {/* 4 COLORED KPI CARDS (BLUE, YELLOW, GREEN, RED) */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Primary Card (Blue) */}
                <div className="flex flex-col justify-between overflow-hidden rounded bg-[#007bff] text-white shadow-sm">
                  <div className="p-4">
                    <p className="text-base font-medium">Total Sales & Revenue</p>
                    <p className="mt-1 text-xs opacity-90">
                      Total Sales: {inr(metrics.totalRev)} ({orders.length} Orders)
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="flex items-center justify-between bg-black/10 px-4 py-2 text-xs font-normal text-white hover:bg-black/20 transition"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* 2. Warning Card (Yellow) */}
                <div className="flex flex-col justify-between overflow-hidden rounded bg-[#ffc107] text-white shadow-sm">
                  <div className="p-4">
                    <p className="text-base font-medium">Pending Orders (COD)</p>
                    <p className="mt-1 text-xs opacity-95">
                      {metrics.pendingCount} Pending Dispatch Orders (COD)
                    </p>
                  </div>
                  <button
                    onClick={() => { setActiveTab("orders"); setOrderStatusFilter("COD_PENDING"); }}
                    className="flex items-center justify-between bg-black/10 px-4 py-2 text-xs font-normal text-white hover:bg-black/20 transition"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* 3. Success Card (Green) */}
                <div className="flex flex-col justify-between overflow-hidden rounded bg-[#28a745] text-white shadow-sm">
                  <div className="p-4">
                    <p className="text-base font-medium">Delivered Orders</p>
                    <p className="mt-1 text-xs opacity-90">
                      {metrics.deliveredCount} Orders Delivered ({inr(metrics.deliveredRev)})
                    </p>
                  </div>
                  <button
                    onClick={() => { setActiveTab("orders"); setOrderStatusFilter("DELIVERED"); }}
                    className="flex items-center justify-between bg-black/10 px-4 py-2 text-xs font-normal text-white hover:bg-black/20 transition"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* 4. Danger Card (Red) */}
                <div className="flex flex-col justify-between overflow-hidden rounded bg-[#dc3545] text-white shadow-sm">
                  <div className="p-4">
                    <p className="text-base font-medium">Product Inventory & Stock</p>
                    <p className="mt-1 text-xs opacity-90">
                      10 Products Active · {metrics.lowStockCount} Stock Alerts
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="flex items-center justify-between bg-black/10 px-4 py-2 text-xs font-normal text-white hover:bg-black/20 transition"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* TWO CHART CARDS SIDE-BY-SIDE (AREA CHART & BAR CHART) */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 1. Area Chart Example (Left) */}
                <div className="rounded border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center gap-2 border-b border-gray-200 bg-[#f7f7f7] px-4 py-3 text-xs font-semibold text-gray-700">
                    <LineChart className="h-4 w-4 text-blue-600" />
                    <span>Area Chart Example</span>
                  </div>
                  <div className="p-4">
                    {/* SVG Spline Area Chart */}
                    <div className="relative h-64 w-full">
                      <svg viewBox="0 0 500 240" className="h-full w-full overflow-visible">
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#007bff" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#007bff" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines & Y-axis labels */}
                        {[
                          { y: 20, label: "40000" },
                          { y: 70, label: "30000" },
                          { y: 120, label: "20000" },
                          { y: 170, label: "10000" },
                          { y: 220, label: "0" },
                        ].map((grid, i) => (
                          <g key={i}>
                            <text x="5" y={grid.y + 4} fill="#6c757d" fontSize="9" fontFamily="sans-serif">
                              {grid.label}
                            </text>
                            <line x1="45" y1={grid.y} x2="490" y2={grid.y} stroke="#e9ecef" strokeWidth="1" />
                          </g>
                        ))}

                        {/* Area Polygon */}
                        <polygon
                          fill="url(#areaGrad)"
                          points="
                            50,220
                            50,180
                            110,95
                            170,140
                            230,110
                            290,135
                            350,90
                            410,105
                            470,40
                            470,220
                          "
                        />

                        {/* Area Spline Path */}
                        <polyline
                          fill="none"
                          stroke="#007bff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="
                            50,180
                            110,95
                            170,140
                            230,110
                            290,135
                            350,90
                            410,105
                            470,40
                          "
                        />

                        {/* Data point dots */}
                        {[
                          { cx: 50, cy: 180, val: "Mar 1" },
                          { cx: 110, cy: 95, val: "Mar 3" },
                          { cx: 170, cy: 140, val: "Mar 5" },
                          { cx: 230, cy: 110, val: "Mar 7" },
                          { cx: 290, cy: 135, val: "Mar 9" },
                          { cx: 350, cy: 90, val: "Mar 11" },
                          { cx: 410, cy: 105, val: "Mar 12" },
                          { cx: 470, cy: 40, val: "Mar 13" },
                        ].map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.cx}
                            cy={pt.cy}
                            r="3.5"
                            fill="#007bff"
                            stroke="#fff"
                            strokeWidth="1.5"
                            className="cursor-pointer transition hover:scale-125"
                          />
                        ))}

                        {/* X-axis labels */}
                        <g fontSize="9" fill="#6c757d" textAnchor="middle" fontFamily="sans-serif">
                          <text x="50" y="235">Mar 1</text>
                          <text x="110" y="235">Mar 3</text>
                          <text x="170" y="235">Mar 5</text>
                          <text x="230" y="235">Mar 7</text>
                          <text x="290" y="235">Mar 9</text>
                          <text x="350" y="235">Mar 11</text>
                          <text x="470" y="235">Mar 13</text>
                        </g>
                      </svg>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 bg-[#f7f7f7] px-4 py-2 text-[11px] text-gray-500">
                    Updated yesterday at 11:59 PM
                  </div>
                </div>

                {/* 2. Bar Chart Example (Right) */}
                <div className="rounded border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center gap-2 border-b border-gray-200 bg-[#f7f7f7] px-4 py-3 text-xs font-semibold text-gray-700">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span>Bar Chart Example</span>
                  </div>
                  <div className="p-4">
                    {/* SVG Bar Chart */}
                    <div className="relative h-64 w-full">
                      <svg viewBox="0 0 500 240" className="h-full w-full overflow-visible">
                        {/* Grid lines & Y-axis labels */}
                        {[
                          { y: 20, label: "15000" },
                          { y: 80, label: "10000" },
                          { y: 140, label: "5000" },
                          { y: 200, label: "0" },
                        ].map((grid, i) => (
                          <g key={i}>
                            <text x="5" y={grid.y + 4} fill="#6c757d" fontSize="9" fontFamily="sans-serif">
                              {grid.label}
                            </text>
                            <line x1="45" y1={grid.y} x2="490" y2={grid.y} stroke="#e9ecef" strokeWidth="1" />
                          </g>
                        ))}

                        {/* Vertical Bars */}
                        {[
                          { month: "January", x: 70, h: 45, y: 155 },
                          { month: "February", x: 140, h: 58, y: 142 },
                          { month: "March", x: 210, h: 72, y: 128 },
                          { month: "April", x: 280, h: 88, y: 112 },
                          { month: "May", x: 350, h: 125, y: 75 },
                          { month: "June", x: 420, h: 180, y: 20 },
                        ].map((bar, idx) => (
                          <g key={idx}>
                            <rect
                              x={bar.x}
                              y={bar.y}
                              width="40"
                              height={bar.h}
                              fill="#007bff"
                              rx="2"
                              className="cursor-pointer transition hover:opacity-85"
                            />
                            <text
                              x={bar.x + 20}
                              y="220"
                              fontSize="9"
                              fill="#6c757d"
                              textAnchor="middle"
                              fontFamily="sans-serif"
                            >
                              {bar.month}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 bg-[#f7f7f7] px-4 py-2 text-[11px] text-gray-500">
                    Updated yesterday at 11:59 PM
                  </div>
                </div>
              </div>

              {/* DATATABLE EXAMPLE (FULL WIDTH CARD MATCHING IMG 2) */}
              <div className="rounded border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 bg-[#f7f7f7] px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <TableIcon className="h-4 w-4 text-blue-600" />
                    <span>DataTable Example</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportOrdersToCsv(orders)}
                    className="h-7 text-xs border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="mr-1 h-3 w-3 text-emerald-600" /> Export CSV
                  </Button>
                </div>

                <div className="p-4">
                  {/* DataTable Top Controls: Entries Per Page + Search */}
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>Show</span>
                      <select
                        value={entriesPerPage}
                        onChange={(e) => {
                          setEntriesPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span>entries per page</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>Search:</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder=""
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Orders DataTable */}
                  <div className="overflow-x-auto border border-gray-200">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-gray-200 bg-[#f8f9fa] font-bold text-gray-700">
                        <tr>
                          <th className="border-r border-gray-200 px-3 py-2.5">Name / Order ID</th>
                          <th className="border-r border-gray-200 px-3 py-2.5">Position / Customer</th>
                          <th className="border-r border-gray-200 px-3 py-2.5">Office / Location</th>
                          <th className="border-r border-gray-200 px-3 py-2.5">Age / Items</th>
                          <th className="border-r border-gray-200 px-3 py-2.5">Start date</th>
                          <th className="border-r border-gray-200 px-3 py-2.5">Salary / Total</th>
                          <th className="border-r border-gray-200 px-3 py-2.5">Status</th>
                          <th className="px-3 py-2.5 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedOrders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-gray-500">
                              No matching records found
                            </td>
                          </tr>
                        ) : (
                          paginatedOrders.map((o) => {
                            const cfg = STATUS_CONFIG[o.status];
                            return (
                              <tr key={o.id} className="hover:bg-gray-50 transition">
                                <td className="border-r border-gray-200 px-3 py-2 font-semibold text-blue-600">
                                  {o.order_number}
                                </td>
                                <td className="border-r border-gray-200 px-3 py-2 font-medium text-gray-900">
                                  {o.customer_name}
                                </td>
                                <td className="border-r border-gray-200 px-3 py-2 text-gray-600">
                                  {o.address.city}, {o.address.state}
                                </td>
                                <td className="border-r border-gray-200 px-3 py-2 text-gray-600">
                                  {o.items.length} {o.items.length === 1 ? "Item" : "Items"}
                                </td>
                                <td className="border-r border-gray-200 px-3 py-2 text-gray-600">
                                  {new Date(o.created_at).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  })}
                                </td>
                                <td className="border-r border-gray-200 px-3 py-2 font-bold text-gray-900">
                                  {inr(o.total)}
                                </td>
                                <td className="border-r border-gray-200 px-3 py-2">
                                  <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${cfg.badgeClass}`}>
                                    {cfg.label}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => setSelectedOrder(o)}
                                      className="rounded bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100"
                                      title="View Order Details"
                                    >
                                      View
                                    </button>
                                    <select
                                      value={o.status}
                                      onChange={(e) => handleStatusChange(o.order_number, e.target.value as AdminOrderStatus)}
                                      className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] text-gray-700"
                                    >
                                      <option value="COD_PENDING">Pending</option>
                                      <option value="CONFIRMED">Confirmed</option>
                                      <option value="SHIPPED">Shipped</option>
                                      <option value="DELIVERED">Delivered</option>
                                      <option value="CANCELLED">Cancelled</option>
                                    </select>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* DataTable Bottom Pagination */}
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-600">
                    <div>
                      Showing {filteredOrders.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to{" "}
                      {Math.min(currentPage * entriesPerPage, filteredOrders.length)} of {filteredOrders.length} entries
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-100 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`rounded border px-2.5 py-1 text-xs ${
                            currentPage === i + 1
                              ? "border-blue-600 bg-[#007bff] text-white"
                              : "border-gray-300 hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-100 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">Orders Management</h1>
                  <p className="text-xs text-gray-500">Track and dispatch customer orders across India</p>
                </div>
                <Button
                  onClick={() => exportOrdersToCsv(orders)}
                  className="bg-[#007bff] text-white hover:bg-blue-600 text-xs"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Export All to CSV
                </Button>
              </div>

              {/* Status Filter Bar */}
              <div className="flex flex-wrap gap-2">
                {(["ALL", "COD_PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((st) => {
                  const active = orderStatusFilter === st;
                  const count = st === "ALL" ? orders.length : orders.filter((o) => o.status === st).length;
                  return (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-[#007bff] text-white shadow-sm"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {st === "ALL" ? "All Orders" : STATUS_CONFIG[st].label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-gray-200 bg-[#f8f9fa] font-bold text-gray-700">
                      <tr>
                        <th className="px-4 py-3">Order ID & Date</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Items Summary</th>
                        <th className="px-4 py-3">Payment</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.map((o) => {
                        const cfg = STATUS_CONFIG[o.status];
                        return (
                          <tr key={o.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <span className="font-bold text-blue-600">{o.order_number}</span>
                              <span className="block text-[11px] text-gray-500">
                                {new Date(o.created_at).toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-900">{o.customer_name}</p>
                              <p className="text-[11px] text-gray-600">📞 {o.phone}</p>
                              <p className="text-[10px] text-gray-500">{o.address.city}, {o.address.state}</p>
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              {o.items.map((it, idx) => (
                                <p key={idx} className="truncate text-[11px] text-gray-700">
                                  <span className="font-bold text-gray-900">{it.qty}×</span> {it.name}
                                </p>
                              ))}
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-800 border">
                                {o.payment_method === "online" ? "Prepaid" : "COD"}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-900">
                              {inr(o.total)}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={o.status}
                                onChange={(e) => handleStatusChange(o.order_number, e.target.value as AdminOrderStatus)}
                                className={`rounded px-2 py-1 text-xs font-semibold ${cfg.badgeClass}`}
                              >
                                <option value="COD_PENDING">COD Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrder(o)}
                                className="h-7 text-xs border-gray-300"
                              >
                                <Eye className="mr-1 h-3 w-3" /> View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS TAB (10 PRODUCTS CATALOG) */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">10 Ayurvedic Products</h1>
                  <p className="text-xs text-gray-500">Catalog inventory, pricing, MRP, and stock level controls</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  Total Active: {products.length} Products
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => {
                  const sku = p.variants[0].sku;
                  const override = inventoryOverrides[sku];
                  const price = override?.price || p.variants[0].price;
                  const mrp = override?.mrp || p.variants[0].mrp;
                  const stock = override?.stock ?? 50;
                  return (
                    <div key={p.id} className="rounded border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-gray-50 p-1 border">
                          <img src={p.images[0]} alt={p.name} className="h-full w-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-xs font-bold text-gray-900" title={p.name}>{p.name}</h4>
                          <p className="truncate text-[11px] text-gray-500">{p.short}</p>
                          <p className="text-[10px] text-blue-600 font-medium">SKU: {sku}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                        <div>
                          <span className="text-gray-500">Price:</span>{" "}
                          <span className="font-bold text-gray-900">{inr(price)}</span>{" "}
                          <span className="text-[10px] line-through text-gray-400">{inr(mrp)}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(p);
                            setEditPriceForm({ price, mrp, stock });
                          }}
                          className="h-6 text-[11px] border-gray-300"
                        >
                          <Edit3 className="mr-1 h-3 w-3" /> Edit
                        </Button>
                      </div>

                      {/* Stock Stepper */}
                      <div className="mt-3 flex items-center justify-between rounded bg-gray-50 p-2 text-xs">
                        <span className="font-medium text-gray-700">Stock Available:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => adjustStock(sku, -5)}
                            className="flex h-5 w-5 items-center justify-center rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-gray-900">{stock}</span>
                          <button
                            onClick={() => adjustStock(sku, 5)}
                            className="flex h-5 w-5 items-center justify-center rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: INQUIRIES TAB */}
          {activeTab === "inquiries" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">Contact Inquiries & Leads</h1>
                  <p className="text-xs text-gray-500">Submissions from customer contact form</p>
                </div>
                <span className="rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                  {inquiries.length} Submissions
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="rounded border border-gray-200 bg-white p-8 text-center text-gray-500">
                  No contact inquiries received yet. Submissions from the /contact page will appear here instantly.
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq: any, i: number) => (
                    <div key={i} className="rounded border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div>
                          <span className="text-xs font-bold text-blue-600">{inq.ticket || `TICKET-${i + 1}`}</span>
                          <h4 className="text-sm font-semibold text-gray-900">{inq.name}</h4>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {inq.createdAt ? new Date(inq.createdAt).toLocaleString("en-IN") : "Recent"}
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-700 space-y-1">
                        <p><span className="font-semibold text-gray-900">Phone:</span> {inq.phone}</p>
                        {inq.email && <p><span className="font-semibold text-gray-900">Email:</span> {inq.email}</p>}
                        <p><span className="font-semibold text-gray-900">Subject:</span> {inq.subject}</p>
                        <p className="mt-2 rounded bg-gray-50 p-3 text-gray-800 border">{inq.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ORDER DETAILS & PACKING SLIP */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-6 text-gray-900 shadow-2xl">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Order Invoice / Dispatch</span>
                <h3 className="text-xl font-bold text-gray-900">{selectedOrder.order_number}</h3>
              </div>
              <span className={`rounded px-2.5 py-1 text-xs font-bold ${STATUS_CONFIG[selectedOrder.status].badgeClass}`}>
                {STATUS_CONFIG[selectedOrder.status].label}
              </span>
            </div>

            <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2">
              <div className="rounded bg-gray-50 p-3 border">
                <p className="font-bold text-gray-900">Customer Details:</p>
                <p className="mt-1 font-semibold text-gray-800">{selectedOrder.customer_name}</p>
                <p className="text-gray-600">📞 {selectedOrder.phone}</p>
                {selectedOrder.email && <p className="text-gray-600">✉️ {selectedOrder.email}</p>}
              </div>

              <div className="rounded bg-gray-50 p-3 border">
                <p className="font-bold text-gray-900">Shipping Destination:</p>
                <p className="mt-1 text-gray-800">{selectedOrder.address.line1}</p>
                <p className="text-gray-600">{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</p>
              </div>
            </div>

            {/* Products List */}
            <div className="mt-4">
              <p className="text-xs font-bold text-gray-900">Items Ordered:</p>
              <div className="mt-2 divide-y divide-gray-100 rounded border">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 text-xs">
                    <div>
                      <p className="font-semibold text-gray-900">{it.name}</p>
                      <p className="text-[11px] text-gray-500">{it.variant} · {inr(it.price)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{inr(it.price * it.qty)}</p>
                      <p className="text-[10px] text-blue-600 font-semibold">Qty: {it.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 space-y-1 rounded bg-gray-50 p-3 text-xs border">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{inr(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>- {inr(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Payment Mode:</span>
                <span className="font-bold uppercase text-gray-900">{selectedOrder.payment_method}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-bold text-gray-900">
                <span>Total Amount:</span>
                <span className="text-blue-600">{inr(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs"
              >
                Print Slip
              </Button>
              <Button
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="bg-[#007bff] text-white hover:bg-blue-600 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg border border-gray-300 bg-white p-6 text-gray-900 shadow-2xl">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute right-4 top-4 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b pb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-50 p-1 border">
                <img src={editingProduct.images[0]} alt={editingProduct.name} className="h-full w-full object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{editingProduct.name}</h3>
                <p className="text-[11px] text-gray-500">SKU: {editingProduct.variants[0].sku}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-gray-700">Selling Price (₹)</label>
                <Input
                  type="number"
                  value={editPriceForm.price}
                  onChange={(e) => setEditPriceForm({ ...editPriceForm, price: Number(e.target.value) })}
                  className="bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700">MRP Display (₹)</label>
                <Input
                  type="number"
                  value={editPriceForm.mrp}
                  onChange={(e) => setEditPriceForm({ ...editPriceForm, mrp: Number(e.target.value) })}
                  className="bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700">Stock Inventory Units</label>
                <Input
                  type="number"
                  value={editPriceForm.stock}
                  onChange={(e) => setEditPriceForm({ ...editPriceForm, stock: Number(e.target.value) })}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingProduct(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSavePriceEdit}
                className="bg-[#007bff] text-white hover:bg-blue-600 text-xs"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
