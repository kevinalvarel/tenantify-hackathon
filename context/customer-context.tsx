"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CustomerProduct,
  CustomerCartItem,
  CustomerOrder,
  Tenant,
  ActiveUmkm,
} from "@/types/customer";
import { demoProducts, demoTenants, slugify } from "@/data/customer-demo";
import {
  getCustomerDataAction,
  resolveUmkmByCodeAction,
  getCustomerOrdersAction,
} from "@/servers/customer-server";
import { toast } from "sonner";

function playCustomerChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Play upbeat 3-tone chime: E5 (659Hz) -> G#5 (830Hz) -> B5 (987Hz)
    osc.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc.frequency.setValueAtTime(830.61, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch {
    // Audio context may be restricted before interaction
  }
}

type CustomerContextType = {
  products: CustomerProduct[];
  allProducts: CustomerProduct[];
  tenants: Tenant[];
  allTenants: Tenant[];
  activeUmkm: ActiveUmkm | null;
  setActiveUmkm: (umkm: ActiveUmkm | null) => void;
  leaveUmkm: () => void;
  joinUmkmByCode: (code: string) => Promise<{ success: boolean; message: string; umkm?: ActiveUmkm }>;
  orders: CustomerOrder[];
  cart: CustomerCartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  isNutritionModalOpen: boolean;
  setIsNutritionModalOpen: (open: boolean) => void;
  addToCart: (product: CustomerProduct, quantity?: number, notes?: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkoutOrder: (order: CustomerOrder) => void;
  reorder: (order: CustomerOrder) => void;
  cartItemCount: number;
  cartTotal: number;
  activeOrdersCount: number;
};

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const ACTIVE_UMKM_STORAGE_KEY = "tenantify:active_umkm";

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [activeUmkm, setActiveUmkmState] = useState<ActiveUmkm | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(ACTIVE_UMKM_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ActiveUmkm;
        if (parsed && parsed.code) {
          return parsed;
        }
      }
    } catch {
      // ignore localStorage errors (e.g. private mode)
    }
    return null;
  });
  const [allProducts, setAllProducts] = useState<CustomerProduct[]>(demoProducts);
  const [allTenants, setAllTenants] = useState<Tenant[]>(demoTenants);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const ordersRef = useRef<CustomerOrder[]>(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);
  const [cart, setCart] = useState<CustomerCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);

  const setActiveUmkm = (umkm: ActiveUmkm | null) => {
    setActiveUmkmState(umkm);
    try {
      if (umkm) {
        window.localStorage.setItem(ACTIVE_UMKM_STORAGE_KEY, JSON.stringify(umkm));
      } else {
        window.localStorage.removeItem(ACTIVE_UMKM_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  };

  const leaveUmkm = () => {
    setActiveUmkm(null);
    setSelectedCategory("Semua");
    toast.info("Anda telah keluar dari UMKM. Masukkan kode baru untuk melihat menu.");
  };

  const joinUmkmByCode = async (code: string) => {
    const res = await resolveUmkmByCodeAction(code);
    if (res.success && res.umkm) {
      setActiveUmkm(res.umkm);
      setSelectedCategory("Semua");
      toast.success(`Terhubung ke ${res.umkm.name}!`);
      return res;
    }
    toast.error(res.message);
    return res;
  };

  // Sinkronisasi status pesanan dari database secara otomatis setiap 3.5 detik
  useEffect(() => {
    let isMounted = true;

    const syncLiveOrders = async () => {
      try {
        let storedIds: string[] = [];
        try {
          storedIds = JSON.parse(
            window.localStorage.getItem("tenantify:customer_order_ids") || "[]",
          );
        } catch {
          storedIds = [];
        }

        const currentIds = Array.from(
          new Set([...ordersRef.current.map((o) => o.id), ...storedIds]),
        );

        if (currentIds.length === 0) return;

        const dbOrders = await getCustomerOrdersAction(currentIds);
        if (!isMounted || dbOrders.length === 0) return;

        setOrders((prev) => {
          const prevMap = new Map(prev.map((o) => [o.id, o]));

          // Periksa apakah status pesanan berubah dari database
          dbOrders.forEach((dbOrd) => {
            const oldOrd = prevMap.get(dbOrd.id);
            if (oldOrd && oldOrd.status !== dbOrd.status) {
              if (dbOrd.status === "Disiapkan") {
                playCustomerChime();
                toast.success(
                  `🎉 Pesanan #${dbOrd.id} telah DIKONFIRMASI oleh UMKM dan sedang disiapkan!`,
                  { duration: 7000 },
                );
              } else if (dbOrd.status === "Dibatalkan") {
                toast.error(
                  `⚠️ Pesanan #${dbOrd.id} ditolak atau dibatalkan oleh UMKM.`,
                  { duration: 7000 },
                );
              } else if (dbOrd.status === "Siap Diambil") {
                playCustomerChime();
                toast.success(
                  `🔔 Pesanan #${dbOrd.id} siap diambil di booth UMKM!`,
                  { duration: 7000 },
                );
              } else if (dbOrd.status === "Selesai") {
                toast.success(
                  `✅ Pesanan #${dbOrd.id} telah selesai. Selamat menikmati!`,
                  { duration: 5000 },
                );
              }
            }
          });

          // Merge pesanan dari database
          const merged = [...dbOrders];
          prev.forEach((p) => {
            if (!merged.some((m) => m.id === p.id)) {
              merged.push(p);
            }
          });
          return merged;
        });
      } catch (err) {
        console.warn("Sinkronisasi pesanan customer error:", err);
      }
    };

    // Jalankan pertama kali
    syncLiveOrders();

    const intervalId = setInterval(syncLiveOrders, 3500);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    getCustomerDataAction().then((data) => {
      if (!isMounted) return;
      if (data.products.length > 0) {
        const enrichedProducts = data.products.map((dbProd) => {
          const demoMatch = demoProducts.find(
            (d) =>
              d.id === dbProd.id ||
              d.name.toLowerCase() === dbProd.name.toLowerCase(),
          );
          return {
            ...demoMatch,
            ...dbProd,
            slug: dbProd.slug || demoMatch?.slug || slugify(dbProd.name),
            image: dbProd.image || demoMatch?.image,
            originalPrice: dbProd.originalPrice ?? demoMatch?.originalPrice,
            soldCount: dbProd.soldCount ?? demoMatch?.soldCount,
            mcdCategory: dbProd.mcdCategory ?? demoMatch?.mcdCategory,
          };
        });
        setAllProducts(enrichedProducts);
      }
      if (data.tenants.length > 0) {
        setAllTenants(data.tenants);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products strictly based on active UMKM
  const products = useMemo(() => {
    // 1. Sembunyikan Menu Default: Jika belum join, hilangkan semua daftar menu!
    if (!activeUmkm) return [];

    // 2. Jika kode spesifik UMKM / paguyuban dengan daftar tenant tertentu:
    if (activeUmkm.tenantIds && activeUmkm.tenantIds.length > 0) {
      return allProducts.filter((p) =>
        activeUmkm.tenantIds!.includes(p.tenantId),
      );
    }

    return allProducts;
  }, [activeUmkm, allProducts]);

  // Filter tenants strictly based on active UMKM
  const tenants = useMemo(() => {
    if (!activeUmkm) return [];

    if (activeUmkm.tenantIds && activeUmkm.tenantIds.length > 0) {
      return allTenants.filter((t) =>
        activeUmkm.tenantIds!.includes(t.id),
      );
    }

    return allTenants;
  }, [activeUmkm, allTenants]);

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const activeOrdersCount = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === "Diterima" ||
          o.status === "Disiapkan" ||
          o.status === "Siap Diambil"
      ).length,
    [orders]
  );

  const addToCart = (
    product: CustomerProduct,
    quantity: number = 1,
    notes?: string
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id && (item.notes || "") === (notes || "")
      );
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, notes }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    toast.info("Item dihapus dari keranjang.");
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkoutOrder = (newOrder: CustomerOrder) => {
    // 1. Simpan ke state lokal
    setOrders((prev) => [newOrder, ...prev]);

    // 2. Simpan order ID ke localStorage agar riwayat pesanan tetap tersimpan
    try {
      const stored: string[] = JSON.parse(
        window.localStorage.getItem("tenantify:customer_order_ids") || "[]",
      );
      if (!stored.includes(newOrder.id)) {
        window.localStorage.setItem(
          "tenantify:customer_order_ids",
          JSON.stringify([newOrder.id, ...stored]),
        );
      }
    } catch {
      // ignore
    }
  };

  const reorder = (order: CustomerOrder) => {
    const itemsToAdd: CustomerCartItem[] = [];

    order.items.forEach((item) => {
      const prod = products.find((p) => p.name === item.productName);
      if (prod) {
        itemsToAdd.push({
          product: prod,
          quantity: item.quantity,
          notes: item.notes,
        });
      }
    });

    if (itemsToAdd.length > 0) {
      setCart((prev) => {
        const nextCart = [...prev];
        itemsToAdd.forEach((newItem) => {
          const idx = nextCart.findIndex((c) => c.product.id === newItem.product.id);
          if (idx >= 0) {
            nextCart[idx].quantity += newItem.quantity;
          } else {
            nextCart.push(newItem);
          }
        });
        return nextCart;
      });
      setIsCartOpen(true);
      toast.success("Menu dari pesanan ini berhasil dimasukkan ke keranjang!");
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        products,
        allProducts,
        tenants,
        allTenants,
        activeUmkm,
        setActiveUmkm,
        leaveUmkm,
        joinUmkmByCode,
        orders,
        cart,
        isCartOpen,
        setIsCartOpen,
        selectedCategory,
        setSelectedCategory,
        isNutritionModalOpen,
        setIsNutritionModalOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        checkoutOrder,
        reorder,
        cartItemCount,
        cartTotal,
        activeOrdersCount,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}
