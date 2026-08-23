import type { Product } from "../types";

export type StorefrontHeroImage = {
  url: string;
  title?: string;
  subtitle?: string;
  enabled?: boolean;
  displayOrder?: number;
};

export type StorefrontSettings = {
  heroImages: StorefrontHeroImage[];
  featuredProductIds: string[];
  featuredProducts: Product[];
  checkoutOccasionBanner: {
    image: string;
    title: string;
    subtitle: string;
  };
  giftUpgradeImages: {
    wrapping: string;
    messageCard: string;
    ferrero: string;
  };
};

export const emptyStorefrontSettings: StorefrontSettings = {
  heroImages: [],
  featuredProductIds: [],
  featuredProducts: [],
  checkoutOccasionBanner: {
    image: "",
    title: "",
    subtitle: "",
  },
  giftUpgradeImages: {
    wrapping: "",
    messageCard: "",
    ferrero: "",
  },
};

export const fetchStorefrontSettings = async (): Promise<StorefrontSettings> => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) return emptyStorefrontSettings;

  const response = await fetch(`${apiBaseUrl}/storefront-settings`);
  if (!response.ok) return emptyStorefrontSettings;

  const data = await response.json();
  return data?.settings || emptyStorefrontSettings;
};
