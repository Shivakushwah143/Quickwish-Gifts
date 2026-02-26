"use client"


import { HeroSlide } from '@/app/types';
import { useState, useEffect } from 'react';

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const HeroCarousel = ({ slides }: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative bg-[color:var(--ivory)]">
      <div className="flex overflow-hidden">
        <div className="w-full flex-shrink-0 relative">
          <img
            src={slides[currentSlide].image}
            alt="Hero"
            className="w-full h-[56vh] min-h-[420px] max-h-[640px] object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-end">
            <div className="w-full">
              <div className="max-w-7xl mx-auto px-4 pb-10">
                <div className="max-w-2xl lux-card bg-[color:var(--ivory)]/90 backdrop-blur px-6 py-6">
                  <span className="lux-pill inline-flex items-center px-3 py-1 text-xs tracking-wide uppercase">
                    Indore Atelier Edition
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[color:var(--plum)] mt-4 lux-serif">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-[color:var(--muted)] mt-3 text-base sm:text-lg">
                    {slides[currentSlide].subtitle}
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <button className="bg-[color:var(--wine)] text-[color:var(--ivory)] px-5 py-2.5 rounded-xl font-medium hover:bg-[#3b182f] transition-all">
                      {slides[currentSlide].cta}
                    </button>
                    <span className="text-sm text-[color:var(--muted)]">
                      Hand-finished, delivered with care.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-6 right-6 flex space-x-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              currentSlide === index ? 'w-8 bg-[color:var(--gold)]' : 'w-2 bg-[color:var(--ivory)]/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
