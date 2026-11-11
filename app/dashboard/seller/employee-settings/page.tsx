import { EmployeesManagement } from "@/components/seller/employee-settings/employees-management";
import { demoSellerEmployees } from "@/data/seller-employees";

export default function SellerEmployeeSettingsPage() {
  return <EmployeesManagement employees={demoSellerEmployees} />;
}
