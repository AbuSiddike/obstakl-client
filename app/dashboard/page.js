import { redirect } from "next/navigation";
import { getDashboardPathForRole } from "@/lib/auth/dashboard-access";
import { requireSession } from "@/lib/auth/session";

export default async function DashboardRedirectPage() {
  const session = await requireSession("/dashboard");
  redirect(getDashboardPathForRole(session.user.role));
}
