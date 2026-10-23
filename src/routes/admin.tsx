import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  MessageCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-light.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  categories,
  getAllProducts,
  inr,
  products,
  resetDefaultProducts,
  saveAllProducts,
  type Product,
} from "@/lib/products";
import {
  clearAllStoredOrders,
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
import {
  sendAdminNewOrderWhatsApp,
  sendCustomerInvoiceWhatsApp,
  sendCustomerStatusWhatsApp,
  type WhatsAppOrderDetails,
} from "@/lib/whatsapp";
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

type TabType = "dashboard" | "orders" | "products" | "charts" | "tables";

const STATUS_CONFIG: Record<AdminOrderStatus, { label: string; badgeClass: string; bg: string }> = {
  COD_PENDING: { label: "COD Pending", badgeClass: "bg-amber-100 text-amber-800 border border-amber-300", bg: "#ffc107" },
  PAID: { label: "Paid (Online)", badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold", bg: "#10b981" },
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

  // Dynamic product CRUD state (Add, Edit, Remove)
  const [productList, setProductList] = useState<Product[]>(() => getAllProducts());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    category: "syrups",
    price: 299,
    mrp: 399,
    stock: 50,
    short: "",
    image: "",
    benefits: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  // Load state on mount and listen to product updates
  useEffect(() => {
    setIsAuthenticated(getStoredAdminAuth());
    setOrders(getStoredOrders());
    setInventoryOverrides(getStoredInventory());
    setProductList(getAllProducts());

    const handleProductsUpdated = () => {
      setProductList(getAllProducts());
    };
    window.addEventListener("mk_products_updated", handleProductsUpdated);
    return () => window.removeEventListener("mk_products_updated", handleProductsUpdated);
  }, []);

  const loadOrdersFromSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          const mapped: AdminOrder[] = data.map((d: any) => {
            const rawAddr = d.address || {};
            return {
              id: d.id,
              order_number: d.order_number,
              customer_name: d.customer_name,
              phone: d.phone,
              email: d.email || null,
              address: {
                name: rawAddr.name || d.customer_name,
                phone: rawAddr.phone || d.phone,
                email: rawAddr.email || d.email,
                line1: rawAddr.line1 || (typeof rawAddr === "string" ? rawAddr : "Customer Address"),
                line2: rawAddr.line2 || "",
                landmark: rawAddr.landmark || "",
                city: rawAddr.city || d.city || "Ambikapur",
                state: rawAddr.state || d.state || "Chhattisgarh",
                pincode: rawAddr.pincode || d.pincode || "497001",
              },
              items: (Array.isArray(d.items) ? d.items : []).map((it: any) => ({
                sku: it.sku || "MK-SKU",
                qty: it.qty || 1,
                name: it.name || "Ayurvedic Product",
                variant: it.variant || "Standard",
                price: it.price || 299,
              })),
              subtotal: d.subtotal || d.total,
              discount: d.discount || 0,
              shipping: d.shipping || 0,
              cod_fee: d.cod_fee ?? (d.payment_method === "cod" ? 40 : 0),
              total: d.total,
              coupon: d.coupon || null,
              payment_method: d.payment_method === "online" ? "online" : "cod",
              status: (d.status || "COD_PENDING") as AdminOrderStatus,
              created_at: d.created_at,
            };
          });
          setOrders(mapped);
          saveStoredOrders(mapped);
        } else {
          // If Supabase returned 0 rows, check local storage
          const local = getStoredOrders();
          if (local.length > 0) {
            setOrders(local);
          } else {
            setOrders([]);
          }
        }
      } else {
        setOrders(getStoredOrders());
      }
    } catch (err) {
      console.warn("Supabase orders fetch note:", err);
      setOrders(getStoredOrders());
    }
  }, []);

  useEffect(() => {
    loadOrdersFromSupabase();
    // Poll Supabase every 4 seconds so orders placed by customers appear automatically
    const timer = setInterval(() => {
      loadOrdersFromSupabase();
    }, 4000);
    return () => clearInterval(timer);
  }, [loadOrdersFromSupabase]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrdersFromSupabase();
    setInventoryOverrides(getStoredInventory());
    setProductList(getAllProducts());
    setRefreshing(false);
    toast.success("Dashboard orders refreshed");
  };

  const handleStatusChange = (orderNumber: string, newStatus: AdminOrderStatus) => {
    const updated = updateOrderStatusInStorage(orderNumber, newStatus);
    setOrders(updated);
    if (selectedOrder && selectedOrder.order_number === orderNumber) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }

    const target = updated.find((o) => o.order_number === orderNumber);
    if (target) {
      // Sync status to Supabase database if available
      try {
        supabase
          .from("orders")
          .update({ status: newStatus })
          .eq("order_number", orderNumber)
          .then();
      } catch (err) {
        console.error("Supabase status sync error:", err);
      }

      const waOrder: WhatsAppOrderDetails = {
        orderNumber: target.order_number,
        customerName: target.customer_name,
        phone: target.phone,
        email: target.email,
        items: target.items,
        subtotal: target.subtotal,
        discount: target.discount,
        shipping: target.shipping,
        codFee: target.cod_fee,
        total: target.total,
        paymentMethod: target.payment_method,
        status: newStatus,
        address: target.address,
        createdAt: target.created_at,
      };

      toast.success(`Order ${orderNumber} updated to ${STATUS_CONFIG[newStatus]?.label}`, {
        description: `Alert customer ${target.customer_name} (+91 ${target.phone}) via WhatsApp.`,
        action: {
          label: "📲 Send WhatsApp",
          onClick: () => sendCustomerStatusWhatsApp(waOrder, newStatus),
        },
        duration: 8000,
      });

      // Automatically launch WhatsApp with pre-filled status update message
      try {
        sendCustomerStatusWhatsApp(waOrder, newStatus);
      } catch (err) {
        console.error("WhatsApp status dispatch error:", err);
      }
    } else {
      toast.success(`Order ${orderNumber} updated to ${STATUS_CONFIG[newStatus]?.label}`);
    }
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

  // Product CRUD Handlers (Add, Edit, Remove)
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      slug: "",
      category: "syrups",
      price: 299,
      mrp: 399,
      stock: 50,
      short: "",
      image: "",
      benefits: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    const v0 = p.variants[0];
    const override = inventoryOverrides[v0?.sku];
    setProductForm({
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: override?.price ?? v0?.price ?? 299,
      mrp: override?.mrp ?? v0?.mrp ?? 399,
      stock: override?.stock ?? v0?.stock ?? 50,
      short: p.short,
      image: p.images[0] || "",
      benefits: (p.benefits || []).join("\n"),
    });
    setIsAddModalOpen(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      toast.error("Please enter product name");
      return;
    }

    if (editingProduct) {
      // Update existing product
      const updated = productList.map((p) => {
        if (p.id === editingProduct.id) {
          const v0 = p.variants[0];
          return {
            ...p,
            name: productForm.name.trim(),
            category: productForm.category,
            short: productForm.short.trim() || p.short,
            images: productForm.image.trim() ? [productForm.image.trim()] : p.images,
            benefits: productForm.benefits.trim()
              ? productForm.benefits.split("\n").filter(Boolean)
              : p.benefits,
            variants: [
              {
                ...v0,
                price: Number(productForm.price) || v0.price,
                mrp: Number(productForm.mrp) || v0.mrp,
                stock: Number(productForm.stock) ?? v0.stock,
              },
              ...p.variants.slice(1),
            ] as [typeof v0, ...(typeof v0)[]],
          };
        }
        return p;
      });

      setProductList(updated);
      saveAllProducts(updated);
      setEditingProduct(null);
      toast.success(`Product "${productForm.name}" updated successfully!`);
    } else {
      // Add new product
      const slug =
        productForm.slug.trim() ||
        productForm.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const sku =
        "MK-" +
        productForm.name.slice(0, 3).toUpperCase() +
        "-" +
        Math.floor(Math.random() * 900 + 100);

      const defaultImg = products[0]?.images[0] || "";

      const newProd: Product = {
        id: `mk-${Date.now()}`,
        slug,
        name: productForm.name.trim(),
        category: productForm.category,
        concern: ["immunity"],
        images: [productForm.image.trim() || defaultImg],
        variants: [
          {
            sku,
            label: "Standard Pack",
            mrp: Number(productForm.mrp) || 399,
            price: Number(productForm.price) || 299,
            stock: Number(productForm.stock) || 50,
          },
        ],
        short: productForm.short.trim() || "Premium Ayurvedic herbal wellness formulation.",
        benefits: productForm.benefits.trim()
          ? productForm.benefits.split("\n").filter(Boolean)
          : ["100% Ayurvedic ingredients", "Lab tested & certified", "Safe and effective formula"],
        howToUse: "Use as directed on the label or as advised by your physician.",
        tags: ["new"],
      };

      const updated = [newProd, ...productList];
      setProductList(updated);
      saveAllProducts(updated);
      setIsAddModalOpen(false);
      toast.success(`New product "${newProd.name}" added successfully!`);
    }
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    const updated = productList.filter((p) => p.id !== productToDelete.id);
    setProductList(updated);
    saveAllProducts(updated);
    toast.success(`Product "${productToDelete.name}" removed from store.`);
    setProductToDelete(null);
  };

  const handleResetCatalog = () => {
    if (confirm("Restore original 10 Ayurvedic products catalog?")) {
      const def = resetDefaultProducts();
      setProductList(def);
      toast.success("Restored default 10 Ayurvedic catalog!");
    }
  };

  const handleClearOrders = () => {
    clearAllStoredOrders();
    setOrders([]);
    setSelectedOrder(null);
    try {
      supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000").then();
    } catch (e) {
      console.error(e);
    }
    toast.success("Admin orders cleared successfully.");
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
    const lowStockCount = productList.filter((p) => {
      const v0 = p.variants[0];
      const s = inventoryOverrides[v0?.sku]?.stock ?? v0?.stock ?? 50;
      return s < 15;
    }).length;

    return { totalRev, deliveredRev, pendingCount, deliveredCount, lowStockCount };
  }, [orders, productList, inventoryOverrides]);

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
    return productList.filter((p) => {
      const matchesCat = productCategoryFilter === "ALL" || p.category === productCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.variants[0]?.sku || "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [productList, productCategoryFilter, searchQuery]);

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
    <div className="flex min-h-screen flex-col bg-[#fbfaf8] text-gray-800 antialiased">
      {/* 1. TOP NAVBAR (WEBSITE AYURVEDIC THEME) */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between bg-[#121916] border-b border-[#c59b27]/30 px-4 text-white shadow-md">
        {/* Left: Brand & Toggle */}
        <div className="flex items-center gap-3">
          <Link to="/admin" onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 text-lg font-bold tracking-tight text-white hover:text-amber-300 transition">
            <img src={logo} alt="MK" className="h-7 w-auto" />
            <span className="font-display tracking-wider">MK Enterprises</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded p-1 text-gray-400 hover:bg-[#1a2320] hover:text-[#f3d98b] transition"
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
              className="h-8 rounded-l border border-[#c59b27]/40 bg-white px-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#c59b27]"
            />
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex h-8 w-9 items-center justify-center rounded-r bg-gradient-to-r from-[#c59b27] to-[#997519] text-black font-bold hover:brightness-110 shadow-sm"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-xs text-gray-300 hover:text-[#f3d98b] transition"
            title="Refresh Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          {/* View Storefront Link */}
          <Link
            to="/"
            className="hidden sm:flex items-center gap-1 text-xs text-gray-300 hover:text-[#f3d98b] transition"
            title="Open customer storefront"
          >
            <Store className="h-3.5 w-3.5 text-[#c59b27]" />
            <span>Store</span>
          </Link>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 border-l border-gray-700/60 pl-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1c2723] text-xs font-semibold text-[#f3d98b] border border-[#c59b27]/40">
              <User className="h-4 w-4" />
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-300 hover:text-rose-400 transition"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WRAPPER: SIDEBAR + CONTENT */}
      <div className="flex flex-1">
        {/* Left Dark Sidebar with Website Ayurvedic Theme */}
        <aside
          className={`${
            sidebarOpen ? "w-56" : "hidden"
          } flex flex-col justify-between border-r border-[#c59b27]/20 bg-[#121916] text-gray-300 transition-all duration-200 shrink-0`}
        >
          {/* Navigation Links */}
          <div className="p-3">
            {/* CORE */}
            <div className="mb-2 px-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#c59b27] font-display">
              CORE
            </div>
            <button
              onClick={() => { setActiveTab("dashboard"); setSelectedOrder(null); }}
              className={`flex w-full items-center gap-2.5 rounded px-3 py-2 text-xs font-medium transition ${
                activeTab === "dashboard"
                  ? "bg-[#1c2723] text-[#f3d98b] font-semibold border-l-4 border-[#c59b27] shadow-sm"
                  : "hover:bg-[#1a2320] hover:text-[#f3d98b]"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-[#c59b27]" />
              <span>Dashboard</span>
            </button>

            {/* INTERFACE */}
            <div className="mb-2 mt-4 px-3 text-[10px] font-bold uppercase tracking-wider text-[#c59b27] font-display">
              INTERFACE
            </div>
            
            {/* Layouts / Orders Tab */}
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex w-full items-center justify-between rounded px-3 py-2 text-xs font-medium transition ${
                activeTab === "orders"
                  ? "bg-[#1c2723] text-[#f3d98b] font-semibold border-l-4 border-[#c59b27] shadow-sm"
                  : "hover:bg-[#1a2320] hover:text-[#f3d98b]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
                <span>Orders ({orders.length})</span>
              </div>
              <ChevronRight className="h-3 w-3 text-gray-500" />
            </button>

            {/* Products Tab */}
            <button
              onClick={() => setActiveTab("products")}
              className={`flex w-full items-center justify-between rounded px-3 py-2 text-xs font-medium transition ${
                activeTab === "products"
                  ? "bg-[#1c2723] text-[#f3d98b] font-semibold border-l-4 border-[#c59b27] shadow-sm"
                  : "hover:bg-[#1a2320] hover:text-[#f3d98b]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="h-4 w-4 text-[#f3d98b]" />
                <span>Products ({productList.length})</span>
              </div>
              <ChevronRight className="h-3 w-3 text-gray-500" />
            </button>
          </div>

          {/* Sidebar Footer: Logged in as: MK Enterprises */}
          <div className="border-t border-[#c59b27]/20 bg-[#0c1210] p-3 text-xs">
            <div className="text-[10px] uppercase tracking-wider text-[#c59b27]/80">Logged in as:</div>
            <div className="font-semibold text-[#f3d98b]">MK Enterprises</div>
          </div>
        </aside>

        {/* Right Main Content Body */}
        <main className="flex-1 overflow-x-hidden p-6 bg-[#fbfaf8]">
          {/* TAB 1: MAIN SB ADMIN DASHBOARD */}
          {(activeTab === "dashboard" || activeTab === "tables" || activeTab === "charts") && (
            <div className="space-y-6">
              {/* Header Title & Subtitle */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-display">Dashboard</h1>
                <p className="text-xs text-gray-500">MK Enterprises Ayurvedic Operations & Sales Overview</p>
              </div>

              {/* 4 AYURVEDIC BRANDED KPI CARDS */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Total Sales (Deep Ayurvedic Emerald) */}
                <div className="flex flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br from-[#16382f] to-[#0d221c] text-white border border-[#c59b27]/40 shadow-sm">
                  <div className="p-4">
                    <p className="text-base font-semibold text-[#f3d98b]">Total Sales & Revenue</p>
                    <p className="mt-1 text-xs opacity-90">
                      Total Sales: {inr(metrics.totalRev)} ({orders.length} Orders)
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="flex items-center justify-between bg-black/20 px-4 py-2 text-xs font-medium text-white hover:bg-black/30 transition border-t border-white/10"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#c59b27]" />
                  </button>
                </div>

                {/* 2. Pending Orders (Warm Gold) */}
                <div className="flex flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br from-[#8a6814] to-[#5a4309] text-white border border-[#f3d98b]/30 shadow-sm">
                  <div className="p-4">
                    <p className="text-base font-semibold text-white">Pending Orders (COD)</p>
                    <p className="mt-1 text-xs opacity-95">
                      {metrics.pendingCount} Pending Dispatch Orders (COD)
                    </p>
                  </div>
                  <button
                    onClick={() => { setActiveTab("orders"); setOrderStatusFilter("COD_PENDING"); }}
                    className="flex items-center justify-between bg-black/20 px-4 py-2 text-xs font-medium text-white hover:bg-black/30 transition border-t border-white/10"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#f3d98b]" />
                  </button>
                </div>

                {/* 3. Delivered Orders (Royal Forest Green) */}
                <div className="flex flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br from-[#1a4433] to-[#0c2119] text-white border border-emerald-500/30 shadow-sm">
                  <div className="p-4">
                    <p className="text-base font-semibold text-emerald-200">Delivered Orders</p>
                    <p className="mt-1 text-xs opacity-90">
                      {metrics.deliveredCount} Orders Delivered ({inr(metrics.deliveredRev)})
                    </p>
                  </div>
                  <button
                    onClick={() => { setActiveTab("orders"); setOrderStatusFilter("DELIVERED"); }}
                    className="flex items-center justify-between bg-black/20 px-4 py-2 text-xs font-medium text-white hover:bg-black/30 transition border-t border-white/10"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5 text-emerald-300" />
                  </button>
                </div>

                {/* 4. Products in Store (Warm Bronze) */}
                <div className="flex flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br from-[#3d2a1b] to-[#1f150d] text-white border border-amber-600/30 shadow-sm">
                  <div className="p-4">
                    <p className="text-base font-semibold text-amber-200">Product Inventory & Stock</p>
                    <p className="mt-1 text-xs opacity-90">
                      {productList.length} Products Active · {metrics.lowStockCount} Stock Alerts
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="flex items-center justify-between bg-black/20 px-4 py-2 text-xs font-medium text-white hover:bg-black/30 transition border-t border-white/10"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5 text-amber-300" />
                  </button>
                </div>
              </div>

              {/* DATATABLE EXAMPLE (FULL WIDTH CARD - PURE WHITE TABLE) */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-200 bg-[#fbfaf8] px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                    <TableIcon className="h-4 w-4 text-[#c59b27]" />
                    <span className="font-display tracking-wide">Customer Orders Table</span>
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
                <div className="flex items-center gap-2">
                  {orders.length > 0 && (
                    <Button
                      onClick={handleClearOrders}
                      variant="outline"
                      size="sm"
                      className="text-xs border-rose-300 text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear All Orders
                    </Button>
                  )}
                  <Button
                    onClick={() => exportOrdersToCsv(orders)}
                    className="bg-gradient-to-r from-[#c59b27] to-[#997519] text-black hover:brightness-110 text-xs font-bold shadow-sm"
                    disabled={orders.length === 0}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Export All to CSV
                  </Button>
                </div>
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
                          ? "bg-[#16382f] text-[#f3d98b] font-bold border border-[#c59b27]/40 shadow-sm"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-amber-50/40"
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
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-gray-500">
                            <ShoppingBag className="mx-auto h-8 w-8 text-gray-300" />
                            <p className="mt-2 text-sm font-semibold text-gray-700">No customer orders yet</p>
                            <p className="text-xs text-gray-400">Orders placed by customers will automatically appear here in real-time.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => {
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
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    sendCustomerStatusWhatsApp(
                                      {
                                        orderNumber: o.order_number,
                                        customerName: o.customer_name,
                                        phone: o.phone,
                                        email: o.email,
                                        items: o.items,
                                        subtotal: o.subtotal,
                                        discount: o.discount,
                                        shipping: o.shipping,
                                        codFee: o.cod_fee,
                                        total: o.total,
                                        paymentMethod: o.payment_method,
                                        status: o.status,
                                        address: o.address,
                                        createdAt: o.created_at,
                                      },
                                      o.status
                                    );
                                  }}
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                                  title={`Send WhatsApp update (${cfg.label}) to ${o.customer_name} (${o.phone})`}
                                >
                                  <MessageCircle className="mr-1 h-3 w-3" /> WhatsApp
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedOrder(o)}
                                  className="h-7 text-xs border-gray-300"
                                >
                                  <Eye className="mr-1 h-3 w-3" /> View
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      }))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT TAB (ADD, EDIT, REMOVE) */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products Management</h1>
                  <p className="text-xs text-gray-500">
                    Add new Ayurvedic products, edit pricing & details, or remove products from the storefront.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleResetCatalog}
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-300 hover:bg-gray-100"
                  >
                    Restore Default 10 Products
                  </Button>
                  <Button
                    onClick={handleOpenAddModal}
                    className="bg-gradient-to-r from-[#c59b27] to-[#997519] text-black hover:brightness-110 text-xs shadow-sm font-bold"
                  >
                    <Plus className="mr-1.5 h-4 w-4" /> + Add New Product
                  </Button>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">Category:</span>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
                  >
                    <option value="ALL">All Categories ({productList.length})</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-gray-500">
                  Showing <b>{filteredProducts.length}</b> products in store
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded border border-gray-200 bg-white p-12 text-center text-gray-500">
                  <Package className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-3 text-sm font-semibold text-gray-700">No products match your filter.</p>
                  <Button onClick={handleOpenAddModal} className="mt-4 bg-[#007bff] text-white" size="sm">
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add a Product
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((p) => {
                    const v0 = p.variants[0];
                    const sku = v0?.sku || p.id;
                    const override = inventoryOverrides[sku];
                    const price = override?.price || v0?.price || 299;
                    const mrp = override?.mrp || v0?.mrp || 399;
                    const stock = override?.stock ?? v0?.stock ?? 50;

                    return (
                      <div
                        key={p.id}
                        className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                      >
                        <div>
                          <div className="flex items-start gap-3">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-gray-50 p-1 border">
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = products[0]?.images[0] || "";
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-700">
                                  {p.category}
                                </span>
                                {stock < 15 && (
                                  <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                                    Low Stock
                                  </span>
                                )}
                              </div>
                              <h4 className="mt-1 line-clamp-1 text-xs font-bold text-gray-900" title={p.name}>
                                {p.name}
                              </h4>
                              <p className="line-clamp-2 mt-0.5 text-[11px] text-gray-500">{p.short}</p>
                              <p className="mt-1 text-[10px] text-gray-400 font-mono">SKU: {sku}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
                            <div>
                              <span className="text-gray-500">Price:</span>{" "}
                              <span className="font-bold text-gray-900">{inr(price)}</span>{" "}
                              <span className="text-[10px] line-through text-gray-400">{inr(mrp)}</span>
                            </div>
                            <div className="text-[11px] font-medium text-emerald-700">
                              {Math.round(((mrp - price) / mrp) * 100)}% OFF
                            </div>
                          </div>

                          {/* Stock Stepper */}
                          <div className="mt-2.5 flex items-center justify-between rounded bg-gray-50 p-2 text-xs">
                            <span className="font-medium text-gray-700">Stock Units:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => adjustStock(sku, -5)}
                                className="flex h-5 w-5 items-center justify-center rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                                title="Decrease stock by 5"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center font-bold text-gray-900">{stock}</span>
                              <button
                                onClick={() => adjustStock(sku, 5)}
                                className="flex h-5 w-5 items-center justify-center rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                                title="Increase stock by 5"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Buttons (EDIT & REMOVE) */}
                        <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditModal(p)}
                            className="flex-1 h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Edit3 className="mr-1 h-3 w-3" /> Edit Product
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setProductToDelete(p)}
                            className="h-7 text-xs border-rose-200 text-rose-700 hover:bg-rose-50 px-2.5"
                            title="Remove Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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

            {/* WhatsApp Direct Actions */}
            <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50/70 p-3.5 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  WhatsApp Direct Communication:
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">Customer: +91 {selectedOrder.phone}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    sendCustomerInvoiceWhatsApp({
                      orderNumber: selectedOrder.order_number,
                      customerName: selectedOrder.customer_name,
                      phone: selectedOrder.phone,
                      email: selectedOrder.email,
                      items: selectedOrder.items,
                      subtotal: selectedOrder.subtotal,
                      discount: selectedOrder.discount,
                      shipping: selectedOrder.shipping,
                      codFee: selectedOrder.cod_fee,
                      total: selectedOrder.total,
                      paymentMethod: selectedOrder.payment_method,
                      status: selectedOrder.status,
                      address: selectedOrder.address,
                      createdAt: selectedOrder.created_at,
                    });
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shadow-sm font-semibold"
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" /> Send Invoice to WhatsApp
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    sendCustomerStatusWhatsApp(
                      {
                        orderNumber: selectedOrder.order_number,
                        customerName: selectedOrder.customer_name,
                        phone: selectedOrder.phone,
                        email: selectedOrder.email,
                        items: selectedOrder.items,
                        subtotal: selectedOrder.subtotal,
                        discount: selectedOrder.discount,
                        shipping: selectedOrder.shipping,
                        codFee: selectedOrder.cod_fee,
                        total: selectedOrder.total,
                        paymentMethod: selectedOrder.payment_method,
                        status: selectedOrder.status,
                        address: selectedOrder.address,
                        createdAt: selectedOrder.created_at,
                      },
                      selectedOrder.status
                    );
                  }}
                  className="border-emerald-600 text-emerald-800 hover:bg-emerald-100 text-xs h-8 font-medium"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Send Status ({STATUS_CONFIG[selectedOrder.status].label})
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    sendAdminNewOrderWhatsApp({
                      orderNumber: selectedOrder.order_number,
                      customerName: selectedOrder.customer_name,
                      phone: selectedOrder.phone,
                      email: selectedOrder.email,
                      items: selectedOrder.items,
                      subtotal: selectedOrder.subtotal,
                      discount: selectedOrder.discount,
                      shipping: selectedOrder.shipping,
                      codFee: selectedOrder.cod_fee,
                      total: selectedOrder.total,
                      paymentMethod: selectedOrder.payment_method,
                      status: selectedOrder.status,
                      address: selectedOrder.address,
                      createdAt: selectedOrder.created_at,
                    });
                  }}
                  className="border-blue-500 text-blue-700 hover:bg-blue-50 text-xs h-8 font-medium"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5 text-blue-600" /> Forward to Admin (+91 91117 22209)
                </Button>
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

      {/* MODAL 2: ADD NEW PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-lg border border-gray-300 bg-white p-6 text-gray-900 shadow-2xl my-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" /> Add New Ayurvedic Product
              </h3>
              <p className="text-xs text-gray-500">
                Enter product details to publish to your storefront
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-gray-700">Product Name *</label>
                <Input
                  type="text"
                  placeholder="e.g. Ashwagandha Gold Wellness Syrup"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">Stock Units</label>
                  <Input
                    type="number"
                    min={0}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">Selling Price (₹) *</label>
                  <Input
                    type="number"
                    min={1}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">MRP Display (₹)</label>
                  <Input
                    type="number"
                    min={1}
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                    className="bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the Ayurvedic formulation..."
                  value={productForm.short}
                  onChange={(e) => setProductForm({ ...productForm, short: e.target.value })}
                  className="w-full rounded border border-gray-300 p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700">Image URL (Optional)</label>
                <Input
                  type="text"
                  placeholder="https://... (Leave blank for default Ayurvedic bottle image)"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700">Key Benefits (one per line)</label>
                <textarea
                  rows={2}
                  placeholder="100% Herbal & Pure&#10;Supports immune health&#10;No side effects"
                  value={productForm.benefits}
                  onChange={(e) => setProductForm({ ...productForm, benefits: e.target.value })}
                  className="w-full rounded border border-gray-300 p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#007bff] text-white hover:bg-blue-600 text-xs font-semibold"
                >
                  Save & Publish Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-lg border border-gray-300 bg-white p-6 text-gray-900 shadow-2xl my-8">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute right-4 top-4 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b pb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-50 p-1 border">
                <img
                  src={editingProduct.images[0]}
                  alt={editingProduct.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = products[0]?.images[0] || "";
                  }}
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Edit Product: {editingProduct.name}</h3>
                <p className="text-[11px] text-gray-500">ID: {editingProduct.id} · SKU: {editingProduct.variants[0]?.sku}</p>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-gray-700">Product Name *</label>
                <Input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">Stock Units</label>
                  <Input
                    type="number"
                    min={0}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">Selling Price (₹) *</label>
                  <Input
                    type="number"
                    min={1}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-gray-700">MRP Display (₹)</label>
                  <Input
                    type="number"
                    min={1}
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                    className="bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700">Short Description</label>
                <textarea
                  rows={2}
                  value={productForm.short}
                  onChange={(e) => setProductForm({ ...productForm, short: e.target.value })}
                  className="w-full rounded border border-gray-300 p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700">Image URL</label>
                <Input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700">Key Benefits (one per line)</label>
                <textarea
                  rows={2}
                  value={productForm.benefits}
                  onChange={(e) => setProductForm({ ...productForm, benefits: e.target.value })}
                  className="w-full rounded border border-gray-300 p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProduct(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#007bff] text-white hover:bg-blue-600 text-xs font-semibold"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE PRODUCT CONFIRMATION */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-lg border border-gray-300 bg-white p-6 text-gray-900 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="rounded-full bg-rose-100 p-2">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Remove Product</h3>
            </div>

            <p className="mt-3 text-xs text-gray-600 leading-relaxed">
              Are you sure you want to remove <b>"{productToDelete.name}"</b>? It will be immediately deleted from your online store catalog.
            </p>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProductToDelete(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteProduct}
                className="bg-[#dc3545] text-white hover:bg-rose-700 text-xs font-semibold"
              >
                Yes, Remove Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
