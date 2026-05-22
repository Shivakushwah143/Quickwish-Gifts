export type UnsplashQuery = 'gifts' | 'flowers' | 'surprise' | 'birthday' | 'summer';

export type PromotionalBanner = {
  id: string;
  title: string;
  subtitle: string;
  startingPrice: number;
  eyebrow: string;
  ctaLabel: string;
  ctaHref: string;
  query: UnsplashQuery;
  fallbackImage: string;
  fallbackAlt: string;
  galleryImages: {
    url: string;
    alt: string;
  }[];
  tone: 'gold' | 'rose' | 'garden';
};

export type BannerImage = {
  url: string;
  alt: string;
  source: 'unsplash' | 'fallback';
  photographerName?: string;
  photographerUrl?: string;
};
