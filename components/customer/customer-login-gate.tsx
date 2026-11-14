"use client";

import { useSearchParams } from "next/navigation";
import { CustomerAuthDialog } from "@/components/customer/customer-auth-dialog";

export function CustomerLoginGate() {
  const params = useSearchParams();
  if (params.get("login") !== "1") return null;

  const next = params.get("next");
  const callbackUrl =
    next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return <CustomerAuthDialog autoOpen callbackUrl={callbackUrl} />;
}
