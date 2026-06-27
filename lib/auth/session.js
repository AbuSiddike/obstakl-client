import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  canAccessDashboard,
  DASHBOARDS,
  getDashboardPathForRole,
  getLoginUrl,
} from "@/lib/auth/dashboard-access";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ? session : null;
}

export async function requireSession(redirectPath) {
  const session = await getServerSession();

  if (!session) {
    redirect(getLoginUrl(redirectPath));
  }

  return session;
}

export async function requireRole(allowedRoles, currentPath) {
  const session = await requireSession(currentPath);
  const role = session.user.role;

  if (!allowedRoles.includes(role)) {
    redirect(getDashboardPathForRole(role));
  }

  return session;
}

export async function requireDashboardAccess(dashboardKey) {
  const dashboard = DASHBOARDS[dashboardKey];

  if (!dashboard) {
    redirect("/dashboard");
  }

  const session = await requireSession(dashboard.path);
  const role = session.user.role;

  if (!canAccessDashboard(role, dashboardKey)) {
    redirect(getDashboardPathForRole(role));
  }

  return session;
}
