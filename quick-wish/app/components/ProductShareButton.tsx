"use client";

// components/ProductShareButton.tsx
// Reusable share control used on product pages, listing cards, creator tools
// and admin views. All sharing logic lives in lib/productShare.ts.
import { useEffect, useState } from "react";
import { Check, Copy, Link2, Mail, Share2, X } from "lucide-react";
import {
  buildProductShareMessage,
  buildProductShareUrl,
  canUseNativeShare,
  copyProductLink,
  formatSharePrice,
  getCreatorReferralCode,
  shareEmailUrl,
  shareFacebookUrl,
  shareLinkedInUrl,
  shareNative,
  shareTelegramUrl,
  shareTwitterUrl,
  shareWhatsAppUrl,
  type ProductShareData,
} from "../lib/productShare";

type ProductShareButtonProps = ProductShareData & {
  variant?: "icon" | "full";
  label?: string;
  className?: string;
  /** When set, disables the automatic native share sheet on capable devices. */
  forceModal?: boolean;
  fallback?: "modal" | "copy";
};

const BrandIcon = {
  WhatsApp: (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={props.className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  Facebook: (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={props.className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  X: (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={props.className}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  ),
  Telegram: (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={props.className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
  LinkedIn: (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={props.className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Instagram: (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={props.className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
};

type Platform = {
  id: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
  bg: string;
  action: "link" | "native" | "copy";
};

export default function ProductShareButton({
  slug,
  title,
  price,
  image,
  description,
  referralCode,
  variant = "icon",
  label = "Share",
  className = "",
  forceModal = false,
  fallback = "modal",
}: ProductShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [creatorCode, setCreatorCode] = useState<string | null | undefined>(
    referralCode
  );
  const [instagramHint, setInstagramHint] = useState(false);

  const effectiveReferralCode = creatorCode ?? undefined;

  const shareData: ProductShareData = {
    slug,
    title,
    ...(typeof price === "number" ? { price } : {}),
    ...(image ? { image } : {}),
    ...(description ? { description } : {}),
    ...(effectiveReferralCode ? { referralCode: effectiveReferralCode } : {}),
  };

  const shareUrl = buildProductShareUrl({
    slug,
    referralCode: effectiveReferralCode,
  });
  const shareMessage = buildProductShareMessage(shareData);
  const priceLine = formatSharePrice(price);

  // When the modal opens, lazily resolve the creator's referral code (only for
  // logged-in creators) — no network work until the user actually shares.
  useEffect(() => {
    if (!isOpen || creatorCode !== undefined) {
      return;
    }

    let active = true;

    void getCreatorReferralCode().then((code) => {
      if (active) {
        setCreatorCode(code);
      }
    });

    return () => {
      active = false;
    };
  }, [isOpen, creatorCode]);

  const openShare = async () => {
    if (!forceModal && canUseNativeShare()) {
      const result = await shareNative({
        title,
        text: shareMessage,
        url: shareUrl,
      });

      if (result.shared) {
        return;
      }

      // Cancelled or unsupported - use the configured fallback.
    }

    if (fallback === "copy") {
      const result = await copyProductLink(shareUrl);

      if (result.ok) {
        setCopied(true);
        setCopyError(false);
        window.setTimeout(() => setCopied(false), 1800);
      } else {
        setCopyError(true);
        setIsOpen(true);
      }
      return;
    }

    setIsOpen(true);
  };

  const handleCopy = async () => {
    const result = await copyProductLink(shareUrl);

    if (result.ok) {
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 1800);
    } else {
      setCopyError(true);
    }
  };

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleInstagram = async () => {
    if (canUseNativeShare()) {
      await shareNative({ title, text: shareMessage, url: shareUrl });
      return;
    }

    // No reliable web share for Instagram — copy the link instead.
    const result = await copyProductLink(shareUrl);

    if (result.ok) {
      setInstagramHint(true);
      window.setTimeout(() => setInstagramHint(false), 3500);
    }
  };

  const platforms: Platform[] = [
    { id: "whatsapp", label: "WhatsApp", icon: BrandIcon.WhatsApp, bg: "bg-[#25D366]", action: "link" },
    { id: "facebook", label: "Facebook", icon: BrandIcon.Facebook, bg: "bg-[#1877F2]", action: "link" },
    { id: "instagram", label: "Instagram", icon: BrandIcon.Instagram, bg: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]", action: "copy" },
    { id: "x", label: "X", icon: BrandIcon.X, bg: "bg-[#0F1419]", action: "link" },
    { id: "telegram", label: "Telegram", icon: BrandIcon.Telegram, bg: "bg-[#229ED9]", action: "link" },
    { id: "linkedin", label: "LinkedIn", icon: BrandIcon.LinkedIn, bg: "bg-[#0A66C2]", action: "link" },
    { id: "email", label: "Email", icon: (props) => <Mail {...props} />, bg: "bg-[color:var(--muted)]", action: "link" },
  ];

  const handlePlatformClick = (platform: Platform) => {
    if (platform.action === "native") {
      void openShare();
      return;
    }

    if (platform.action === "copy") {
      void handleInstagram();
      return;
    }

    let url = "";

    switch (platform.id) {
      case "whatsapp":
        url = shareWhatsAppUrl(shareMessage);
        break;
      case "facebook":
        url = shareFacebookUrl(shareUrl);
        break;
      case "x":
        url = shareTwitterUrl(`Found this beautiful gift on QuickWish 🎁 ${priceLine ? `— ${title} ${priceLine}` : `— ${title}`}`, shareUrl);
        break;
      case "telegram":
        url = shareTelegramUrl(`${title}${priceLine ? ` — ${priceLine}` : ""}`, shareUrl);
        break;
      case "linkedin":
        url = shareLinkedInUrl(shareUrl);
        break;
      case "email":
        url = shareEmailUrl(
          `Check out this gift on QuickWish 🎁`,
          `I found this beautiful gift on QuickWish.\n\n${title}${priceLine ? `\n${priceLine}` : ""}\n\n${shareUrl}`
        );
        break;
      default:
        return;
    }

    openLink(url);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void openShare()}
        aria-label={`Share product: ${title}`}
        title={label}
        className={`inline-flex items-center justify-center transition-all ${className || (variant === "full"
          ? "gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-black text-[color:var(--plum)] hover:border-[color:var(--gold)] hover:bg-[color:var(--tint-cream)]"
          : "h-10 w-10 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] shadow-sm hover:border-[color:var(--gold)] hover:text-[color:var(--wine)] hover:shadow-md")}`}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
        {variant === "full" && <span>{label}</span>}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Share ${title}`}
          onClick={(event) => {
            // Prevent the click from bubbling to any parent click handler
            // (e.g. a product card that navigates on click).
            event.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-[color:var(--surface)] shadow-2xl sm:rounded-3xl max-h-[92vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
              <div>
                <h2 className="text-base font-black text-[color:var(--plum)]">Share this gift 🎁</h2>
                <p className="text-xs text-[color:var(--muted)]">
                  {effectiveReferralCode
                    ? "Your creator link includes your referral code"
                    : "Send this gift to someone special"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-[color:var(--muted)] transition hover:bg-[color:var(--tint-cream)] hover:text-[color:var(--plum)]"
                aria-label="Close share dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product preview */}
            <div className="flex items-center gap-3 border-b border-[color:var(--border)] bg-[color:var(--tint-cream)] px-5 py-4">
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl border border-[color:var(--border)] object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[color:var(--plum)]">{title}</p>
                {priceLine && <p className="mt-0.5 text-sm font-bold text-[color:var(--wine)]">{priceLine}</p>}
              </div>
            </div>

            {/* Platform grid */}
            <div className="grid grid-cols-4 gap-4 px-5 py-5">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => handlePlatformClick(platform)}
                    className="group flex flex-col items-center gap-2"
                    aria-label={`Share on ${platform.label}`}
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm transition group-hover:scale-105 group-hover:shadow-md ${platform.bg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-bold text-[color:var(--muted)]">{platform.label}</span>
                  </button>
                );
              })}

              {canUseNativeShare() && (
                <button
                  type="button"
                  onClick={() => void openShare()}
                  className="group flex flex-col items-center gap-2"
                  aria-label="More sharing options"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--wine)] text-[color:var(--ivory)] shadow-sm transition group-hover:scale-105 group-hover:shadow-md">
                    <Share2 className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-bold text-[color:var(--muted)]">More</span>
                </button>
              )}
            </div>

            {instagramHint && (
              <p className="mx-5 mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                Link copied — paste it into Instagram to share.
              </p>
            )}

            {/* Copy link */}
            <div className="border-t border-[color:var(--border)] px-5 py-4">
              <div className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--tint-cream)] p-2 pl-3">
                <Link2 className="h-4 w-4 shrink-0 text-[color:var(--wine)]" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-[color:var(--muted)]">
                  {shareUrl}
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black transition ${
                    copied
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-[color:var(--wine)] text-[color:var(--ivory)] hover:bg-[#3b182f]"
                  }`}
                  aria-label="Copy product link"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {copyError && (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  Could not copy the link. Please copy it manually.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
