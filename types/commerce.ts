/**
 * TypeScript Interfaces for High-Throughput GCC E-commerce
 * Next.js 15+ & Supabase Stack
 */

export type GCCCountryCode = 'SA' | 'AE';
export type GCCCurrencyCode = 'SAR' | 'AED';

export interface LocalizedString {
  en: string;
  ar: string;
}

/**
 * GCC Regional Pricing Schema for database JSONB and Next.js integration
 */
export interface CountryPricingDetail {
  currency: GCCCurrencyCode;
  price: number;
  compareAtPrice?: number;
  vatRate: number; // e.g. 0.15 for KSA, 0.05 for UAE
  isVatInclusive: boolean;
  formattedPrice: {
    en: string;
    ar: string;
  };
  shippingFee: number;
  freeShippingThreshold?: number;
}

export interface RegionalPricing {
  SA: CountryPricingDetail;
  AE: CountryPricingDetail;
}

/**
 * Supported Dynamic Landing Components in our Component Registry
 */
export type DynamicComponentType =
  | 'HeroCarousel'
  | 'ProductGrid'
  | 'InfluencerBanner'
  | 'PromoGrid'
  | 'NewsletterSubscribe';

export interface BaseComponentProps {
  id: string;
  isActive: boolean;
  spacingMarginBottom?: number; // micro-spacing controls
}

export interface HeroCarouselItem {
  desktopImageUrl: string;
  mobileImageUrl: string;
  title: LocalizedString;
  subtitle?: LocalizedString;
  ctaText?: LocalizedString;
  ctaUrl?: string;
  overlayOpacity?: number; // 0 to 1
}

export interface HeroCarouselProps extends BaseComponentProps {
  type: 'HeroCarousel';
  items: HeroCarouselItem[];
  autoplaySpeedMs?: number;
  enableDots?: boolean;
}

export interface ProductGridProps extends BaseComponentProps {
  type: 'ProductGrid';
  title: LocalizedString;
  categorySlug: string;
  limit: number;
  columnsDesktop: number; // e.g. 4
  columnsMobile: number;  // e.g. 2
  sortBy: 'price_asc' | 'price_desc' | 'latest' | 'best_seller';
  showAddToCart: boolean;
}

export interface InfluencerBannerProps extends BaseComponentProps {
  type: 'InfluencerBanner';
  influencerName: string;
  influencerAvatarUrl: string;
  quote: LocalizedString;
  discountCode: string;
  discountValuePercent: number;
  accentColorHex?: string;
  curatedProductIds: string[]; // UUID list
}

export interface PromoBanner {
  imageUrl: string;
  title?: LocalizedString;
  description?: LocalizedString;
  targetUrl: string;
  colSpanDesktop: number; // out of 12 for grid
  colSpanMobile: number;  // out of 12 for grid
}

export interface PromoGridProps extends BaseComponentProps {
  type: 'PromoGrid';
  banners: PromoBanner[];
  countdownTimer?: {
    endsAt: string; // ISO-8601 string
    title: LocalizedString;
  };
}

export interface NewsletterSubscribeProps extends BaseComponentProps {
  type: 'NewsletterSubscribe';
  title: LocalizedString;
  description: LocalizedString;
  placeholderText: LocalizedString;
  buttonText: LocalizedString;
  successMessage: LocalizedString;
  tags?: string[];
}

export type DynamicComponentConfiguration =
  | HeroCarouselProps
  | ProductGridProps
  | InfluencerBannerProps
  | PromoGridProps
  | NewsletterSubscribeProps;

/**
 * Core JSONB field 'landing_configuration' stored in category/landing table
 */
export interface LandingConfiguration {
  metaTitle: LocalizedString;
  metaDescription: LocalizedString;
  theme: {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
  };
  components: DynamicComponentConfiguration[];
}
