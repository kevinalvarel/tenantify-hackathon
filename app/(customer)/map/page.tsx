import { Metadata } from "next";
import { CustomerMapView } from "@/components/customer/customer-map-view";

export const metadata: Metadata = {
  title: "Denah Interaktif Bazaar - Tenantify",
  description:
    "Jelajahi tata letak stan bazaar dan denah resmi yang disinkronkan langsung dengan pengelola asosiasi bazaar.",
};

export default function CustomerMapPage() {
  return <CustomerMapView />;
}
