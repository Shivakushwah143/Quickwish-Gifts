const AUTH_KEYS = [
  "token",
  "customerToken",
  "customerData",
  "adminToken",
  "adminData",
  "adminUsername",
  "creatorToken",
  "creatorData",
  "creatorName",
  "userRole",
];

export const clearAllAuthState = (): void => {
  if (typeof window === "undefined") return;

  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  sessionStorage.clear();
};

export const clearCustomerAuthState = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("customerToken");
  localStorage.removeItem("customerData");
  sessionStorage.removeItem("token");
};

export const clearAdminAuthState = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminData");
  localStorage.removeItem("adminUsername");
  localStorage.removeItem("userRole");
};

export const clearCreatorAuthState = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("creatorToken");
  localStorage.removeItem("creatorData");
  localStorage.removeItem("creatorName");
};

export const hasJwtExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    if (typeof payload?.exp !== "number") return false;

    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};
