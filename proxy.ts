import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;
  const role =
    (session?.user as { role?: string } | undefined)?.role || "customer";

  // Role Helper
  const getRoleDashboard = (userRole: string) => {
    switch (userRole) {
      case "developer":
      case "association":
        return "/dashboard/association";
      case "seller":
        return "/dashboard/seller";
      case "customer":
      default:
        return "/customer";
    }
  };

  // 1. Autentikasi Dashboard & Customer
  if (!session) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/customer")) {
      const signInUrl = new URL("/auth/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // 2. Role Gateway
  if (pathname === "/auth/sign-in" || pathname === "/auth/sign-up") {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  // 3. Role Gateway
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  // 4. Role Guard untuk sub-dashboard
  if (role === "developer") {
    return NextResponse.next();
  }

  // Role 'association' hanya boleh mengakses /dashboard/association
  if (pathname.startsWith("/dashboard/association")) {
    if (role !== "association") {
      return NextResponse.redirect(
        new URL(getRoleDashboard(role), request.url),
      );
    }
    return NextResponse.next();
  }

  // Role 'seller' hanya boleh mengakses /dashboard/seller
  if (pathname.startsWith("/dashboard/seller")) {
    if (role !== "seller") {
      return NextResponse.redirect(
        new URL(getRoleDashboard(role), request.url),
      );
    }
    return NextResponse.next();
  }

  // Role 'customer' hanya boleh mengakses /customer
  if (pathname.startsWith("/customer")) {
    if (role !== "customer" && role !== "developer") {
      return NextResponse.redirect(
        new URL(getRoleDashboard(role), request.url),
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/customer",
    "/customer/:path*",
    "/auth/sign-in",
    "/auth/sign-up",
  ],
};
