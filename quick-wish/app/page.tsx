

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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Testimonials from './components/Testimonials';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BadgePercent, Cake, CalendarHeart, Flower2, Gift, Heart, MessageSquareText, Palette, ShieldCheck, Sparkles, Truck, Users } from 'lucide-react';
import BannerSection from './components/promotional/BannerSection';

export default function Home() {
  const [giftRecipient, setGiftRecipient] = useState('Her');
  const [giftOccasion, setGiftOccasion] = useState('Birthday');
  const [giftBudget, setGiftBudget] = useState('Under Rs 499');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const enableMotion = mounted && !shouldReduceMotion;
  const router = useRouter();

  // Hide the mobile marketing CTA while the checkout modal is open.
  useEffect(() => {
    setMounted(true);

    const handleCheckout = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail;
      setCheckoutOpen(Boolean(detail?.open));
    };
    window.addEventListener('quickwish:checkout', handleCheckout);
    return () => window.removeEventListener('quickwish:checkout', handleCheckout);
  }, []);

  const shoppingCategories = [
    {
      name: 'Gift Hampers',
      filterCategory: 'Personalized Gifts',
      tag: 'Handmade',
      count: '25+ Hampers Available',
      cta: 'Shop Now',
      image: 'https://images.pexels.com/photos/30632274/pexels-photo-30632274.png',
      icon: Gift,
      tint: 'bg-[color:var(--tint-peach)]'
    },
    {
      name: 'Handmade Flower Bouquets',
      filterCategory: 'Flower Bouquets',
      tag: 'Fresh Picks',
      count: '18+ Bouquets Available',
      cta: 'Explore Gifts',
      image: 'https://images.pexels.com/photos/27094493/pexels-photo-27094493.jpeg',
      icon: Flower2,
      tint: 'bg-[color:var(--tint-blush)]'
    },
    {
      name: 'Crochet Bouquets',
      filterCategory: 'Crochet Bouquets',
      tag: 'Keepsake',
      count: '12+ Crochet Gifts',
      cta: 'Explore Gifts',
      image: 'https://images.pexels.com/photos/10720839/pexels-photo-10720839.jpeg',
      icon: Sparkles,
      tint: 'bg-[color:var(--tint-mint)]'
    },
    {
      name: 'Custom Gifts',
      filterCategory: 'Personalized Gifts',
      tag: 'Made for them',
      count: '20+ Custom Ideas',
      cta: 'Explore Collection',
      image: 'https://images.pexels.com/photos/19027765/pexels-photo-19027765.jpeg',
      icon: Palette,
      tint: 'bg-[color:var(--tint-lavender)]'
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
      tone: 'bg-[color:var(--tint-peach)]',
    },
    {
      title: 'Custom Hampers',
      subtitle: 'Build a gift around their story.',
      category: 'Personalized Gifts',
      badge: 'Handmade',
      image: 'https://images.pexels.com/photos/30632274/pexels-photo-30632274.png',
      tone: 'bg-[color:var(--tint-lavender)]',
    },
    {
      title: 'Flowers + Cake Combos',
      subtitle: 'Birthday before midnight?',
      category: 'Birthday',
      badge: 'Same day',
      image: 'https://images.pexels.com/photos/27094493/pexels-photo-27094493.jpeg',
      tone: 'bg-[color:var(--tint-mint)]',
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
      recipient: 'for-her',
      image: 'https://plus.unsplash.com/premium_photo-1665218521187-bf1f98f1fd2e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDZ8fHxlbnwwfHx8fHw%3D',
      tint: 'bg-[color:var(--tint-rose)]',
    },
    {
      label: '🎁 For Him',
      category: 'Watches',
      recipient: 'for-him',
      image: 'https://images.unsplash.com/photo-1625552187571-7ee60ac43d2b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGdpZnQlMjBib3h8ZW58MHx8MHx8fDA%3D',
      tint: 'bg-[color:var(--tint-lavender)]',
    },
    {
      label: '🌸 For Mom',
      category: 'Flower Bouquets',
      recipient: 'for-mom',
      image: 'https://plus.unsplash.com/premium_photo-1697910940818-adb36cdfa4e7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z2lmdCUyMGZvciUyMGZyaWVuZHN8ZW58MHx8MHx8fDA%3D',
      tint: 'bg-[color:var(--tint-peach)]',
    },
    {
      label: '🤝 For Friends',
      category: 'besti',
      recipient: 'for-friends',
      image: 'https://plus.unsplash.com/premium_photo-1692845743671-dbfc435c6739?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDIzfHx8ZW58MHx8fHx8',
      tint: 'bg-[color:var(--tint-cream)]',
    },
    {
      label: '💕 For Couples',
      category: 'Anniversary',
      recipient: 'for-couples',
      image: 'https://plus.unsplash.com/premium_photo-1691688119414-df74cb70b962?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1pbi1zYW1lLXNlcmllc3wxfHx8ZW58MHx8fHx8',
      tint: 'bg-[color:var(--tint-blush)]',
    },
    {
      label: '🎈 For Kids',
      category: 'Teddy Bears',
      recipient: 'for-kids',
      image: 'https://media.istockphoto.com/id/1066672498/photo/kids-wrapping-christmas-gifts.webp?a=1&b=1&s=612x612&w=0&k=20&c=Cwlc_RZW1vtLVBdMGwGQ-S0rsvdvklKQQuWJxn3MTpU=',
      tint: 'bg-[color:var(--tint-mint)]',
    },
  ];

  const giftFinderRecipients = [
    { label: 'Her', category: 'Jewelry' },
    { label: 'Him', category: 'Flower Bouquets' },
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

  return (
    <div className="min-h-screen bg-[color:var(--ivory)] pb-[calc(var(--mobile-bottom-cta-height)+env(safe-area-inset-bottom)+24px)] md:pb-0">
      <TopBar />
      <Header />

      <HeroCarousel slides={heroSlides} />

      <section className="bg-[color:var(--tint-cream)] px-4 py-4">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2 shadow-sm min-[420px]:grid-cols-2 md:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 rounded-lg px-3 py-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--tint-peach)] text-[color:var(--wine)]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold text-[color:var(--plum)] sm:text-sm">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[color:var(--tint-cream)] px-4 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[color:var(--plum)] sm:text-3xl lux-serif">🎁 Who Are You Shopping For?</h2>
            <p className="text-sm text-[color:var(--muted)]">Find the perfect gift for every special person in your life.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 md:grid-cols-6">
            {relationshipCards.map((item) => (
              <motion.button
                key={item.label}
                className={`group overflow-hidden rounded-lg border border-[color:var(--border)] ${item.tint} text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
                onClick={() => router.push('/products')}
                whileHover={enableMotion ? { y: -4, scale: 1.015 } : undefined}
                whileTap={enableMotion ? { scale: 0.98 } : undefined}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div className="relative overflow-hidden">
                  <img src={item.image} alt={item.label} className="h-28 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-36" loading="lazy" />
                  <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--surface)]/95 text-[color:var(--wine)] opacity-0 shadow-sm transition group-hover:translate-x-0.5 group-hover:opacity-100">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-black text-[color:var(--plum)]">{item.label}</p>
                  <p className="mt-1 inline-flex items-center text-xs font-bold text-[color:var(--wine)]">
                    Explore Gifts
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--ivory)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold lux-serif text-[color:var(--plum)]">
                Main Product Categories
              </h3>
              <p className="text-sm text-[color:var(--muted)]">
                Choose what kind of surprise you want to send, then make it feel personal.
              </p>
            </div>
            <span className="hidden sm:inline rounded-full bg-[color:var(--tint-peach)] px-3 py-1 text-xs font-semibold text-[color:var(--wine)]">Indore delivery ready</span>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {shoppingCategories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.name}
                  className={`group cursor-pointer overflow-hidden rounded-lg border border-[color:var(--border)] ${category.tint} shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.99]`}
                  onClick={() => router.push('/products')}
                  whileHover={enableMotion ? { y: -3 } : undefined}
                  whileTap={enableMotion ? { scale: 0.99 } : undefined}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push('/products');
                    }
                  }}
                >
                  <div className="relative">
                  <img
                    src={category.image}
                    alt={category.name}
                      className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-56"
                  />
                    <span className="absolute left-3 top-3 rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs font-bold text-[color:var(--wine)] shadow-sm">
                      {category.tag}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <h4 className="text-sm font-bold text-[color:var(--plum)] sm:text-base">{category.name}</h4>
                      <p className="mt-0.5 text-xs font-semibold text-[color:var(--muted)]">{category.count}</p>
                      <span className="mt-2 inline-flex items-center rounded-full bg-[color:var(--wine)] px-3 py-1.5 text-xs font-bold text-[color:var(--ivory)] shadow-sm transition group-hover:bg-[#3b182f] group-hover:shadow-md group-active:scale-[0.98]">
                        {category.cta}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--wine)] shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <div
              className="col-span-1 cursor-pointer rounded-lg border border-[color:var(--gold)]/50 bg-[color:var(--tint-cream)] px-4 py-3 text-center shadow-sm transition hover:shadow-md min-[420px]:col-span-2 lg:col-span-4"
              onClick={() => router.push('/products')}
            >
              <span className="text-sm font-bold text-[color:var(--wine)]">Explore all gifts and offers</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--tint-cream)] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[color:var(--plum)] sm:text-3xl lux-serif">Featured Collections</h2>
              <p className="text-sm text-[color:var(--muted)]">Sweet little picks for birthdays, anniversaries, friendships, and last-minute surprises.</p>
            </div>
            <span className="hidden rounded-full bg-[color:var(--wine)] px-3 py-1 text-xs font-semibold text-[color:var(--ivory)] sm:inline-flex">
              Offers live today
            </span>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
            {campaignCards.map((card, index) => (
              <motion.button
                key={card.title}
                className={`group overflow-hidden rounded-lg border border-[color:var(--border)] ${card.tone} text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
                onClick={() => router.push('/products')}
                initial={enableMotion ? { opacity: 0, y: 14 } : false}
                whileInView={enableMotion ? { opacity: 1, y: 0 } : undefined}
                viewport={{ once: true, margin: '-80px' }}
                whileHover={enableMotion ? { y: -3 } : undefined}
                whileTap={enableMotion ? { scale: 0.99 } : undefined}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <div className={index === 0 ? 'grid gap-3 sm:grid-cols-[0.9fr_1.1fr]' : ''}>
                  <div className="p-4">
                    <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs font-bold text-[color:var(--wine)] shadow-sm">
                      {card.badge}
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-[color:var(--plum)]">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{card.subtitle}</p>
                    <p className="mt-5 inline-flex items-center text-sm font-bold text-[color:var(--wine)]">
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
                onClick={() => router.push('/products')}
                whileHover={enableMotion ? { y: -3 } : undefined}
                whileTap={enableMotion ? { scale: 0.99 } : undefined}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--tint-peach)] text-[color:var(--wine)]">
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
        className="bg-[color:var(--ivory)]"
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
            <span className="rounded-full bg-[color:var(--tint-peach)] px-3 py-1 text-xs font-bold text-[color:var(--wine)]">High-touch gifting</span>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold text-[color:var(--ivory)] sm:text-4xl lux-serif">
              Build a custom hamper around their story.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#d8c9d0]">
              Choose sweets, flowers, keepsakes, notes, and wrapping. We hand-finish every detail so the gift feels deeply personal.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <motion.button
                className="rounded-full bg-[#c9a36a] px-6 py-3 text-sm font-bold text-[color:var(--plum)]"
                onClick={() => router.push('/products')}
                whileHover={enableMotion ? { scale: 1.015 } : undefined}
                whileTap={enableMotion ? { scale: 0.98 } : undefined}
              >
                Build Your Custom Hamper
              </motion.button>
              <a
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-[color:var(--ivory)]"
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
      <section className="bg-[color:var(--tint-cream)] px-4 py-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-[color:var(--plum)] sm:text-3xl lux-serif">
              Why Customers Love QuickWish
            </h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
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
                <div key={item.label} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--tint-cream)] p-3.5">
                  <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--tint-peach)] text-[color:var(--wine)]">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <p className="text-sm font-bold text-[color:var(--plum)]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="bg-[color:var(--ivory)] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[color:var(--plum)] sm:text-3xl lux-serif">FAQ</h2>
            <p className="text-sm text-[color:var(--muted)]">Quick answers before you send a surprise.</p>
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
              <div key={item.question} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm">
                <h3 className="text-sm font-black text-[color:var(--plum)]">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {false && <NewsletterSection />}
      <Footer />
      {!checkoutOpen && (
        <div className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 px-4 pb-[env(safe-area-inset-bottom)] pt-3 shadow-[0_-12px_30px_rgba(43,29,37,0.12)] backdrop-blur md:hidden">
          <motion.button
            className="w-full rounded-full bg-[color:var(--wine)] px-5 py-3 text-sm font-bold text-[color:var(--ivory)]"
            onClick={() => router.push('/products')}
            whileTap={enableMotion ? { scale: 0.98 } : undefined}
          >
            Send Today in Indore
          </motion.button>
        </div>
      )}
    </div>
  );
}
