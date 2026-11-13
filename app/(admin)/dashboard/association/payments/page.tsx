import { AssociationPayments } from "@/components/association/payments/association-payments";
import { getAssociationRentDataAction } from "@/servers/rent-server";

export default async function AssociationPaymentsPage() {
  const data = await getAssociationRentDataAction();

  return <AssociationPayments data={data} />;
}
