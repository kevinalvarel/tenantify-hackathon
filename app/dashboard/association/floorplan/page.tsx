import { Metadata } from "next";
import { FloorplanDesigner } from "@/components/association/floorplan/floorplan-designer";

export const metadata: Metadata = {
  title: "Desain Floorplan - Tenantify Association",
  description:
    "Desain dan kelola tata letak peta stan bazaar dan zona tenant UMKM di Tenantify.",
};

export default function AssociationFloorplanPage() {
  return <FloorplanDesigner />;
}
