const AUTH_KEYS = [
  "token",
  "adminToken",
  "adminUsername",
  "creatorToken",
  "creatorName",
  "userRole",
];

export const clearAuthState = (): void => {
  if (typeof window === "undefined") return;

  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  sessionStorage.clear();
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
