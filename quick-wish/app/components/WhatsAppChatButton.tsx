"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const message = "Hi QuickWish, I need help choosing a gift.";

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.01 3.2A12.74 12.74 0 0 0 5.03 22.38L3.2 29.04l6.82-1.79A12.73 12.73 0 1 0 16.01 3.2Zm0 23.31a10.5 10.5 0 0 1-5.36-1.47l-.38-.23-4.05 1.06 1.08-3.95-.25-.41a10.51 10.51 0 1 1 8.96 5Zm5.76-7.86c-.31-.16-1.87-.92-2.16-1.03-.29-.1-.5-.16-.71.16-.21.31-.81 1.03-.99 1.24-.18.21-.37.24-.68.08-.31-.16-1.33-.49-2.53-1.56-.94-.83-1.57-1.86-1.75-2.18-.18-.31-.02-.48.14-.64.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.23 3.4 5.4 4.77.75.32 1.34.52 1.8.66.76.24 1.45.21 1.99.13.61-.09 1.87-.76 2.13-1.5.26-.73.26-1.36.18-1.5-.08-.13-.29-.21-.6-.37Z" />
    </svg>
  );
}

export default function WhatsAppChatButton() {
  const pathname = usePathname();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "";

  useEffect(() => {
    const handleCheckout = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail;
      setCheckoutOpen(Boolean(detail?.open));
    };
    window.addEventListener("quickwish:checkout", handleCheckout);
    return () => window.removeEventListener("quickwish:checkout", handleCheckout);
  }, []);

  const href = useMemo(() => {
    if (!whatsappNumber) return "";
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [whatsappNumber]);

  const hiddenRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/creator") ||
    pathname?.startsWith("/sso-callback");

  if (!href || checkoutOpen || hiddenRoute) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with QuickWish on WhatsApp"
      className="fixed right-4 bottom-[calc(var(--mobile-bottom-cta-height)+env(safe-area-inset-bottom)+16px)] z-[var(--z-assistant)] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_rgba(37,211,102,0.35)] ring-1 ring-white/30 transition hover:-translate-y-0.5 hover:bg-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 md:bottom-6 md:right-6"
    >
      <WhatsAppIcon className="h-8 w-8 md:h-9 md:w-9" />
    </a>
  );
}
