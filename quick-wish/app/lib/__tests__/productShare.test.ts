// Unit tests for lib/productShare.ts — pure URL/message/referral logic.
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  buildProductShareMessage,
  buildProductShareUrl,
  canUseNativeShare,
  captureReferralFromCurrentUrl,
  clearStoredReferralCode,
  formatSharePrice,
  getSiteUrl,
  getStoredReferralCode,
  isValidReferralCode,
  parseReferralFromQuery,
  persistReferralCode,
  REFERRAL_STORAGE_KEY,
  shareEmailUrl,
  shareFacebookUrl,
  shareLinkedInUrl,
  shareNative,
  shareTelegramUrl,
  shareTwitterUrl,
  shareWhatsAppUrl,
} from "../productShare";

const storage = new Map<string, string>();

const setMockWindow = (hostname: string, search = "") => {
  vi.stubGlobal("window", {
    location: { search, hostname, origin: `https://${hostname}` },
  });
};

const setMockLocalStorage = () => {
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
    clear: () => void storage.clear(),
  });
};

const setMockNavigator = (share?: unknown) => {
  vi.stubGlobal("navigator", {
    share,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
};

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.onewish.fun";
  setMockLocalStorage();
  setMockNavigator();
  setMockWindow("www.onewish.fun");
});

afterEach(() => {
  storage.clear();
  clearStoredReferralCode();
  vi.unstubAllGlobals();
  setMockLocalStorage();
  setMockWindow("www.onewish.fun");
});

describe("canonical share URLs", () => {
  it("builds the canonical public product URL", () => {
    expect(buildProductShareUrl({ slug: "birthday-hamper-1" })).toBe(
      "https://www.onewish.fun/products/birthday-hamper-1"
    );
  });

  it("appends the creator referral code using the existing ?ref= convention", () => {
    const url = buildProductShareUrl({ slug: "birthday-hamper-1", referralCode: "SHIVA" });
    expect(url).toBe("https://www.onewish.fun/products/birthday-hamper-1?ref=SHIVA");
  });

  it("ignores invalid referral codes instead of putting junk in URLs", () => {
    const url = buildProductShareUrl({ slug: "birthday-hamper-1", referralCode: "bad code!@#" });
    expect(url).toBe("https://www.onewish.fun/products/birthday-hamper-1");
  });

  it("never contains JWT/private-looking tokens", () => {
    const jwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0In0.signature";
    const url = buildProductShareUrl({
      slug: "birthday-hamper-1",
      referralCode: jwt,
    });
    expect(url).not.toContain(jwt);
    expect(url).not.toContain("eyJhbGci");
    expect(url).toBe("https://www.onewish.fun/products/birthday-hamper-1");
  });

  it("encodes slugs safely", () => {
    const url = buildProductShareUrl({ slug: "gift & cake/123" });
    expect(url).toBe("https://www.onewish.fun/products/gift%20%26%20cake%2F123");
  });
});

describe("referral validation", () => {
  it("accepts sane uppercase alphanumeric codes", () => {
    expect(isValidReferralCode("SHIVA")).toBe(true);
    expect(isValidReferralCode("abc123")).toBe(true);
    expect(isValidReferralCode(" A1B2 ")).toBe(true);
  });

  it("rejects unsafe or malformed codes", () => {
    expect(isValidReferralCode("")).toBe(false);
    expect(isValidReferralCode("a")).toBe(false);
    expect(isValidReferralCode("bad code!")).toBe(false);
    expect(isValidReferralCode("A".repeat(31))).toBe(false);
    expect(isValidReferralCode(undefined)).toBe(false);
    expect(isValidReferralCode(null)).toBe(false);
  });

  it("parses a valid ref from a query string and normalizes case", () => {
    expect(parseReferralFromQuery("?ref=shiva")).toBe("SHIVA");
    expect(parseReferralFromQuery("?utm=x&ref=CODE1")).toBe("CODE1");
  });

  it("returns null for invalid or missing ref params", () => {
    expect(parseReferralFromQuery("?ref=bad code")).toBe(null);
    expect(parseReferralFromQuery("?ref=")).toBe(null);
    expect(parseReferralFromQuery("")).toBe(null);
    expect(parseReferralFromQuery("?code=SHIVA")).toBe(null);
  });
});

describe("referral persistence", () => {
  it("persists and retrieves validated codes only", () => {
    persistReferralCode("SHIVA");
    expect(getStoredReferralCode()).toBe("SHIVA");

    // Invalid values are never stored — the slot is cleared instead.
    persistReferralCode("bad code!");
    expect(getStoredReferralCode()).toBe(null);

    persistReferralCode("SHIVA");
    clearStoredReferralCode();
    expect(getStoredReferralCode()).toBe(null);
  });

  it("captures a referral from the current URL into storage", () => {
    setMockWindow("www.onewish.fun", "?ref=creator9");
    const captured = captureReferralFromCurrentUrl();
    expect(captured).toBe("CREATOR9");
    expect(localStorage.getItem(REFERRAL_STORAGE_KEY)).toBe("CREATOR9");
  });

  it("does not capture malformed referrals", () => {
    setMockWindow("www.onewish.fun", "?ref=no%20good");
    expect(captureReferralFromCurrentUrl()).toBe(null);
    expect(localStorage.getItem(REFERRAL_STORAGE_KEY)).toBe(null);
  });
});

describe("share message & platform URLs", () => {
  const data = {
    slug: "birthday-hamper-1",
    title: "Birthday Gift Hamper",
    price: 799,
  };

  it("builds a concise message with title, price and canonical URL", () => {
    const message = buildProductShareMessage(data);
    expect(message).toContain("Birthday Gift Hamper");
    expect(message).toContain("Rs 799");
    expect(message).toContain("https://www.onewish.fun/products/birthday-hamper-1");
    expect(message).not.toContain("SHIVA"); // no referral unless provided
  });

  it("omits the price line when price is unknown", () => {
    const message = buildProductShareMessage({ slug: "x", title: "Gift" });
    expect(message).not.toContain("Rs");
  });

  it("URL-encodes share parameters on every platform", () => {
    const tricky = buildProductShareMessage({
      slug: "hamper",
      title: "Cakes & Flowers",
      price: 799,
    });

    const whatsapp = shareWhatsAppUrl(tricky);
    expect(whatsapp).not.toContain("Cakes & Flowers");
    expect(whatsapp).toContain("Cakes+%26+Flowers");
    expect(whatsapp).not.toContain("%20"); // URLSearchParams uses + for spaces — fine

    const email = shareEmailUrl("Check out this gift 🎁", "Body & more");
    expect(email).toContain("Check+out+this+gift");
    expect(email).toContain("Body+%26+more");
  });

  it("generates valid platform share links", () => {
    const url = "https://www.onewish.fun/products/x";
    expect(shareFacebookUrl(url)).toContain("facebook.com/sharer/sharer.php?u=");
    expect(shareTwitterUrl("text", url)).toContain("twitter.com/intent/tweet");
    expect(shareTelegramUrl("text", url)).toContain("t.me/share/url");
    expect(shareLinkedInUrl(url)).toContain("linkedin.com/sharing/share-offsite");
    expect(shareEmailUrl("s", "b")).toContain("mailto:");
  });
});

describe("native share & site url", () => {
  it("detects native share support", () => {
    setMockNavigator();
    expect(canUseNativeShare()).toBe(false);

    setMockNavigator(vi.fn().mockResolvedValue(undefined));
    expect(canUseNativeShare()).toBe(true);
  });

  it("reports user cancellation as normal (not an error)", async () => {
    setMockNavigator(vi.fn().mockRejectedValue(Object.assign(new Error("aborted"), { name: "AbortError" })));
    const result = await shareNative({ title: "t", text: "m", url: "https://x" });
    expect(result.shared).toBe(false);
    expect(result.cancelled).toBe(true);
  });

  it("reports a successful native share", async () => {
    setMockNavigator(vi.fn().mockResolvedValue(undefined));
    const result = await shareNative({ title: "t", text: "m", url: "https://x" });
    expect(result.shared).toBe(true);
    expect(result.cancelled).toBe(false);
  });

  it("falls back to the default site URL outside the browser", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    vi.stubGlobal("window", undefined);
    expect(getSiteUrl()).toBe("https://www.onewish.fun");
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.onewish.fun";
  });
});

describe("price formatting", () => {
  it("formats prices in Indian locale", () => {
    expect(formatSharePrice(799)).toBe("Rs 799");
    expect(formatSharePrice(1200)).toBe("Rs 1,200");
  });

  it("returns empty string for invalid prices", () => {
    expect(formatSharePrice(undefined)).toBe("");
    expect(formatSharePrice(0)).toBe("");
    expect(formatSharePrice(-5)).toBe("");
  });
});
