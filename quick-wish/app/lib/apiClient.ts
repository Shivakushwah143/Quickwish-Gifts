"use client";

import { clearCustomerAuthState } from "../utils/auth";

type ApiFetchOptions = RequestInit & {
  redirectOnAuthExpired?: boolean;
};

const getCustomerBearerToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customerToken") || localStorage.getItem("token");
};

export const isAuthExpiredResponse = async (response: Response): Promise<boolean> => {
  if (response.status !== 401) return false;

  try {
    const data = await response.clone().json();
    return data?.code === "UNAUTHENTICATED";
  } catch {
    return true;
  }
};

export const apiFetch = async (
  input: RequestInfo | URL,
  options: ApiFetchOptions = {}
): Promise<Response> => {
  const { redirectOnAuthExpired = false, headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  const token = getCustomerBearerToken();

  if (token && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers: requestHeaders,
    credentials: "include",
  });

  if (await isAuthExpiredResponse(response)) {
    clearCustomerAuthState();

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("quickwish:auth-expired"));
    }

    if (redirectOnAuthExpired && typeof window !== "undefined") {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/account?login=1&next=${encodeURIComponent(next)}`);
    }
  }

  return response;
};
