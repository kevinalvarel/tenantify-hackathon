export type Tenant = {
  id: string;
  name: string;
  category: string;
  zone: string;
  boothNumber: string;
  rating: number;
  totalReviews: number;
  isOpen: boolean;
  avatarText: string;
};

export type CustomerCategoryType =
  | "Semua"
  | "Sarapan Pagi"
  | "Daging Sapi"
  | "Ayam"
  | "Ikan"
  | "Minuman"
  | "Makanan Penutup"
  | "Happy Meal"
  | "Paket Keluarga"
  | "McCafe"
  | "Camilan"
  | "Makanan"
  | "Paket Hemat";

export type CustomerProduct = {
  id: string;
  tenantId: string;
  tenantName: string;
  boothNumber: string;
  name: string;
  category: "Makanan" | "Minuman" | "Camilan" | "Paket Hemat" | string;
  mcdCategory?: string;
  price: number;
  description: string;
  rating: number;
  image?: string;
  soldCount?: number;
  isPopular?: boolean;
  isCrossRecommendation?: boolean;
  crossPairWith?: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

export type CustomerCartItem = {
  product: CustomerProduct;
  quantity: number;
  notes?: string;
};

export type CustomerOrderStatus =
  | "Diterima"
  | "Disiapkan"
  | "Siap Diambil"
  | "Selesai"
  | "Dibatalkan";

export type CustomerOrder = {
  id: string;
  pickupCode: string;
  orderType: "Dine-in (Makan di Tempat)" | "Takeaway (Bawa Pulang)";
  tableNumber?: string;
  tenantNames: string[];
  items: {
    productName: string;
    tenantName: string;
    price: number;
    quantity: number;
    notes?: string;
  }[];
  subtotal: number;
  platformFee: number;
  total: number;
  status: CustomerOrderStatus;
  paymentMethod: "QRIS" | "GoPay / OVO" | "Virtual Account" | "Bayar di Tenant";
  createdAt: string;
};
