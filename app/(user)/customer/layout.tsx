"use client";

import { CustomerProvider, useCustomer } from "@/context/customer-context";
import { CustomerNavbar } from "@/components/customer/customer-navbar";
import { CustomerCartSheet } from "@/components/customer/customer-cart-sheet";
import { CustomerLayoutSkeleton } from "@/components/customer/customer-layout-skeleton";
import { Suspense } from "react";

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
    <div
      className="min-h-screen bg-background text-foreground flex flex-col w-full overflow-x-clip relative font-poppins"
      style={{ fontFamily: '"Poppins", sans-serif' }}
    >
      {/* Pattern Background Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-repeat opacity-35 dark:opacity-10 dark:invert"
        style={{
          backgroundImage: "url('/images/customer-bg-pattern.jpg')",
          backgroundSize: "360px auto",
          mixBlendMode: "multiply",
        }}
        aria-hidden="true"
      />

      {/* Customer Top Navbar (Replaces Sidebar) */}
      <CustomerNavbar />

      {/* Main Page Canvas */}
      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto pt-20 sm:pt-24 p-3 sm:p-6 min-w-0">
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
      <Suspense fallback={<CustomerLayoutSkeleton />}>
        <CustomerLayoutContent>{children}</CustomerLayoutContent>
      </Suspense>
    </CustomerProvider>
  );
}
