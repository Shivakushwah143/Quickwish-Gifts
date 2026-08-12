// app/admin/page.tsx
// Canonical admin workspace. The full-featured dashboard implementation lives
// in app/pages/admin.tsx (component: AdminDashboard) and is reused here so
// there is exactly ONE admin dashboard. The storefront homepage renders only
// storefront content.
"use client";

import AdminDashboard from "../pages/admin";

export default function AdminPage() {
  return <AdminDashboard />;
}
