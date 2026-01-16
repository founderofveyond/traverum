export type PricingType = 'per_person' | 'flat_rate' | 'base_plus_extra';

export interface PricingConfig {
  pricingType: PricingType;
  basePriceCents: number;
  extraPersonCents: number;
  includedParticipants: number;
  minParticipants: number;
  maxParticipants: number;
}

export interface PriceResult {
  totalCents: number;
  breakdown: string;
  effectiveParticipants: number;
}

/**
 * Calculate total price based on pricing type and participants
 * 
 * 1. Per Person: total = extra_person_cents × participants
 * 2. Flat Rate: total = base_price_cents
 * 3. Base + Extra: total = base_price_cents + (max(0, participants - included_participants) × extra_person_cents)
 */
export function calculateTotalPrice(
  participants: number,
  pricing: PricingConfig,
  sessionPriceOverrideCents?: number | null
): PriceResult {
  // Session override takes precedence over all other pricing logic
  if (sessionPriceOverrideCents != null) {
    return {
      totalCents: sessionPriceOverrideCents,
      breakdown: `Session price: ${formatPrice(sessionPriceOverrideCents)}`,
      effectiveParticipants: participants
    };
  }

  // Enforce minimum participants
  const effectiveParticipants = Math.max(participants, pricing.minParticipants);

  switch (pricing.pricingType) {
    case 'per_person': {
      const totalCents = pricing.extraPersonCents * effectiveParticipants;
      const pricePerPerson = formatPrice(pricing.extraPersonCents);
      const breakdown = effectiveParticipants > participants
        ? `${pricePerPerson} × ${effectiveParticipants} (min. ${pricing.minParticipants}) = ${formatPrice(totalCents)}`
        : `${pricePerPerson} × ${effectiveParticipants} = ${formatPrice(totalCents)}`;
      return { totalCents, breakdown, effectiveParticipants };
    }

    case 'flat_rate': {
      return {
        totalCents: pricing.basePriceCents,
        breakdown: `Fixed price: ${formatPrice(pricing.basePriceCents)}`,
        effectiveParticipants
      };
    }

    case 'base_plus_extra': {
      const extraPeople = Math.max(0, effectiveParticipants - pricing.includedParticipants);
      const extraCents = extraPeople * pricing.extraPersonCents;
      const totalCents = pricing.basePriceCents + extraCents;

      let breakdown: string;
      if (extraPeople > 0) {
        breakdown = `${formatPrice(pricing.basePriceCents)} + (${extraPeople} × ${formatPrice(pricing.extraPersonCents)}) = ${formatPrice(totalCents)}`;
      } else {
        breakdown = `Base price for up to ${pricing.includedParticipants}: ${formatPrice(pricing.basePriceCents)}`;
      }

      return { totalCents, breakdown, effectiveParticipants };
    }

    default:
      // Fallback: treat as per_person
      const totalCents = pricing.extraPersonCents * effectiveParticipants;
      return {
        totalCents,
        breakdown: `${formatPrice(pricing.extraPersonCents)} × ${effectiveParticipants}`,
        effectiveParticipants
      };
  }
}

/**
 * Format cents to EUR string (e.g., 4000 -> "40€")
 */
export function formatPrice(cents: number): string {
  const euros = cents / 100;
  return euros % 1 === 0 ? `${euros}€` : `${euros.toFixed(2)}€`;
}

/**
 * Get a one-line pricing summary for display
 */
export function getPricingSummary(pricing: PricingConfig): string {
  switch (pricing.pricingType) {
    case 'per_person': {
      const priceStr = formatPrice(pricing.extraPersonCents);
      return pricing.minParticipants > 1
        ? `${priceStr} per person (min. ${pricing.minParticipants})`
        : `${priceStr} per person`;
    }

    case 'flat_rate': {
      return `${formatPrice(pricing.basePriceCents)} total`;
    }

    case 'base_plus_extra': {
      return `${formatPrice(pricing.basePriceCents)} for ${pricing.includedParticipants}, +${formatPrice(pricing.extraPersonCents)} extra`;
    }

    default:
      return formatPrice(pricing.extraPersonCents);
  }
}

/**
 * Get price examples for preview table
 */
export function getPriceExamples(pricing: PricingConfig): { participants: number; price: string }[] {
  const examples: { participants: number; price: string }[] = [];
  const sampleSizes = [1, 2, 4, 6, 8, 10].filter(n => 
    n >= pricing.minParticipants && n <= pricing.maxParticipants
  );

  for (const participants of sampleSizes.slice(0, 4)) {
    const result = calculateTotalPrice(participants, pricing);
    examples.push({ participants, price: formatPrice(result.totalCents) });
  }

  return examples;
}

/**
 * Get the display price for cards/headers (the "starting from" price)
 */
export function getDisplayPrice(pricing: PricingConfig): { price: string; suffix: string } {
  switch (pricing.pricingType) {
    case 'per_person':
      return { 
        price: formatPrice(pricing.extraPersonCents), 
        suffix: '/ person' 
      };

    case 'flat_rate':
      return { 
        price: formatPrice(pricing.basePriceCents), 
        suffix: 'total' 
      };

    case 'base_plus_extra':
      return { 
        price: formatPrice(pricing.basePriceCents), 
        suffix: `for ${pricing.includedParticipants}` 
      };

    default:
      return { price: formatPrice(pricing.extraPersonCents), suffix: '' };
  }
}
