export type ProductCategory = "Semua" | "Makanan" | "Minuman" | "Camilan" | "Paket Hemat";

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: "Makanan" | "Minuman" | "Camilan" | "Paket Hemat";
  price: number;
  stock: number;
  description?: string;
  image?: string;
  isActive: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
  notes?: string;
};

export type OrderType = "POS Kasir" | "Online Order";
export type OrderStatus = "Masuk" | "Diproses" | "Siap Diambil" | "Selesai" | "Dibatalkan";
export type PaymentMethod = "Tunai" | "QRIS" | "Debit / Transfer";

export type Order = {
  id: string;
  customerName: string;
  tableNumber?: string;
  type: OrderType;
  items: {
    productName: string;
    price: number;
    quantity: number;
    notes?: string;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  createdAt: string;
};

export type RentInvoiceStatus = "unpaid" | "paid" | "overdue";

export type RentInvoice = {
  id: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  period: string;
  associationName: string;
  boothNumber: string;
  boothSize: string;
  baseRent: number;
  maintenanceFee: number;
  electricityFee: number;
  totalAmount: number;
  dueDate: string;
  status: RentInvoiceStatus;
  paidAt?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
};

export type SellerReview = {
  id: string;
  customerName: string;
  avatarText: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
  reply?: {
    message: string;
    repliedAt: string;
  };
};

export type Employee = {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  joinedAt: string;
};

export type PromotionType = "Info" | "Diskon" | "Pengumuman";

export type Promotion = {
  id: string;
  tenantId?: string;
  tenantName?: string;
  tenantCode?: string;
  title: string;
  message: string;
  type: PromotionType;
  startDate: string;
  endDate: string;
  status: "Terkirim";
  sentAt: string;
  targetUrl?: string;
};

export type RentPaymentHistoryItem = {
  id: string;
  invoiceId: string;
  period: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  status: "Berhasil";
  receiptNumber: string;
  associationName: string;
  boothNumber: string;
};
