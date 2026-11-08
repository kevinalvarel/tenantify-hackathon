import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  ),
  title: "Tenantify",
  description: "UMKM Solution Platform",
};

const anthropicSans = localFont({
  src: [
    {
      path: "../public/fonts/sans/AnthropicSans-Display-Light-Static.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/sans/AnthropicSans-Display-Regular-Static.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/sans/AnthropicSans-Display-RegularItalic-Static.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/sans/AnthropicSans-Display-Medium-Static.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/sans/AnthropicSans-Display-MediumItalic-Static.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/sans/AnthropicSans-Display-Semibold-Static.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/sans/AnthropicSans-Display-Bold-Static.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/sans/AnthropicSans-Display-BoldItalic-Static.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/fonts/sans/AnthropicSans-Display-Extrabold-Static.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/sans/AnthropicSans-Display-ExtraboldItalic-Static.woff2",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-anthropic-sans",
  display: "swap",
});

const architechDaughterFont = localFont({
  src: [
    {
      path: "../public/fonts/architects/ArchitectsDaughter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-architects-daughter",
  display: "swap",
});

const anthropicMono = localFont({
  src: [
    {
      path: "../public/fonts/mono/Anthropic_Mono_Web.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/mono/Anthropic_Mono_RegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-anthropic-mono",
  display: "swap",
});

const anthropicSerif = localFont({
  src: [
    {
      path: "../public/fonts/serif/AnthropicSerif-Display-Regular-Static.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/serif/AnthropicSerif-Display-RegularItalic-Static.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/serif/AnthropicSerif-Display-Medium-Static.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/serif/AnthropicSerif-Display-MediumItalic-Static.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/serif/AnthropicSerif-Display-Semibold-Static.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/serif/AnthropicSerif-Display-Bold-Static.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/serif/AnthropicSerif-Display-BoldItalic-Static.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-anthropic-serif",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      style={{ colorScheme: "light" }}
      data-theme="light"
      lang="id"
      className={`${anthropicSans.variable} ${anthropicMono.variable} ${anthropicSerif.variable}`}
      suppressHydrationWarning={true}
    >
      <body
        className={`${anthropicSans.variable} ${anthropicMono.variable} ${anthropicSerif.variable} ${architechDaughterFont.variable} antialiased font-sans`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
