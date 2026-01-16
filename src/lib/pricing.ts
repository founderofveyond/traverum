import type { Experience, ExperienceSession } from './supabase/types'

export interface PriceCalculation {
  basePrice: number
  extraPersonFee: number
  totalPrice: number
  includedParticipants: number
  extraParticipants: number
  pricePerPerson: number | null
}

/**
 * Calculate total price based on experience pricing and participants
 * 
 * Pricing types:
 * - 'per_person': price_cents per participant
 * - 'per_group': base_price_cents for included_participants, extra_person_cents for additional
 * - 'fixed': fixed price regardless of participants
 */
export function calculatePrice(
  experience: Pick<Experience, 'pricing_type' | 'price_cents' | 'base_price_cents' | 'extra_person_cents' | 'included_participants'>,
  participants: number,
  session?: Pick<ExperienceSession, 'price_override_cents'> | null
): PriceCalculation {
  const basePriceCents = session?.price_override_cents || experience.price_cents
  
  switch (experience.pricing_type) {
    case 'per_person':
      return {
        basePrice: basePriceCents * participants,
        extraPersonFee: 0,
        totalPrice: basePriceCents * participants,
        includedParticipants: participants,
        extraParticipants: 0,
        pricePerPerson: basePriceCents,
      }
    
    case 'per_group':
      const extraParticipants = Math.max(0, participants - experience.included_participants)
      const extraFee = extraParticipants * experience.extra_person_cents
      return {
        basePrice: experience.base_price_cents,
        extraPersonFee: extraFee,
        totalPrice: experience.base_price_cents + extraFee,
        includedParticipants: experience.included_participants,
        extraParticipants,
        pricePerPerson: null,
      }
    
    case 'fixed':
    default:
      return {
        basePrice: basePriceCents,
        extraPersonFee: 0,
        totalPrice: basePriceCents,
        includedParticipants: participants,
        extraParticipants: 0,
        pricePerPerson: null,
      }
  }
}

/**
 * Get price display text for experience card
 */
export function getPriceDisplay(experience: Pick<Experience, 'pricing_type' | 'price_cents' | 'currency'>): {
  amount: number
  suffix: string
} {
  switch (experience.pricing_type) {
    case 'per_person':
      return { amount: experience.price_cents, suffix: ' / person' }
    case 'per_group':
      return { amount: experience.price_cents, suffix: ' / group' }
    case 'fixed':
    default:
      return { amount: experience.price_cents, suffix: '' }
  }
}
