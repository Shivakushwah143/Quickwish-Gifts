import type { PromotionalBanner } from '../types/banner';

export const promotionalBanners: PromotionalBanner[] = [
  {
    id: 'hero-premium-gifts',
    title: 'Sun, Fun & Surprises',
    subtitle: "Summer's best gifts are here",
    startingPrice: 199,
    eyebrow: 'Summer edit',
    ctaLabel: 'Shop summer',
    ctaHref: '/products?category=Birthday',
    query: 'summer',
    fallbackImage:
      'https://www.fnp.com/assets/images/custom/flowers_24/price/bg-25-9-24.jpg',
    fallbackAlt: 'Sunny beach with blue water for a summer gifting offer',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=420&q=80',
        alt: 'Colorful wrapped gift for a summer surprise',
      },
      {
        url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=420&q=80',
        alt: 'Bright birthday cake with candles',
      },
      {
        url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=420&q=80',
        alt: 'Fresh cheerful flowers for gifting',
      },
    ],
    tone: 'gold',
  },
  {
    id: 'mid-fresh-flowers',
    title: 'Flowers That Feel Fresh',
    subtitle: 'Soft bouquets arranged for same-day smiles',
    startingPrice: 349,
    eyebrow: 'Fresh arrival',
    ctaLabel: 'Explore flowers',
    ctaHref: '/products?category=Fresh%20Flowers',
    query: 'flowers',
    fallbackImage:
      'https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=1400&q=85',
    fallbackAlt: 'Fresh flower bouquet with soft natural light',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=420&q=80',
        alt: 'Rose bouquet wrapped for gifting',
      },
      {
        url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=420&q=80',
        alt: 'Colorful mixed flowers in bloom',
      },
      {
        url: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=420&q=80',
        alt: 'Pink flower bouquet close up',
      },
    ],
    tone: 'garden',
  },
  {
    id: 'checkout-birthday-surprise',
    title: 'Add Birthday Magic',
    subtitle: 'Pair this gift with cakes, flowers, or a note',
    startingPrice: 499,
    eyebrow: 'Last-minute delight',
    ctaLabel: 'View add-ons',
    ctaHref: '/products?category=Birthday',
    query: 'birthday',
    fallbackImage:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=85',
    fallbackAlt: 'Birthday celebration with cake and balloons',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=420&q=80',
        alt: 'Chocolate cake birthday add-on',
      },
      {
        url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=420&q=80',
        alt: 'Wrapped birthday gift box',
      },
      {
        url: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=420&q=80',
        alt: 'Birthday surprise balloons',
      },
    ],
    tone: 'rose',
  },
];

export const getPromotionalBannerById = (id: string) =>
  promotionalBanners.find((banner) => banner.id === id);
