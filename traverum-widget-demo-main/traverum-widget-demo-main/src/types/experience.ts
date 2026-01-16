import type { PricingType } from '@/lib/pricing';

export interface Experience {
  id: string;
  slug: string;
  title: string;
  duration: string;
  maxParticipants: number;
  minParticipants: number;
  image: string;
  images: string[];
  description: string;
  meetingPoint: string | null;
  pricingType: PricingType;
  basePriceCents: number;
  extraPersonCents: number;
  includedParticipants: number;
  allowsRequests: boolean;
  currency: string;
}

export interface Session {
  id: string;
  dateObj: Date;
  date: string;
  time: string;
  spotsLeft: number;
  spotsTotal: number;
  priceOverrideCents: number | null;
}
