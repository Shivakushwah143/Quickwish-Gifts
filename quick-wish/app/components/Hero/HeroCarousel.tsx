// "use client";

// import { HeroSlide } from '@/app/types';
// import { motion, useReducedMotion } from 'framer-motion';
// import { Gift, Heart, Sparkles, Truck } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// interface HeroCarouselProps {
//   slides: HeroSlide[];
// }

// const HeroCarousel = ({ slides }: HeroCarouselProps) => {
//   const [currentSlide, setCurrentSlide] = useState<number>(0);
//   const shouldReduceMotion = useReducedMotion();
//   const router = useRouter();

//   useEffect(() => {
//     const timer = window.setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % slides.length);
//     }, 5000);

//     return () => window.clearInterval(timer);
//   }, [slides.length]);

//   return (
//     <section className="relative overflow-hidden bg-[#fff7f0]">
//       <div className="relative mx-auto max-w-7xl px-4 py-6 sm:py-10">
//         <div className="grid items-center gap-7 lg:grid-cols-[0.9fr_1.1fr]">
//           <motion.div
//             className="order-2 lg:order-1"
//             initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
//             animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
//             transition={{ duration: 0.45, ease: "easeOut" }}
//           >
//             <motion.span
//               className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#8b3f2f] shadow-sm"
//               whileHover={shouldReduceMotion ? undefined : { y: -1 }}
//             >
//               <Truck className="h-3.5 w-3.5" />
//               Same day gifting in Indore
//             </motion.span>

//             <motion.h1
//               className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-[#2b1d25] min-[420px]:text-4xl sm:text-5xl lg:text-6xl lux-serif"
//               {...(shouldReduceMotion ? {} : { transition: { delay: 0.05, duration: 0.45, ease: "easeOut" } })}
//             >
//               Send gifts today, beautifully chosen and handmade.
//             </motion.h1>
//             <motion.p
//               className="mt-4 max-w-xl text-base leading-7 text-[#6f5d66] sm:text-lg"
//               {...(shouldReduceMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.12, duration: 0.4, ease: "easeOut" } })}
//             >
//               Premium hampers, flowers, cakes, and custom notes delivered with care before the moment passes.
//             </motion.p>

//             <div className="mt-6 flex flex-wrap items-center gap-3">
//               <motion.button
//                 className="rounded-full bg-[color:var(--wine)] px-6 py-3 text-sm font-semibold text-[color:var(--ivory)] shadow-lg shadow-[#4a1f3b]/20 transition hover:bg-[#3b182f]"
//                 onClick={() => router.push('/products?category=Fresh Flowers')}
//                 whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
//                 whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
//               >
//                 Send Today
//               </motion.button>
//               <motion.button
//                 className="rounded-full border border-[#eadfd4] bg-white px-6 py-3 text-sm font-semibold text-[#2b1d25] transition hover:border-[#c9a36a]"
//                 onClick={() => router.push('/products?category=Personalized Gifts')}
//                 whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
//                 whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
//               >
//                 Build Custom Hamper
//               </motion.button>
//             </div>

//             <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 min-[420px]:grid-cols-3">
//               <div className="rounded-lg bg-white p-3 shadow-sm">
//                 <Truck className="mb-2 h-5 w-5 text-[#d46345]" />
//                 <p className="text-xs font-semibold text-[#2b1d25]">Same Day Delivery</p>
//               </div>
//               <div className="rounded-lg bg-white p-3 shadow-sm">
//                 <Heart className="mb-2 h-5 w-5 text-[#c5365b]" />
//                 <p className="text-xs font-semibold text-[#2b1d25]">100+ Happy Customers</p>
//               </div>
//               <div className="rounded-lg bg-white p-3 shadow-sm">
//                 <Sparkles className="mb-2 h-5 w-5 text-[#b88736]" />
//                 <p className="text-xs font-semibold text-[#2b1d25]">Handmade Gifts</p>
//               </div>
//             </div>
//           </motion.div>

//           <motion.div
//             className="order-1 lg:order-2"
//             initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }}
//             animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5, ease: "easeOut" }}
//           >
//             <div className="relative mx-auto max-w-[620px]">
//               <div className="absolute left-3 top-3 z-10 rounded-lg bg-white px-3 py-2 shadow-lg">
//                 <p className="text-[10px] font-semibold uppercase text-[#b54e36]">Delivered today</p>
//                 <p className="text-sm font-bold text-[#2b1d25]">Custom note included</p>
//               </div>
//               <img
//                 src={slides[currentSlide].image}
//                 alt={slides[currentSlide].title}
//                 className="h-[300px] w-full rounded-[20px] min-[420px]:h-[380px] border border-white object-cover shadow-2xl shadow-[#4a1f3b]/15 sm:h-[500px]"
//               />
//               <div className="absolute inset-x-3 bottom-4 min-[420px]:inset-x-auto min-[420px]:right-4 min-[420px]:max-w-[230px] rounded-lg bg-white/95 p-3 shadow-lg">
//                 <Gift className="mb-2 h-5 w-5 text-[#b54e36]" />
//                 <h2 className="text-base font-semibold text-[#2b1d25]">Curated for the person, not just the occasion.</h2>
//                 <p className="mt-1 text-xs text-[#6f5d66]">Flowers, sweets, keepsakes, and handwritten wishes.</p>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 space-x-2">
//         {slides.map((_, index) => (
//           <div
//             key={index}
//             className={`h-2 rounded-full transition-all ${
//               currentSlide === index ? 'w-8 bg-[color:var(--wine)]' : 'w-2 bg-[color:var(--gold)]/60'
//             }`}
//           />
//         ))}
//       </div>
//     </section>
//   );
// };

// export default HeroCarousel;


"use client";

import { HeroSlide } from '@/app/types';
import { motion, useReducedMotion } from 'framer-motion';
import { Gift, Heart, Sparkles, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const HeroCarousel = ({ slides }: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  // If not mounted yet, render a static version (no motion props)
  if (!mounted) {
    return (
      <section className="relative overflow-hidden bg-[#fff7f0]">
        {/* Same structure but without motion animations */}
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:py-10">
          <div className="grid items-center gap-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="order-2 lg:order-1">
              {/* Static content (same as animated version but without motion) */}
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#8b3f2f] shadow-sm">
                <Truck className="h-3.5 w-3.5" />
                Same day gifting in Indore
              </span>
              <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-[#2b1d25] min-[420px]:text-4xl sm:text-5xl lg:text-6xl lux-serif">
                🎁 Handmade gifts they'll actually remember.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#6f5d66] sm:text-lg">
                Same-day delivery in Indore. Handmade bouquets, custom hampers, crochet gifts, keychains, and surprise boxes starting at ₹149.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  className="rounded-full bg-[color:var(--wine)] px-6 py-3 text-sm font-semibold text-[color:var(--ivory)] shadow-lg shadow-[#4a1f3b]/20 transition hover:bg-[#3b182f]"
                  onClick={() => router.push('/products?category=Fresh Flowers')}
                >
                  Send Today
                </button>
                <button
                  className="rounded-full border border-[#eadfd4] bg-white px-6 py-3 text-sm font-semibold text-[#2b1d25] transition hover:border-[#c9a36a]"
                  onClick={() => router.push('/products?category=Personalized Gifts')}
                >
                  Build Custom Hamper
                </button>
              </div>
              <div className="mt-5 grid max-w-xl grid-cols-1 gap-2 min-[420px]:grid-cols-3">
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                  <Gift className="h-4 w-4 text-[#b54e36]" />
                  <p className="text-xs font-bold text-[#2b1d25]">Handmade Gifts</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                  <Truck className="h-4 w-4 text-[#d46345]" />
                  <p className="text-xs font-bold text-[#2b1d25]">Same-Day Delivery</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                  <Heart className="h-4 w-4 text-[#c5365b]" />
                  <p className="text-xs font-bold text-[#2b1d25]">Free Personalized Note</p>
                </div>
              </div>
              <div className="mt-5 grid max-w-xl grid-cols-1 gap-3 min-[420px]:grid-cols-3">
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <Truck className="mb-2 h-5 w-5 text-[#d46345]" />
                  <p className="text-xs font-semibold text-[#2b1d25]">Same Day Delivery</p>
                </div>
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <Heart className="mb-2 h-5 w-5 text-[#c5365b]" />
                  <p className="text-xs font-semibold text-[#2b1d25]">100+ Happy Customers</p>
                </div>
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <Sparkles className="mb-2 h-5 w-5 text-[#b88736]" />
                  <p className="text-xs font-semibold text-[#2b1d25]">Handmade Gifts</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-[620px]">
                <div className="absolute left-3 top-3 z-10 rounded-lg bg-white px-3 py-2 shadow-lg">
                  <p className="text-[10px] font-semibold uppercase text-[#b54e36]">Delivered today</p>
                  <p className="text-sm font-bold text-[#2b1d25]">Custom note included</p>
                </div>
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="h-[300px] w-full rounded-[20px] min-[420px]:h-[380px] border border-white object-cover shadow-2xl shadow-[#4a1f3b]/15 sm:h-[500px]"
                />
                <div className="absolute inset-x-3 bottom-4 min-[420px]:inset-x-auto min-[420px]:right-4 min-[420px]:max-w-[230px] rounded-lg bg-white/95 p-3 shadow-lg">
                  <Gift className="mb-2 h-5 w-5 text-[#b54e36]" />
                  <h2 className="text-base font-semibold text-[#2b1d25]">Curated for the person, not just the occasion.</h2>
                  <p className="mt-1 text-xs text-[#6f5d66]">Flowers, sweets, keepsakes, and handwritten wishes.</p>
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
  }

  // After mount, render the animated version (original code, but with shouldReduceMotion applied correctly)
  return (
    <section className="relative overflow-hidden bg-[#fff7f0]">
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <div className="grid items-center gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            className="order-2 lg:order-1"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <motion.span
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#8b3f2f] shadow-sm"
              whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            >
              <Truck className="h-3.5 w-3.5" />
              Same day gifting in Indore
            </motion.span>

            <motion.h1
              className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-[#2b1d25] min-[420px]:text-4xl sm:text-5xl lg:text-6xl lux-serif"
              {...(shouldReduceMotion ? {} : { transition: { delay: 0.05, duration: 0.45, ease: "easeOut" } })}
            >
              🎁 Handmade gifts they'll actually remember.
            </motion.h1>
            <motion.p
              className="mt-4 max-w-xl text-base leading-7 text-[#6f5d66] sm:text-lg"
              {...(shouldReduceMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.12, duration: 0.4, ease: "easeOut" } })}
            >
              Same-day delivery in Indore. Handmade bouquets, custom hampers, crochet gifts, keychains, and surprise boxes starting at ₹149.
            </motion.p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <motion.button
                className="rounded-full bg-[color:var(--wine)] px-6 py-3 text-sm font-semibold text-[color:var(--ivory)] shadow-lg shadow-[#4a1f3b]/20 transition hover:bg-[#3b182f]"
                onClick={() => router.push('/products?category=Fresh Flowers')}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                Send Today
              </motion.button>
              <motion.button
                className="rounded-full border border-[#eadfd4] bg-white px-6 py-3 text-sm font-semibold text-[#2b1d25] transition hover:border-[#c9a36a]"
                onClick={() => router.push('/products?category=Personalized Gifts')}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                Build Custom Hamper
              </motion.button>
            </div>

            <div className="mt-5 grid max-w-xl grid-cols-1 gap-2 min-[420px]:grid-cols-3">
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Gift className="h-4 w-4 text-[#b54e36]" />
                <p className="text-xs font-bold text-[#2b1d25]">Handmade Gifts</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Truck className="h-4 w-4 text-[#d46345]" />
                <p className="text-xs font-bold text-[#2b1d25]">Same-Day Delivery</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <Heart className="h-4 w-4 text-[#c5365b]" />
                <p className="text-xs font-bold text-[#2b1d25]">Free Personalized Note</p>
              </div>
            </div>

            <div className="mt-5 grid max-w-xl grid-cols-1 gap-3 min-[420px]:grid-cols-3">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <Truck className="mb-2 h-5 w-5 text-[#d46345]" />
                <p className="text-xs font-semibold text-[#2b1d25]">Same Day Delivery</p>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <Heart className="mb-2 h-5 w-5 text-[#c5365b]" />
                <p className="text-xs font-semibold text-[#2b1d25]">100+ Happy Customers</p>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <Sparkles className="mb-2 h-5 w-5 text-[#b88736]" />
                <p className="text-xs font-semibold text-[#2b1d25]">Handmade Gifts</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative mx-auto max-w-[620px]">
              <div className="absolute left-3 top-3 z-10 rounded-lg bg-white px-3 py-2 shadow-lg">
                <p className="text-[10px] font-semibold uppercase text-[#b54e36]">Delivered today</p>
                <p className="text-sm font-bold text-[#2b1d25]">Custom note included</p>
              </div>
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="h-[300px] w-full rounded-[20px] min-[420px]:h-[380px] border border-white object-cover shadow-2xl shadow-[#4a1f3b]/15 sm:h-[500px]"
              />
              <div className="absolute inset-x-3 bottom-4 min-[420px]:inset-x-auto min-[420px]:right-4 min-[420px]:max-w-[230px] rounded-lg bg-white/95 p-3 shadow-lg">
                <Gift className="mb-2 h-5 w-5 text-[#b54e36]" />
                <h2 className="text-base font-semibold text-[#2b1d25]">Curated for the person, not just the occasion.</h2>
                <p className="mt-1 text-xs text-[#6f5d66]">Flowers, sweets, keepsakes, and handwritten wishes.</p>
              </div>
            </div>
          </motion.div>
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

