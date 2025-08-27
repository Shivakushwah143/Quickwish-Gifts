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



export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Header/>
      <AdminDashboard/>

      <HeroCarousel slides={heroSlides} />

      {/* Main Categories */}
      <section className="bg-white py-4 px-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {mainCategories.map((category) => (
            <div key={category.id} className="flex-shrink-0 text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-2 mx-auto border-2 border-pink-100">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-medium text-gray-700 block">{category.name}</span>
            </div>
          ))}
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-2 mx-auto">
              <span className="text-white text-sm font-bold">FNP</span>
            </div>
            <span className="text-xs font-medium text-gray-700 block">More</span>
          </div>
        </div>
      </section>

      <CategorySection
        title="For Every Relationship"
        categories={relationshipCategories}
        containerId="relationship-slider"
        isRounded={true}
      />

      <CategorySection
        title="Bakery-Fresh Cakes"
        categories={cakeCategories}
        containerId="cakes-slider"
      />

      <CategorySection
        title="Personalise Your Moments"
        categories={personalizedGifts}
        containerId="personalized-slider"
      />

      <CategorySection
        title="Plants For Every Vibe"
        categories={plantCategories}
        containerId="plants-slider"
      />

      <CategorySection
        title="Same Day Surprises"
        categories={sameDayGifts}
        containerId="sameday-slider"
      />

      <CategorySection
        title="Home & Living Gifts"
        categories={homeGifts}
        containerId="home-slider"
        gridLayout={true}
        showArrows={false}
      />

      <CategorySection
        title="Birthday Gifts That Wow"
        categories={birthdayGifts}
        containerId="birthday-slider"
        showArrows={false}
      />

      <CategorySection
        title="Popular In Gifting"
        categories={popularGifting}
        containerId="popular-slider"
        isRounded={true}
        showArrows={false}
      />

      <CategorySection
        title="Tailored For Your Occasions"
        categories={occasions}
        containerId="occasions-slider"
        showArrows={false}
      />
      <CategorySection
        title="Fashion for Girls"
        categories={girlsFashion}
        containerId="fashion-slider"
        isRounded={false}
        showArrows={true}
      />
      <ProductSection title="Trending Products" />
      <ServicesSection />
      <NewsletterSection />
      <Footer />

    </div>
  );
}