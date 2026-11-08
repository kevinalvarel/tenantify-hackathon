"use client";

import { CustomerProvider, useCustomer } from "@/context/customer-context";
import { CustomerNavbar } from "@/components/customer/customer-navbar";
import { CustomerCartSheet } from "@/components/customer/customer-cart-sheet";


function CustomerLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkoutOrder,
  } = useCustomer();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full overflow-x-clip">
      {/* Customer Top Navbar (Replaces Sidebar) */}
      <CustomerNavbar />

      {/* Main Page Canvas */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-3 sm:p-6 min-w-0">
        {children}
      </main>

      {/* Cart Drawer Sheet */}
      <CustomerCartSheet
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onCheckoutSuccess={checkoutOrder}
      />



    </div>
  );
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerProvider>
      <CustomerLayoutContent>{children}</CustomerLayoutContent>
    </CustomerProvider>
  );
}
