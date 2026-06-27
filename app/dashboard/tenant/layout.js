import { requireDashboardAccess } from "@/lib/auth/session";

export default async function TenantDashboardLayout({ children }) {
  await requireDashboardAccess("tenant");
  return children;
}
