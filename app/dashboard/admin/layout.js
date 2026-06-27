import { requireDashboardAccess } from "@/lib/auth/session";

export default async function AdminDashboardLayout({ children }) {
  await requireDashboardAccess("admin");
  return children;
}
