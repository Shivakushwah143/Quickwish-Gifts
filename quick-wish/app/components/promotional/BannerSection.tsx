'use client';

import { useEffect, useMemo, useState } from 'react';
import { promotionalBanners } from '../../data/promotionalBanners';
import {
  fetchUnsplashBannerImage,
  getCachedBannerImage,
} from '../../services/unsplashImageService';
import type { BannerImage, PromotionalBanner } from '../../types/banner';
import BannerCard from './BannerCard';

type BannerSectionVariant = 'hero' | 'inline' | 'checkout';

type BannerSectionProps = {
  bannerIds?: string[];
  banners?: PromotionalBanner[];
  variant?: BannerSectionVariant;
  className?: string;
  title?: string;
  subtitle?: string;
};

type BannerState = {
  banner: PromotionalBanner;
  image: BannerImage;
  loading: boolean;
};

const getSectionBanners = (
  bannerIds: string[] | undefined,
  banners: PromotionalBanner[] | undefined
) => {
  if (banners) {
    return banners;
  }

  if (!bannerIds || bannerIds.length === 0) {
    return promotionalBanners;
  }

  return promotionalBanners.filter((banner) => bannerIds.includes(banner.id));
};

export default function BannerSection({
  bannerIds,
  banners,
  variant = 'inline',
  className = '',
  title,
  subtitle,
}: BannerSectionProps) {
  const bannerIdsKey = bannerIds?.join('|') ?? '';
  const selectedBanners = useMemo(
    () => getSectionBanners(bannerIds, banners),
    [bannerIdsKey, banners]
  );
  const [bannerStates, setBannerStates] = useState<BannerState[]>(
    selectedBanners.map((banner) => ({
      banner,
      image: getCachedBannerImage(banner),
      loading: true,
    }))
  );

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      const loadedStates: BannerState[] = [];

      for (const banner of selectedBanners) {
        const image = await fetchUnsplashBannerImage(banner);
        loadedStates.push({
          banner,
          image,
          loading: false,
        });
      }

      if (isMounted) {
        setBannerStates(loadedStates);
      }
    };

    setBannerStates(
      selectedBanners.map((banner) => ({
        banner,
        image: getCachedBannerImage(banner),
        loading: true,
      }))
    );
    void loadImages();

    return () => {
      isMounted = false;
    };
  }, [selectedBanners]);

  if (bannerStates.length === 0) {
    return null;
  }

  const isHero = variant === 'hero';
  const isCheckout = variant === 'checkout';
  const hasSingleBanner = bannerStates.length === 1;

  return (
    <section
      className={`${isCheckout ? 'p-0' : 'px-4 py-8'} ${className}`}
      aria-label={title || 'Promotional banners'}
    >
      <div className={isCheckout ? 'w-full' : 'mx-auto max-w-7xl'}>
        {(title || subtitle) && !isCheckout && (
          <div className="mb-5">
            {title && (
              <h2 className="text-2xl font-semibold text-[color:var(--plum)] sm:text-3xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 max-w-2xl text-sm text-[color:var(--muted)]">{subtitle}</p>
            )}
          </div>
        )}

        <div
          className={
            isHero
              ? 'grid grid-cols-1 gap-4'
              : isCheckout
                ? 'grid grid-cols-1 gap-3'
                : hasSingleBanner
                  ? 'grid grid-cols-1 gap-4'
                  : 'grid grid-cols-1 gap-4 md:grid-cols-2'
          }
        >
          {bannerStates.map(({ banner, image, loading }, index) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              image={image}
              loading={loading}
              compact={!isHero}
              priority={index === 0 && isHero}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
