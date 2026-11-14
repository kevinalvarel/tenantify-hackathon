"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { cn } from "@/lib/utils";
import { SITE_NAV, isNavItemActive } from "@/lib/routes/site-nav";
import { getRoleDashboard } from "@/lib/routes/role-dashboard";
import { useSession } from "@/lib/auth/auth-client";

export function FloatingNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const cta = session?.user
    ? { label: "Buka Dashboard", href: getRoleDashboard(role) }
    : { label: "Mulai Sekarang", href: "/auth/sign-up" };

  const navItems = SITE_NAV.map((item) => ({
    name: item.label,
    link: item.href,
    active: isNavItemActive(item, pathname),
  }));

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          {isPending ? (
            <span
              aria-hidden
              className="h-9 w-32 shrink-0 animate-pulse rounded-full bg-foreground/10"
            />
          ) : (
            <NavbarButton as={Link} href={cta.href}>
              {cta.label}
            </NavbarButton>
          )}
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "relative block w-full cursor-pointer py-2 text-left text-neutral-700 transition-colors select-none hover:text-primary",
                  item.active && "font-semibold text-primary",
                )}
              >
                <span className="block">{item.name}</span>
              </Link>
            ))}
            <div className="pt-2">
              {isPending ? (
                <span
                  aria-hidden
                  className="block h-9 w-full animate-pulse rounded-full bg-foreground/10"
                />
              ) : (
                <NavbarButton as={Link} href={cta.href}>
                  {cta.label}
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
