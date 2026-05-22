"use client"

import { HeroSlide } from '@/app/types';
import { Gift, Heart, Sparkles, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const typewriterHeadlines = [
  'Same Day Gift Delivery',
  'Premium Hampers Made Personal',
  'Flowers, Cakes & Custom Surprises',
  'Indore Gifts Delivered Beautifully',
];

const TYPE_SPEED_MS = 42;
const ERASE_SPEED_MS = 22;
const HOLD_DELAY_MS = 1300;

const TypewriterHeading = () => {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [visibleText, setVisibleText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentHeadline = typewriterHeadlines[headlineIndex] || '';
    const isFullyTyped = visibleText === currentHeadline;
    const isFullyDeleted = visibleText.length === 0;

    const delay = isFullyTyped && !isDeleting
      ? HOLD_DELAY_MS
      : isDeleting
        ? ERASE_SPEED_MS
        : TYPE_SPEED_MS;

    const timer = window.setTimeout(() => {
      if (!isDeleting && isFullyTyped) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && isFullyDeleted) {
        setIsDeleting(false);
        setHeadlineIndex((currentIndex) => (currentIndex + 1) % typewriterHeadlines.length);
        return;
      }

      setVisibleText((currentText) => {
        if (isDeleting) {
          return currentText.slice(0, -1);
        }

        return currentHeadline.slice(0, currentText.length + 1);
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [headlineIndex, isDeleting, visibleText]);

  return (
    <h1 className="mt-4 min-h-[6.8rem] max-w-2xl text-4xl font-semibold leading-tight text-[#2b1d25] sm:min-h-[7.6rem] sm:text-5xl lg:min-h-[9rem] lg:text-6xl lux-serif">
      <span>{visibleText}</span>
      <span
        className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-1 animate-[hero-cursor_0.8s_steps(1)_infinite] rounded-full bg-[#f28b00]"
        aria-hidden="true"
      />
    </h1>
  );
};

const HeroCarousel = ({ slides }: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const offerTags = ['Under ₹499', '60% OFF', 'Trending', 'Same Day'];

  return (
    <section className="relative overflow-hidden bg-[#fff7f0]">
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(90deg,#fff0f2,#fff8df,#eef9f4)]" />
      <div className="relative max-w-7xl mx-auto px-4 py-5 sm:py-8">
        <div className="grid min-h-[520px] lg:min-h-[560px] items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="order-2 lg:order-1 pb-2">
            <div className="flex flex-wrap gap-2">
              {offerTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#f1c7b5] bg-white px-3 py-1 text-xs font-semibold text-[#8b3f2f] shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4a1f3b] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              <Timer className="h-3.5 w-3.5" />
              Indore same day delivery
            </p>

            <TypewriterHeading />
            <p className="mt-4 max-w-xl text-base text-[#6f5d66] sm:text-lg">
              Custom handmade hampers, flowers, cakes, and keepsakes made to feel personal from the first look.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                className="rounded-full bg-[color:var(--wine)] px-6 py-3 text-sm font-semibold text-[color:var(--ivory)] shadow-lg shadow-[#4a1f3b]/20 transition hover:bg-[#3b182f]"
                onClick={() => router.push('/products?category=Custom Hampers')}
              >
                Build a Hamper
              </button>
              <button
                className="rounded-full border border-[#eadfd4] bg-white px-6 py-3 text-sm font-semibold text-[#2b1d25] transition hover:border-[#c9a36a]"
                onClick={() => router.push('/products')}
              >
                Shop Best Sellers
              </button>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-lg bg-white/80 p-3 shadow-sm">
                <Gift className="mb-2 h-5 w-5 text-[#d46345]" />
                <p className="text-xs font-semibold text-[#2b1d25]">Handmade</p>
              </div>
              <div className="rounded-lg bg-white/80 p-3 shadow-sm">
                <Heart className="mb-2 h-5 w-5 text-[#c5365b]" />
                <p className="text-xs font-semibold text-[#2b1d25]">Custom notes</p>
              </div>
              <div className="rounded-lg bg-white/80 p-3 shadow-sm">
                <Sparkles className="mb-2 h-5 w-5 text-[#b88736]" />
                <p className="text-xs font-semibold text-[#2b1d25]">Premium wrap</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-[620px]">
              <div className="absolute -left-4 top-10 z-10 rounded-lg bg-white px-3 py-2 text-center shadow-lg">
                <p className="text-[10px] font-semibold uppercase text-[#b54e36]">Today only</p>
                <p className="text-sm font-bold text-[#2b1d25]">Up to 60% OFF</p>
              </div>
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="h-[390px] w-full rounded-[28px] border border-white object-cover shadow-2xl shadow-[#4a1f3b]/15 sm:h-[500px]"
              />
              <div className="absolute bottom-4 right-4 max-w-[220px] rounded-lg bg-white/95 p-3 shadow-lg">
                <p className="text-xs font-semibold text-[#b54e36]">Most loved</p>
                <h2 className="text-base font-semibold text-[#2b1d25]">{slides[currentSlide].title}</h2>
                <p className="text-xs text-[#6f5d66]">{slides[currentSlide].subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 space-x-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              currentSlide === index ? 'w-8 bg-[color:var(--wine)]' : 'w-2 bg-[color:var(--gold)]/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
