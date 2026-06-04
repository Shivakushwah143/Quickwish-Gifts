

"use client"

import {
  birthdayGifts,
  heroSlides,
  sameDayGifts,
} from '../app/utils/constants';
import TopBar from './components/Header/TopBar';
import HeroCarousel from './components/Hero/HeroCarousel';
import CategorySection from './components/CategorySection/CategorySection';
import ServicesSection from './components/ServicesSection/ServicesSection';
import NewsletterSection from './components/NewsletterSection/NewsletterSection';
import Footer from './Footer/Footer';
import ProductSection from './components/ProductSection/ProductSection';
import Header from './components/Header';
import AdminDashboard from './pages/admin';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Testimonials from './components/Testimonials';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BadgePercent, Cake, CalendarHeart, Flower2, Gift, Heart, MessageSquareText, Palette, Search, ShieldCheck, Sparkles, Truck, Users } from 'lucide-react';
import BannerSection from './components/promotional/BannerSection';

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('Her');
  const [giftOccasion, setGiftOccasion] = useState('Birthday');
  const [giftBudget, setGiftBudget] = useState('Under Rs 499');
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();

  const shoppingCategories = [
    {
      name: 'Gift Hampers',
      filterCategory: 'Personalized Gifts',
      tag: 'Handmade',
      count: '25+ Hampers Available',
      cta: 'Shop Now',
      image: 'https://images.pexels.com/photos/30632274/pexels-photo-30632274.png',
      icon: Gift,
      tint: 'bg-[#fff0d8]'
    },
    {
      name: 'Handmade Flower Bouquets',
      filterCategory: 'Flower Bouquets',
      tag: 'Fresh Picks',
      count: '18+ Bouquets Available',
      cta: 'Explore Gifts',
      image: 'https://images.pexels.com/photos/27094493/pexels-photo-27094493.jpeg',
      icon: Flower2,
      tint: 'bg-[#ffe9ef]'
    },
    {
      name: 'Crochet Bouquets',
      filterCategory: 'Crochet Bouquets',
      tag: 'Keepsake',
      count: '12+ Crochet Gifts',
      cta: 'Explore Gifts',
      image: 'https://images.pexels.com/photos/10720839/pexels-photo-10720839.jpeg',
      icon: Sparkles,
      tint: 'bg-[#e9f7f0]'
    },
    {
      name: 'Custom Gifts',
      filterCategory: 'Personalized Gifts',
      tag: 'Made for them',
      count: '20+ Custom Ideas',
      cta: 'Explore Collection',
      image: 'https://images.pexels.com/photos/19027765/pexels-photo-19027765.jpeg',
      icon: Palette,
      tint: 'bg-[#f0edff]'
    }
  ];

  const quickLinks = [
    { label: 'Same Day', category: 'Fresh Flowers', icon: Truck },
    { label: 'Birthday', category: 'Birthday', icon: Cake },
    { label: 'Anniversary', category: 'Anniversary', icon: CalendarHeart },
    { label: 'Love', category: "Valentine's Day", icon: Heart },
    { label: 'Flowers', category: 'Flower Bouquets', icon: Flower2 },
    { label: 'Friendship', category: 'besti', icon: Users },
    { label: 'For Her', category: 'Jewelry', icon: Gift },
    { label: 'Under Rs 499', category: 'Chocolate Bouquets', icon: BadgePercent },
    { label: 'Custom Hampers', category: 'Personalized Gifts', icon: Sparkles },
  ];

  const trustItems = [
    { label: '100+ Happy Customers', icon: Heart },
    { label: 'Same-Day Delivery', icon: Truck },
    { label: 'Handmade with Love', icon: Gift },
    { label: 'Secure Payments', icon: ShieldCheck },
  ];

  const campaignCards = [
    {
      title: 'Gifts Under Rs 499',
      subtitle: 'Under Rs 499, still unforgettable.',
      category: 'Chocolate Bouquets',
      badge: 'Budget friendly',
      image: 'https://images.pexels.com/photos/19027765/pexels-photo-19027765.jpeg',
      tone: 'bg-[#fff0e7]',
    },
    {
      title: 'Custom Hampers',
      subtitle: 'Build a gift around their story.',
      category: 'Personalized Gifts',
      badge: 'Handmade',
      image: 'https://images.pexels.com/photos/30632274/pexels-photo-30632274.png',
      tone: 'bg-[#f0edff]',
    },
    {
      title: 'Flowers + Cake Combos',
      subtitle: 'Birthday before midnight?',
      category: 'Birthday',
      badge: 'Same day',
      image: 'https://images.pexels.com/photos/27094493/pexels-photo-27094493.jpeg',
      tone: 'bg-[#edf9f2]',
    },
  ];

  const occasionCards = [
    {
      title: 'Birthday tonight?',
      copy: 'Cakes, flowers, and keepsakes ready for fast delivery.',
      category: 'Birthday',
      icon: CalendarHeart,
    },
    {
      title: 'Send love softly',
      copy: 'Elegant picks for anniversaries and romantic surprises.',
      category: 'Anniversary',
      icon: Heart,
    },
    {
      title: 'Deal-ready gifting',
      copy: 'Offer tags, budget picks, and trending gifts in one place.',
      category: 'Chocolate Bouquets',
      icon: BadgePercent,
    },
  ];

  const relationshipCards = [
    {
      label: '❤️ For Her',
      category: 'Jewelry',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=700&fit=crop',
    },
    {
      label: '🎁 For Him',
      category: 'Watches',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=700&fit=crop',
    },
    {
      label: '🌸 For Mom',
      category: 'Flower Bouquets',
      image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&h=700&fit=crop',
    },
    {
      label: '🤝 For Friends',
      category: 'besti',
      image: 'https://images.unsplash.com/photo-1529066516367-36973222c957?w=600&h=700&fit=crop',
    },
    {
      label: '💕 For Couples',
      category: 'Anniversary',
      image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=700&fit=crop',
    },
    {
      label: '🎈 For Kids',
      category: 'Teddy Bears',
      image: 'https://media.istockphoto.com/id/1066672498/photo/kids-wrapping-christmas-gifts.webp?a=1&b=1&s=612x612&w=0&k=20&c=Cwlc_RZW1vtLVBdMGwGQ-S0rsvdvklKQQuWJxn3MTpU=',
    },
  ];

  const giftFinderRecipients = [
    { label: 'Her', category: 'Jewelry' },
    { label: 'Him', category: 'Watches' },
    { label: 'Friend', category: 'besti' },
    { label: 'Mom', category: 'Flower Bouquets' },
    { label: 'Couple', category: 'Anniversary' },
  ];

  const giftFinderOccasions = [
    { label: 'Birthday', category: 'Birthday' },
    { label: 'Anniversary', category: 'Anniversary' },
    { label: 'Love', category: "Valentine's Day" },
    { label: 'Thank You', category: 'Flower Bouquets' },
    { label: 'Sorry', category: 'Fresh Flowers' },
  ];

  const giftFinderBudgets = [
    { label: 'Under Rs 499', category: 'Chocolate Bouquets' },
    { label: 'Rs 500-999', category: 'Birthday' },
    { label: 'Premium', category: 'Personalized Gifts' },
  ];

  const getGiftFinderCategory = () => {
    const selectedOccasion = giftFinderOccasions.find((item) => item.label === giftOccasion);
    const selectedRecipient = giftFinderRecipients.find((item) => item.label === giftRecipient);
    const selectedBudget = giftFinderBudgets.find((item) => item.label === giftBudget);

    if (giftBudget === 'Premium') return selectedBudget?.category || 'Personalized Gifts';
    if (giftOccasion === 'Birthday' || giftOccasion === 'Anniversary') return selectedOccasion?.category || 'Birthday';
    return selectedRecipient?.category || selectedOccasion?.category || 'Birthday';
  };

  useEffect(() => {
    // Check if user is an admin (you can customize this logic)
    const adminToken = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');

    // Set to true only if admin credentials are present
    setIsAdmin(!!adminToken || userRole === 'admin');
  }, []);

  return (
    <div className="min-h-screen bg-[color:var(--ivory)] pb-28 md:pb-0">
      <TopBar />
      <Header />

      {/* Conditionally render AdminDashboard only for admin users */}
      {isAdmin && <AdminDashboard />}

      <HeroCarousel slides={heroSlides} />

      <section className="bg-[#fffaf4] px-4 py-4">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 rounded-xl border border-[#ead7c5] bg-white p-2 shadow-sm min-[420px]:grid-cols-2 md:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 rounded-lg px-3 py-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4e4] text-[#b54e36]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold text-[#2b1d25] sm:text-sm">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#fffaf4] px-4 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[#2b1d25] sm:text-3xl lux-serif">🎁 Who Are You Shopping For?</h2>
            <p className="text-sm text-[#6f5d66]">Find the perfect gift for every special person in your life.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 md:grid-cols-6">
            {relationshipCards.map((item) => (
              <motion.button
                key={item.label}
                className="group overflow-hidden rounded-lg border border-[#ead7c5] bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                onClick={() => router.push(`/products?category=${encodeURIComponent(item.category)}`)}
                whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.015 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div className="relative overflow-hidden">
                  <img src={item.image} alt={item.label} className="h-28 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-36" loading="lazy" />
                  <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#4a1f3b] opacity-0 shadow-sm transition group-hover:translate-x-0.5 group-hover:opacity-100">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-black text-[#2b1d25]">{item.label}</p>
                  <p className="mt-1 inline-flex items-center text-xs font-bold text-[#8b3f2f]">
                    Explore Gifts
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f3ec] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold lux-serif text-[#2b1d25]">
                Main Product Categories
              </h3>
              <p className="text-sm text-[#6f5d66]">
                Choose what kind of surprise you want to send, then make it feel personal.
              </p>
            </div>
            <span className="hidden sm:inline rounded-full bg-[#fff4e4] px-3 py-1 text-xs font-semibold text-[#8b3f2f]">Indore delivery ready</span>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {shoppingCategories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.name}
                  className={`group cursor-pointer overflow-hidden rounded-lg border border-[color:var(--border)] ${category.tint} shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.99]`}
                  onClick={() => router.push(`/products?category=${encodeURIComponent(category.filterCategory)}`)}
                  whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(`/products?category=${encodeURIComponent(category.filterCategory)}`);
                    }
                  }}
                >
                  <div className="relative">
                  <img
                    src={category.image}
                    alt={category.name}
                      className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-56"
                  />
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#b54e36] shadow-sm">
                      {category.tag}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#2b1d25] sm:text-base">{category.name}</h4>
                      <p className="mt-0.5 text-xs font-semibold text-[#6f5d66]">{category.count}</p>
                      <span className="mt-2 inline-flex items-center rounded-full bg-[#4a1f3b] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition group-hover:bg-[#3b182f] group-hover:shadow-md group-active:scale-[0.98]">
                        {category.cta}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#4a1f3b] shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <div
              className="col-span-1 cursor-pointer rounded-lg border border-[#f0d1bd] bg-[#fff8ed] px-4 py-3 text-center shadow-sm transition hover:shadow-md min-[420px]:col-span-2 lg:col-span-4"
              onClick={() => router.push('/products')}
            >
              <span className="text-sm font-bold text-[color:var(--wine)]">Explore all gifts and offers</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf4] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#2b1d25] sm:text-3xl lux-serif">Featured Collections</h2>
              <p className="text-sm text-[#6f5d66]">Sweet little picks for birthdays, anniversaries, friendships, and last-minute surprises.</p>
            </div>
            <span className="hidden rounded-full bg-[#4a1f3b] px-3 py-1 text-xs font-semibold text-white sm:inline-flex">
              Offers live today
            </span>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
            {campaignCards.map((card, index) => (
              <motion.button
                key={card.title}
                className={`group overflow-hidden rounded-lg border border-[#ead7c5] ${card.tone} text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
                onClick={() => router.push(`/products?category=${encodeURIComponent(card.category)}`)}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <div className={index === 0 ? 'grid gap-3 sm:grid-cols-[0.9fr_1.1fr]' : ''}>
                  <div className="p-4">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#b54e36] shadow-sm">
                      {card.badge}
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-[#2b1d25]">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6f5d66]">{card.subtitle}</p>
                    <p className="mt-5 inline-flex items-center text-sm font-bold text-[#4a1f3b]">
                      Explore Gifts
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </div>
                  <img
                    src={card.image}
                    alt={card.title}
                    className={index === 0 ? 'h-48 w-full object-cover sm:h-full' : 'h-44 w-full object-cover'}
                    loading="lazy"
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <ProductSection title="Best Sellers" />
      {false && <section className="bg-[color:var(--ivory)] px-4 py-8">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
          {occasionCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                onClick={() => router.push(`/products?category=${encodeURIComponent(card.category)}`)}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4e4] text-[#b54e36]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[color:var(--plum)]">{card.title}</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">{card.copy}</p>
              </motion.button>
            );
          })}
        </div>
      </section>}
      {false && <BannerSection
        title="Fresh picks for today"
        subtitle="Seasonal flowers, hand-finished hampers, and gifting moments ready to send."
        bannerIds={['mid-fresh-flowers']}
        className="bg-[#f8f3ec]"
      />}
      {false && <ServicesSection />}
      {false && <CategorySection
        title="Same-Day Surprises"
        categories={sameDayGifts}
        containerId="sameday-slider"
      />}

      {false && <section className="bg-[#130c11] px-4 py-10">
        <div className="mx-auto grid max-w-7xl items-center gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="rounded-full bg-[#fff4e4] px-3 py-1 text-xs font-bold text-[#8b3f2f]">High-touch gifting</span>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold text-white sm:text-4xl lux-serif">
              Build a custom hamper around their story.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#d8c9d0]">
              Choose sweets, flowers, keepsakes, notes, and wrapping. We hand-finish every detail so the gift feels deeply personal.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <motion.button
                className="rounded-full bg-[#c9a36a] px-6 py-3 text-sm font-bold text-[#2b1d25]"
                onClick={() => router.push('/products?category=Personalized Gifts')}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                Build Your Custom Hamper
              </motion.button>
              <a
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white"
                href="https://wa.me/919575930848"
                target="_blank"
                rel="noreferrer"
              >
                Talk on WhatsApp
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <img src="https://images.pexels.com/photos/10720839/pexels-photo-10720839.jpeg" alt="Custom hamper" className="h-44 w-full rounded-lg object-cover sm:h-64" loading="lazy" />
            <img src="https://images.pexels.com/photos/27094493/pexels-photo-27094493.jpeg" alt="Premium wrapped gift" className="mt-6 h-44 w-full rounded-lg object-cover sm:mt-8 sm:h-64" loading="lazy" />
          </div>
        </div>
      </section>}

      {false && <CategorySection
        title="Birthday, Beautifully"
        categories={birthdayGifts}
        containerId="birthday-slider"
        showArrows={false}
      />}
      <Testimonials />
      <section className="bg-[#fffaf4] px-4 py-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-[#ead7c5] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-[#2b1d25] sm:text-3xl lux-serif">
              Why Customers Love QuickWish
            </h2>
            <p className="mt-1 text-sm text-[#6f5d66]">
              Small surprises, packed with real feeling.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {[
              { label: '500+ Happy Customers', icon: Heart },
              { label: '1000+ Gifts Delivered', icon: Gift },
              { label: 'Same-Day Delivery Available', icon: Truck },
              { label: 'Personalized Gifting Experience', icon: MessageSquareText },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl border border-[#ead7c5] bg-[#fffaf4] p-4">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0e7] text-[#b54e36]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-black text-[#2b1d25]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="bg-[#f8f3ec] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[#2b1d25] sm:text-3xl lux-serif">FAQ</h2>
            <p className="text-sm text-[#6f5d66]">Quick answers before you send a surprise.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                question: 'Do you deliver gifts the same day?',
                answer: 'Yes, same-day delivery is available across Indore for eligible gifts.',
              },
              {
                question: 'Can I add a personal note?',
                answer: 'Yes. Add your message and we will include it beautifully with the gift.',
              },
              {
                question: 'Can I build a custom hamper?',
                answer: 'Yes. Choose custom gifts, flowers, notes, and wrapping for a personal surprise.',
              },
              {
                question: 'How do I choose the right gift?',
                answer: 'Start with who you are shopping for, then pick the gift type that fits the moment.',
              },
            ].map((item) => (
              <div key={item.question} className="rounded-xl border border-[#ead7c5] bg-white p-4 shadow-sm">
                <h3 className="text-sm font-black text-[#2b1d25]">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6f5d66]">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {false && <NewsletterSection />}
      <Footer />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ead7c5] bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(43,29,37,0.12)] backdrop-blur md:hidden">
        <motion.button
          className="w-full rounded-full bg-[#4a1f3b] px-5 py-3 text-sm font-bold text-white"
          onClick={() => router.push('/products?category=Fresh Flowers')}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        >
          Send Today in Indore
        </motion.button>
      </div>
    </div>
  );
}
