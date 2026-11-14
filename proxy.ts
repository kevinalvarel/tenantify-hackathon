import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRoleDashboard } from "@/lib/routes/role-dashboard";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.hostname ||
    "";

  const isSellerSubdomain =
    host.startsWith("seller.") ||
    host.includes("seller.tenantify.vercel.app") ||
    host.includes("seller.localhost");

  if (isSellerSubdomain) {
    if (!pathname.startsWith("/auth") && !pathname.startsWith("/dashboard")) {
      if (pathname === "/") {
        return NextResponse.rewrite(new URL("/landing", request.url));
      }
      if (
        pathname.startsWith("/product") ||
        pathname.startsWith("/service") ||
        pathname.startsWith("/solutions")
      ) {
        return NextResponse.rewrite(
          new URL(`/landing${pathname}`, request.url),
        );
      }
    }
  }

  if (pathname === "/customer" || pathname === "/customer/") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/customer/")) {
    const cleanPath = pathname.replace(/^\/customer/, "") || "/";
    return NextResponse.redirect(new URL(cleanPath, request.url));
  }

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname === "/auth/sign-in" || pathname === "/auth/sign-up";
  const isCustomerAccountRoute =
    pathname === "/profile" || pathname === "/orders";

  if (!isDashboardRoute && !isAuthRoute && !isCustomerAccountRoute) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const role =
    (session?.user as { role?: string } | undefined)?.role || "customer";

  if (!session) {
    if (isCustomerAccountRoute) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("login", "1");
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isDashboardRoute) {
      const signInUrl = new URL("/auth/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  if (role === "developer") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard/association")) {
    if (role !== "association") {
      return NextResponse.redirect(
        new URL(getRoleDashboard(role), request.url),
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard/seller")) {
    if (role !== "seller") {
      return NextResponse.redirect(
        new URL(getRoleDashboard(role), request.url),
      );
    }
    return NextResponse.next();
  }

  if (isDashboardRoute && role === "customer") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|fonts|icons|images|.*\\..*).*)",
  ],
};
