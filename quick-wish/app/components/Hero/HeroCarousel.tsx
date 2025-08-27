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
    <section className="relative">
      <div className="flex overflow-hidden">
        <div className="w-full flex-shrink-0">
          <img
            src={slides[currentSlide].image}
            alt="Hero"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-end">
            <div className="p-4 text-white">
              <h2 className="text-xl font-bold mb-1">{slides[currentSlide].title}</h2>
              <p className="text-sm opacity-90">{slides[currentSlide].subtitle}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-4 right-4 flex space-x-1">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;