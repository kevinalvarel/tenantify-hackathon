export function getRoleDashboard(role?: string) {
  switch (role) {
    case "developer":
    case "association":
      return "/dashboard/association";
    case "seller":
      return "/dashboard/seller";
    default:
      return "/";
  }
}
