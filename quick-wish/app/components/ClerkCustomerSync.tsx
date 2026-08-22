"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { clearCustomerAuthState } from "../utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ClerkCustomerSync() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !user?.id || !API_BASE_URL || syncedUserId.current === user.id) {
      return;
    }

    let active = true;

    const syncCustomer = async () => {
      const clerkToken = await getToken();

      if (!clerkToken) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/sync-clerk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clerkToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!active || !response.ok || !data?.token) {
        return;
      }

      clearCustomerAuthState();
      localStorage.setItem("token", data.token);
      localStorage.setItem("customerToken", data.token);
      localStorage.setItem(
        "customerData",
        JSON.stringify({
          role: "customer",
          token: data.token,
          user: data.user || null,
          email: data.user?.email || null,
        })
      );
      syncedUserId.current = user.id;
      window.dispatchEvent(new CustomEvent("quickwish:auth-synced"));
    };

    void syncCustomer();

    return () => {
      active = false;
    };
  }, [getToken, isSignedIn, user?.id]);

  return null;
}
