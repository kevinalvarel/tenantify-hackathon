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

export function FloatingNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <NavbarButton as={Link} href="/auth/sign-up">
            Mulai Sekarang
          </NavbarButton>
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
              <NavbarButton as={Link} href="/auth/sign-up">
                Mulai Sekarang
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
