export type SiteNavItem = {
  label: string;
  href: string;
  /**
   * Set only for items that are a route of their own. Items that are anchors
   * inside another route (an href starting with `/#`) leave this unset and are
   * never marked as active, because they are not a page.
   */
  matchPath?: string;
};

/**
 * The one route table for both public routes. The navbar and the footer both
 * read it, so a link can never be live in one and dead in the other.
 */
export const SITE_NAV: SiteNavItem[] = [
  { label: "Beranda", href: "/", matchPath: "/" },
  { label: "Produk", href: "/product", matchPath: "/product" },
  { label: "Layanan", href: "/service", matchPath: "/service" },
  { label: "Solusi", href: "/solutions", matchPath: "/solutions" },
];

/** Route only matching, so exactly one item can ever be marked at a time. */
export function isNavItemActive(item: SiteNavItem, pathname: string): boolean {
  if (!item.matchPath) return false;
  if (item.matchPath === "/") return pathname === "/";
  return (
    pathname === item.matchPath || pathname.startsWith(`${item.matchPath}/`)
  );
}
