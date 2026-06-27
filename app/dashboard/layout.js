import { requireSession } from "@/lib/auth/session";

export default async function DashboardLayout({ children }) {
  await requireSession("/dashboard");
  return children;
}
