import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { calculateTotalPrice, type PricingConfig, type PricingType } from '@/lib/pricing';

interface BookingState {
  experienceSlug: string;
  experienceTitle: string;
  sessionId: string | null;
  sessionDate: string;
  sessionTime: string;
  participants: number;
  isCustomRequest: boolean;
  customDate: string;
  customTime: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  referenceNumber: string;
  // Pricing fields
  pricingType: PricingType;
  basePriceCents: number;
  extraPersonCents: number;
  includedParticipants: number;
  minParticipants: number;
  maxParticipants: number;
  sessionPriceOverrideCents: number | null;
}

interface BookingContextType {
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
  resetBooking: () => void;
  totalCents: number;
  priceBreakdown: string;
  effectiveParticipants: number;
}

const initialBookingState: BookingState = {
  experienceSlug: '',
  experienceTitle: '',
  sessionId: null,
  sessionDate: '',
  sessionTime: '',
  participants: 2,
  isCustomRequest: true, // Request-first flow: default to custom request
  customDate: '',
  customTime: '',
  guestFirstName: '',
  guestLastName: '',
  guestEmail: '',
  guestPhone: '',
  referenceNumber: '',
  // Pricing defaults
  pricingType: 'per_person',
  basePriceCents: 0,
  extraPersonCents: 0,
  includedParticipants: 0,
  minParticipants: 1,
  maxParticipants: 10,
  sessionPriceOverrideCents: null,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [booking, setBooking] = useState<BookingState>(initialBookingState);

  const resetBooking = () => {
    setBooking(initialBookingState);
  };

  const priceResult = useMemo(() => {
    const pricing: PricingConfig = {
      pricingType: booking.pricingType,
      basePriceCents: booking.basePriceCents,
      extraPersonCents: booking.extraPersonCents,
      includedParticipants: booking.includedParticipants,
      minParticipants: booking.minParticipants,
      maxParticipants: booking.maxParticipants,
    };
    return calculateTotalPrice(booking.participants, pricing, booking.sessionPriceOverrideCents);
  }, [
    booking.participants,
    booking.pricingType,
    booking.basePriceCents,
    booking.extraPersonCents,
    booking.includedParticipants,
    booking.minParticipants,
    booking.maxParticipants,
    booking.sessionPriceOverrideCents,
  ]);

  return (
    <BookingContext.Provider value={{ 
      booking, 
      setBooking, 
      resetBooking, 
      totalCents: priceResult.totalCents,
      priceBreakdown: priceResult.breakdown,
      effectiveParticipants: priceResult.effectiveParticipants,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Generate a random reference number
export const generateReferenceNumber = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TRV-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
