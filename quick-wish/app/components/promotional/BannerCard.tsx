'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { BannerImage, PromotionalBanner } from '../../types/banner';

type BannerCardProps = {
  banner: PromotionalBanner;
  image: BannerImage;
  loading?: boolean;
  compact?: boolean;
  priority?: boolean;
};

const toneClasses: Record<
  PromotionalBanner['tone'],
  {
    shell: string;
    border: string;
    headline: string;
    button: string;
    badge: string;
    imageGlow: string;
  }
> = {
  gold: {
    shell: 'bg-[#fff8e8]',
    border: 'border-[#ffe0a7]',
    headline: 'text-[#f28b00]',
    button: 'bg-[#ff9300] text-white group-hover:bg-[#e47700]',
    badge: 'bg-white/80 text-[#a95a00]',
    imageGlow: 'bg-[#ffe9b8]',
  },
  rose: {
    shell: 'bg-[#fff1f4]',
    border: 'border-[#ffd2dd]',
    headline: 'text-[#d34267]',
    button: 'bg-[#d34267] text-white group-hover:bg-[#b72d51]',
    badge: 'bg-white/80 text-[#9d2a48]',
    imageGlow: 'bg-[#ffd7df]',
  },
  garden: {
    shell: 'bg-[#eefaf4]',
    border: 'border-[#cbeedd]',
    headline: 'text-[#17835d]',
    button: 'bg-[#17835d] text-white group-hover:bg-[#0f6849]',
    badge: 'bg-white/80 text-[#0f6849]',
    imageGlow: 'bg-[#ccefdc]',
  },
};

export default function BannerCard({
  banner,
  image,
  loading = false,
  compact = false,
  priority = false,
}: BannerCardProps) {
  const tone = toneClasses[banner.tone];

  return (
    <Link
      href={banner.ctaHref}
      className="group block focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-2 focus:ring-offset-[color:var(--ivory)]"
      aria-label={`${banner.title}. ${banner.ctaLabel}`}
    >
      <article
        className={`relative overflow-hidden rounded-2xl border ${tone.border} ${tone.shell} shadow-[0_16px_34px_rgba(43,29,37,0.10)] transition duration-300 group-hover:scale-[1.012] group-hover:shadow-[0_22px_48px_rgba(43,29,37,0.14)] ${
          compact ? 'min-h-[190px]' : 'min-h-[310px] sm:min-h-[360px]'
        }`}
      >
        <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-white/80 blur-xl" />
        <div
          className={`pointer-events-none absolute right-6 top-8 h-28 w-28 rounded-full ${tone.imageGlow} blur-2xl`}
        />

        <div
          className={`relative grid min-h-[inherit] gap-4 p-5 ${
            compact ? 'sm:grid-cols-[1fr_150px] sm:p-5' : 'sm:grid-cols-[1fr_44%] sm:p-7'
          }`}
        >
          <div
            className={`relative overflow-hidden rounded-2xl bg-white/70 shadow-inner ${
              compact ? 'h-28 sm:order-2 sm:h-full' : 'h-44 sm:order-2 sm:h-full'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              loading={priority ? 'eager' : 'lazy'}
              className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
                loading ? 'opacity-60 blur-[1px]' : 'opacity-100'
              }`}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))]" />
            {loading && (
              <div className="absolute inset-0 animate-pulse bg-white/35" aria-hidden="true" />
            )}
          </div>

          <div
            className={`flex flex-col justify-between ${
              compact ? 'min-h-[150px] sm:order-1' : 'min-h-[180px] sm:order-1'
            }`}
          >
            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tone.badge}`}>
                {banner.eyebrow}
              </span>
            </div>

            <div className="mt-5">
              <h3
                className={`font-black uppercase leading-none tracking-normal ${tone.headline} ${
                  compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-5xl'
                }`}
              >
                {banner.title}
              </h3>
              <p
                className={`mt-3 max-w-md font-semibold leading-snug text-[#16110f] ${
                  compact ? 'text-base' : 'text-lg sm:text-2xl'
                }`}
              >
                {banner.subtitle}
              </p>
              <p className={`mt-2 font-black tracking-normal ${tone.headline} ${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}>
                From Rs {banner.startingPrice}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[199, 349, 499].map((price) => (
                  <span
                    key={`${banner.id}-${price}`}
                    className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-[#16110f] shadow-sm"
                  >
                    Rs {price}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div className="flex -space-x-2">
                {banner.galleryImages.slice(0, 3).map((galleryImage) => (
                  <img
                    key={galleryImage.url}
                    src={galleryImage.url}
                    alt={galleryImage.alt}
                    loading="lazy"
                    className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ))}
              </div>
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${tone.button} shadow-[0_12px_24px_rgba(43,29,37,0.16)] transition`}
                aria-hidden="true"
              >
                <ArrowRight className="h-7 w-7" />
              </span>
            </div>
          </div>
        </div>

        <span className="sr-only">{banner.ctaLabel}</span>
      </article>
    </Link>
  );
}
