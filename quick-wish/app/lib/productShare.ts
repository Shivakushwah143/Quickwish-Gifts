// lib/productShare.ts
// Single source of truth for product sharing. All platform URLs are built
// here with proper encoding; no other component should hand-roll share links.
// Share URLs only ever contain public data (slug + optional creator coupon
// code). Never JWTs, emails, or internal identifiers.

export const REFERRAL_PARAM = "ref";
export const REFERRAL_STORAGE_KEY = "quickwish_ref";

const DEFAULT_SITE_URL = "https://www.onewish.fun";

export const getSiteUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    const { origin, hostname } = window.location;

    // Never use localhost/dev origins for public share links.
    if (
      hostname &&
      hostname !== "localhost" &&
      !hostname.startsWith("127.") &&
      !hostname.startsWith("192.168.") &&
      !hostname.startsWith("10.") &&
      !hostname.endsWith(".local")
    ) {
      return origin;
    }
  }

  return DEFAULT_SITE_URL;
};

export type ProductShareData = {
  slug: string;
  title: string;
  price?: number;
  image?: string;
  description?: string;
  /** Creator coupon/referral code — appended only when the sharer is a creator. */
  referralCode?: string;
};

/**
 * Public-safe creator referral code. Only uppercase alphanumeric codes of a
 * sane length are allowed — anything else is ignored, never put in a URL.
 */
export const isValidReferralCode = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  return /^[A-Z0-9]{3,30}$/.test(value.trim().toUpperCase());
};

/**
 * Canonical, absolute, shareable product URL.
 *   normal:  https://www.onewish.fun/products/<slug>
 *   creator: https://www.onewish.fun/products/<slug>?ref=CODE
 */
export const buildProductShareUrl = ({
  slug,
  referralCode,
}: {
  slug: string;
  referralCode?: string | null;
}): string => {
  const cleanSlug = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");

  const base = `${getSiteUrl()}/products/${encodeURIComponent(cleanSlug)}`;

  if (referralCode && isValidReferralCode(referralCode)) {
    const params = new URLSearchParams({ [REFERRAL_PARAM]: referralCode });
    return `${base}?${params.toString()}`;
  }

  return base;
};

export const formatSharePrice = (price?: number): string => {
  const safePrice = Number(price);

  if (!Number.isFinite(safePrice) || safePrice <= 0) {
    return "";
  }

  return `Rs ${Math.round(safePrice).toLocaleString("en-IN")}`;
};

export const buildProductShareMessage = (data: ProductShareData): string => {
  const priceLine = formatSharePrice(data.price);
  const url = buildProductShareUrl({
    slug: data.slug,
    referralCode: data.referralCode,
  });

  const lines = [
    `Check out this beautiful gift on QuickWish 🎁`,
    "",
    data.title,
    ...(priceLine ? [priceLine, ""] : []),
    url,
  ];

  return lines.join("\n");
};

// --- Platform share links -------------------------------------------------

export const shareWhatsAppUrl = (message: string): string => {
  const params = new URLSearchParams({ text: message });
  return `https://api.whatsapp.com/send?${params.toString()}`;
};

export const shareFacebookUrl = (url: string): string => {
  const params = new URLSearchParams({ u: url });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
};

export const shareTwitterUrl = (text: string, url: string): string => {
  const params = new URLSearchParams({ text, url });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
};

export const shareTelegramUrl = (text: string, url: string): string => {
  const params = new URLSearchParams({ url, text });
  return `https://t.me/share/url?${params.toString()}`;
};

export const shareLinkedInUrl = (url: string): string => {
  const params = new URLSearchParams({ url });
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
};

export const shareEmailUrl = (subject: string, body: string): string => {
  const params = new URLSearchParams({ subject, body });
  return `mailto:?${params.toString()}`;
};

// --- Native share & clipboard ---------------------------------------------

export const canUseNativeShare = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

export const shareNative = async (data: {
  title: string;
  text: string;
  url: string;
}): Promise<{ shared: boolean; cancelled: boolean }> => {
  if (!canUseNativeShare()) {
    return { shared: false, cancelled: false };
  }

  try {
    await navigator.share(data);
    return { shared: true, cancelled: false };
  } catch (error) {
    const isAbort = (error as { name?: string })?.name === "AbortError";

    // User dismissing the sheet is normal — not an error.
    return { shared: false, cancelled: isAbort };
  }
};

export const copyProductLink = async (
  url: string
): Promise<{ ok: boolean; method: "clipboard" | "fallback" | "unsupported" }> => {
  if (typeof navigator === "undefined") {
    return { ok: false, method: "unsupported" };
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return { ok: true, method: "clipboard" };
    } catch {
      // Fall through to the legacy fallback below.
    }
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = url;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);
    return copied ? { ok: true, method: "fallback" } : { ok: false, method: "fallback" };
  } catch {
    return { ok: false, method: "unsupported" };
  }
};

// --- Creator referral handling ---------------------------------------------

let creatorCodeCache: Promise<string | null> | null = null;

/**
 * Resolves the logged-in creator's referral (coupon) code from their
 * dashboard. Lazy + cached per page session so sharing never causes an extra
 * network request unless the user actually opens a share flow as a creator.
 */
export const getCreatorReferralCode = (): Promise<string | null> => {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  const token = localStorage.getItem("creatorToken");

  if (!token) {
    return Promise.resolve(null);
  }

  creatorCodeCache = (async () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;

    if (!apiBase) {
      creatorCodeCache = null;
      return null;
    }

    try {
      const response = await fetch(`${apiBase}/creator/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!response.ok) {
        creatorCodeCache = null;
        return null;
      }

      const data = await response.json();
      const code = data?.dashboard?.referralCode;

      if (typeof code === "string" && isValidReferralCode(code)) {
        return code;
      }

      creatorCodeCache = null;
      return null;
    } catch {
      // Transient network failure — allow a later attempt to retry.
      creatorCodeCache = null;
      return null;
    }
  })();

  return creatorCodeCache;
};

/**
 * Reads a `?ref=CODE` value from a URL query and returns a validated code.
 * Invalid/malformed values return null — never trust raw query input.
 */
export const parseReferralFromQuery = (search: string): string | null => {
  if (!search) {
    return null;
  }

  const params = new URLSearchParams(search.replace(/^\?/, ""));
  const raw = params.get(REFERRAL_PARAM);

  if (!raw) {
    return null;
  }

  return isValidReferralCode(raw) ? raw.trim().toUpperCase() : null;
};

export const getStoredReferralCode = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
    return raw && isValidReferralCode(raw) ? raw : null;
  } catch {
    return null;
  }
};

export const persistReferralCode = (code: string | null): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (code && isValidReferralCode(code)) {
      localStorage.setItem(REFERRAL_STORAGE_KEY, code.trim().toUpperCase());
    } else {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode) — attribution simply won't persist.
  }
};

export const clearStoredReferralCode = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // Ignore.
  }
};

/** Capture a validated referral from the current URL and persist it. */
export const captureReferralFromCurrentUrl = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const code = parseReferralFromQuery(window.location.search);

  if (code) {
    persistReferralCode(code);
  }

  return code;
};
