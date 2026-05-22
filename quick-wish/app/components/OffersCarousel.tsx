'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Copy, Gift, Sparkles, TicketPercent } from 'lucide-react';

export type Offer = {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  value: string;
  eyebrow: string;
  validUntil: string;
  gradient: string;
  accent: string;
};

export const mockOffers: Offer[] = [
  {
    id: 'creator-love-10',
    title: 'Creator Love',
    subtitle: 'Use this on curated hampers and keepsakes.',
    code: 'LOVE10',
    value: '10% OFF',
    eyebrow: 'Influencer pick',
    validUntil: 'Valid today',
    gradient: 'from-[#41192f] via-[#8b3f2f] to-[#d7a55f]',
    accent: 'bg-[#fff4e4] text-[#8b3f2f]',
  },
  {
    id: 'birthday-joy-15',
    title: 'Birthday Joy',
    subtitle: 'Best for cakes, flowers, and birthday combos.',
    code: 'BDAY15',
    value: '15% OFF',
    eyebrow: 'Most used',
    validUntil: 'Limited slots',
    gradient: 'from-[#163d3a] via-[#2f7f73] to-[#c9a36a]',
    accent: 'bg-[#e9f7f0] text-[#1f6f64]',
  },
  {
    id: 'first-gift-200',
    title: 'First Gift',
    subtitle: 'A warm welcome for your first QuickWish order.',
    code: 'FIRST200',
    value: 'Rs 200 OFF',
    eyebrow: 'New customer',
    validUntil: 'Min order Rs 999',
    gradient: 'from-[#2b1d25] via-[#65415a] to-[#c7905c]',
    accent: 'bg-[#f8edf4] text-[#7c315f]',
  },
  {
    id: 'same-day-49',
    title: 'Same-Day Treat',
    subtitle: 'Sweeten urgent gifting with a delivery-friendly deal.',
    code: 'FAST49',
    value: 'Rs 49 OFF',
    eyebrow: 'Indore only',
    validUntil: 'Same-day orders',
    gradient: 'from-[#5d2e1f] via-[#b55f36] to-[#efc36d]',
    accent: 'bg-[#fff0d8] text-[#9b4a2c]',
  },
  {
    id: 'premium-hamper-20',
    title: 'Luxe Hampers',
    subtitle: 'For premium baskets, dry fruits, and custom boxes.',
    code: 'LUXE20',
    value: '20% OFF',
    eyebrow: 'Premium edit',
    validUntil: 'Weekend offer',
    gradient: 'from-[#24323f] via-[#5a7582] to-[#d0a968]',
    accent: 'bg-[#edf5f7] text-[#315968]',
  },
];

type OfferCardProps = {
  offer: Offer;
};

export function OfferCard({ offer }: OfferCardProps) {
  const copyCode = async () => {
    if (!navigator?.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(offer.code);
  };

  return (
    <article
      className={`relative flex min-h-[190px] snap-start flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br ${offer.gradient} p-4 text-white shadow-lg shadow-[#2b1d25]/10 sm:min-h-[210px]`}
      aria-label={`${offer.title} coupon ${offer.code}`}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.28),transparent_35%)]" />
      <div className="relative flex items-start justify-between gap-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${offer.accent}`}>
          <Sparkles className="mr-1 h-3 w-3" />
          {offer.eyebrow}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur">
          <TicketPercent className="h-4 w-4" />
        </span>
      </div>

      <div className="relative mt-5">
        <p className="text-3xl font-black tracking-normal sm:text-4xl">{offer.value}</p>
        <h3 className="mt-2 text-lg font-semibold tracking-normal">{offer.title}</h3>
        <p className="mt-1 max-w-[15rem] text-sm leading-snug text-white/82">{offer.subtitle}</p>
      </div>

      <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-white/20 pt-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-normal text-white/70">Use code</p>
          <p className="font-mono text-base font-bold tracking-normal">{offer.code}</p>
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-bold text-[#2b1d25] transition hover:bg-[#fff4e4] focus:outline-none focus:ring-2 focus:ring-white/70"
          aria-label={`Copy coupon code ${offer.code}`}
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
      </div>

      <p className="relative mt-3 text-xs font-semibold text-white/76">{offer.validUntil}</p>
    </article>
  );
}

type OffersCarouselProps = {
  title?: string;
  subtitle?: string;
  offers?: Offer[];
  showArrows?: boolean;
};

export default function OffersCarousel({
  title = 'Offers made for gifting',
  subtitle = 'Swipe through creator codes, first-order treats, and same-day specials.',
  offers = mockOffers,
  showArrows = true,
}: OffersCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = (direction: 'left' | 'right') => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const firstCard = scroller.querySelector<HTMLElement>('[data-offer-card]');
    const cardWidth = firstCard?.offsetWidth ?? 280;
    scroller.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-[color:var(--surface)] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full bg-[#fff4e4] px-3 py-1 text-xs font-bold text-[#8b3f2f]">
              <Gift className="mr-1.5 h-3.5 w-3.5" />
              QuickWish coupons
            </div>
            <h2 className="text-2xl font-semibold text-[color:var(--plum)] sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-[color:var(--muted)]">{subtitle}</p>
          </div>

          {showArrows && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollByCard('left')}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--ivory)] text-[color:var(--plum)] transition hover:border-[color:var(--gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/40"
                aria-label="Scroll offers left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard('right')}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--ivory)] text-[color:var(--plum)] transition hover:border-[color:var(--gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/40"
                aria-label="Scroll offers right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollerRef}
          className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4"
          aria-label="Available coupon offers"
        >
          {offers.map((offer) => (
            <div
              key={offer.id}
              data-offer-card
              className="w-[78%] flex-none snap-start sm:w-[43%] lg:w-[31%]"
            >
              <OfferCard offer={offer} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
