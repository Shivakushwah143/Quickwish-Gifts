import type { BannerImage, PromotionalBanner } from '../types/banner';

type UnsplashPhotoResponse = {
  alt_description: string | null;
  urls: {
    regular: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
};

type UnsplashSearchResponse = {
  results: UnsplashPhotoResponse[];
};

type CachedBannerImage = BannerImage & {
  expiresAt: number;
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const memoryCache = new Map<string, CachedBannerImage>();

const getCacheKey = (banner: PromotionalBanner) => `quickwish-banner:${banner.query}`;

const toFallbackImage = (banner: PromotionalBanner): BannerImage => ({
  url: banner.fallbackImage,
  alt: banner.fallbackAlt,
  source: 'fallback',
});

const readLocalCache = (cacheKey: string): CachedBannerImage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(cacheKey);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as CachedBannerImage;
    if (parsedValue.expiresAt > Date.now()) {
      return parsedValue;
    }
  } catch {
    window.localStorage.removeItem(cacheKey);
  }

  return null;
};

const writeLocalCache = (cacheKey: string, image: CachedBannerImage) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(cacheKey, JSON.stringify(image));
};

export const getCachedBannerImage = (banner: PromotionalBanner): BannerImage => {
  const cacheKey = getCacheKey(banner);
  const memoryValue = memoryCache.get(cacheKey);

  if (memoryValue && memoryValue.expiresAt > Date.now()) {
    return memoryValue;
  }

  const localValue = readLocalCache(cacheKey);
  if (localValue) {
    memoryCache.set(cacheKey, localValue);
    return localValue;
  }

  return toFallbackImage(banner);
};

export const fetchUnsplashBannerImage = async (
  banner: PromotionalBanner
): Promise<BannerImage> => {
  const cacheKey = getCacheKey(banner);
  const cachedImage = getCachedBannerImage(banner);

  if (cachedImage.source === 'unsplash') {
    return cachedImage;
  }

  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return cachedImage;
  }

  try {
    const searchParams = new URLSearchParams({
      query: banner.query,
      orientation: 'landscape',
      per_page: '8',
      content_filter: 'high',
      client_id: accessKey,
    });

    const response = await fetch(`https://api.unsplash.com/search/photos?${searchParams.toString()}`);
    if (!response.ok) {
      return cachedImage;
    }

    const data = (await response.json()) as UnsplashSearchResponse;
    const photo = data.results[0];

    if (!photo) {
      return cachedImage;
    }

    const image: CachedBannerImage = {
      url: photo.urls.regular,
      alt: photo.alt_description || banner.fallbackAlt,
      source: 'unsplash',
      photographerName: photo.user.name,
      photographerUrl: photo.user.links.html,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    memoryCache.set(cacheKey, image);
    writeLocalCache(cacheKey, image);

    return image;
  } catch {
    return cachedImage;
  }
};
