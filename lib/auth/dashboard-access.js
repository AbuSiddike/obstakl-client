export const ROLES = {
  ADMIN: "Admin",
  OWNER: "Owner",
  TENANT: "Tenant",
};

export const DASHBOARDS = {
  admin: {
    path: "/dashboard/admin",
    allowedRoles: [ROLES.ADMIN],
  },
  owner: {
    path: "/dashboard/owner",
    allowedRoles: [ROLES.OWNER, ROLES.ADMIN],
  },
  tenant: {
    path: "/dashboard/tenant",
    allowedRoles: [ROLES.TENANT, ROLES.ADMIN],
  },
};

const ROLE_HOME = {
  [ROLES.ADMIN]: DASHBOARDS.admin.path,
  [ROLES.OWNER]: DASHBOARDS.owner.path,
  [ROLES.TENANT]: DASHBOARDS.tenant.path,
};

export function getDashboardPathForRole(role) {
  return ROLE_HOME[role] ?? DASHBOARDS.tenant.path;
}

export function canAccessDashboard(role, dashboardKey) {
  const dashboard = DASHBOARDS[dashboardKey];
  if (!dashboard) return false;
  return dashboard.allowedRoles.includes(role);
}

export function getLoginUrl(redirectPath) {
  const params = new URLSearchParams({ redirect: redirectPath });
  return `/login?${params.toString()}`;
}
