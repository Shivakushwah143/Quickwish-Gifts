"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminAuthModal from "../../components/AdminAuthModal";
import { clearAdminAuthState, hasJwtExpired } from "../../utils/auth";

export default function AdminLoginPage() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token && !hasJwtExpired(token)) {
      router.replace("/admin");
      return;
    }

    clearAdminAuthState();
    setOpen(true);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <AdminAuthModal
        isOpen={open}
        onClose={() => router.replace("/")}
        onSuccess={() => router.replace("/admin")}
      />
    </div>
  );
}
