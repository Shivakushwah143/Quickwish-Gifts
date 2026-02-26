

"use client"

import {
  birthdayGifts,
  cakeCategories,
  girlsFashion,
  heroSlides,
  homeGifts,
  mainCategories,
  occasions,
  personalizedGifts,
  plantCategories,
  popularGifting,
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

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

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

      {/* Main Categories */}
    
      {/* Main Categories */}
      <section className="bg-[color:var(--ivory)] py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold lux-serif text-[color:var(--plum)]">
                Begin with a feeling
              </h3>
              <p className="text-sm text-[color:var(--muted)]">
                Curated starting points for thoughtful gifting.
              </p>
            </div>
            <span className="hidden sm:inline lux-pill px-3 py-1 text-xs">Indore delivery ready</span>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2 hide-scrollbar">
            {mainCategories.map((category) => (
              <div
                key={category.id}
                className="flex-shrink-0 text-center w-20 sm:w-24 lg:w-28 cursor-pointer group"
                onClick={() => router.push(`/products?category=${encodeURIComponent(category.name)}`)}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden mb-2 mx-auto border border-[color:var(--border)] shadow-sm">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-medium text-[color:var(--plum)]/80 block">{category.name}</span>
              </div>
            ))}
            <div
              className="flex-shrink-0 text-center w-20 sm:w-24 lg:w-28 cursor-pointer"
              onClick={() => router.push('/products')}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-[color:var(--wine)] flex items-center justify-center mb-2 mx-auto shadow-sm">
                <span className="text-[color:var(--ivory)] text-sm font-semibold">more</span>
              </div>
              <span className="text-xs font-medium text-[color:var(--plum)]/80 block">More</span>
            </div>
          </div>
        </div>
      </section>
      <CategorySection
        title="For Every Bond"
        categories={relationshipCategories}
        containerId="relationship-slider"
        isRounded={true}
      />

      <CategorySection
        title="Cakes, Baked for Celebrations"
        categories={cakeCategories}
        containerId="cakes-slider"
      />

      <CategorySection
        title="Personalised Keepsakes"
        categories={personalizedGifts}
        containerId="personalized-slider"
      />

      <CategorySection
        title="Plants with Quiet Charm"
        categories={plantCategories}
        containerId="plants-slider"
      />

      <CategorySection
        title="Same-Day Surprises"
        categories={sameDayGifts}
        containerId="sameday-slider"
      />

      <CategorySection
        title="Home, Warmly Gifted"
        categories={homeGifts}
        containerId="home-slider"
        gridLayout={true}
        showArrows={false}
      />

      <CategorySection
        title="Birthday, Beautifully"
        categories={birthdayGifts}
        containerId="birthday-slider"
        showArrows={false}
      />

      <CategorySection
        title="Loved in Indore"
        categories={popularGifting}
        containerId="popular-slider"
        isRounded={true}
        showArrows={false}
      />

      <CategorySection
        title="Occasions, Refined"
        categories={occasions}
        containerId="occasions-slider"
        showArrows={false}
      />
      <CategorySection
        title="Style, Thoughtfully Chosen"
        categories={girlsFashion}
        containerId="fashion-slider"
        isRounded={false}
        showArrows={true}
      />
      <ProductSection title="Trending Gifts" />
      <ServicesSection />
      <Testimonials />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
