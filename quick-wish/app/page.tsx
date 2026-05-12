

"use client"

import {
  birthdayGifts,
  heroSlides,
  relationshipCategories,
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
import { Cake, Gift, Heart, Palette } from 'lucide-react';

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const shoppingCategories = [
    {
      name: 'Birthday Hampers',
      tag: 'Under ₹499',
      image: 'https://images.pexels.com/photos/7600330/pexels-photo-7600330.jpeg',
      icon: Cake,
      tint: 'bg-[#fff0d8]'
    },
    {
      name: 'Couple Gifts',
      tag: 'Most Loved',
      image: 'https://images.pexels.com/photos/27176174/pexels-photo-27176174.jpeg',
      icon: Heart,
      tint: 'bg-[#ffe9ef]'
    },
    {
      name: 'Friendship Gifts',
      tag: 'Trending',
      image: 'https://media.istockphoto.com/id/2233779247/photo/group-of-young-indian-friends-holding-shopping-bags-isolated-on-white-background-discount-and.jpg?b=1&s=612x612&w=0&k=20&c=Emy0zVT1Ymk9YhizNVjBa7qXel5fVNzShHD7plnaLZ4=',
      icon: Gift,
      tint: 'bg-[#e9f7f0]'
    },
    {
      name: 'Custom Hampers',
      tag: '60% OFF',
      image: 'https://images.pexels.com/photos/10720839/pexels-photo-10720839.jpeg',
      icon: Palette,
      tint: 'bg-[#f0edff]'
    }
  ];

  useEffect(() => {
    // Check if user is an admin (you can customize this logic)
    const adminToken = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');

    // Set to true only if admin credentials are present
    setIsAdmin(!!adminToken || userRole === 'admin');
  }, []);

  return (
    <div className="min-h-screen bg-[color:var(--ivory)]">
      <TopBar />
      <Header />

      {/* Conditionally render AdminDashboard only for admin users */}
      {isAdmin && <AdminDashboard />}

      <HeroCarousel slides={heroSlides} />

      <section className="bg-[#f8f3ec] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold lux-serif text-[#2b1d25]">
                Shop by gift moment
              </h3>
              <p className="text-sm text-[#6f5d66]">
                Clear choices, quick prices, and the right emotion in one tap.
              </p>
            </div>
            <span className="hidden sm:inline rounded-full bg-[#fff4e4] px-3 py-1 text-xs font-semibold text-[#8b3f2f]">Indore delivery ready</span>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {shoppingCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.name}
                  className={`group cursor-pointer overflow-hidden rounded-lg border border-[color:var(--border)] ${category.tint} shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg`}
                  onClick={() => router.push(`/products?category=${encodeURIComponent(category.name)}`)}
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
                      <p className="text-xs text-[#6f5d66]">Tap to explore</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#4a1f3b] shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              );
            })}
            <div
              className="col-span-2 cursor-pointer rounded-lg border border-[#f0d1bd] bg-[#fff8ed] px-4 py-3 text-center shadow-sm transition hover:shadow-md lg:col-span-4"
              onClick={() => router.push('/products')}
            >
              <span className="text-sm font-bold text-[color:var(--wine)]">Explore all gifts and offers</span>
            </div>
          </div>
        </div>
      </section>

      <ProductSection title="Best Sellers" />
      <ServicesSection />
      <CategorySection
        title="Same-Day Surprises"
        categories={sameDayGifts}
        containerId="sameday-slider"
      />
      <CategorySection
        title="For Every Bond"
        categories={relationshipCategories}
        containerId="relationship-slider"
      />
      <CategorySection
        title="Birthday, Beautifully"
        categories={birthdayGifts}
        containerId="birthday-slider"
        showArrows={false}
      />
      <Testimonials />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
