import { requireDashboardAccess } from "@/lib/auth/session";

export default async function OwnerDashboardLayout({ children }) {
  await requireDashboardAccess("owner");
  return children;
}
