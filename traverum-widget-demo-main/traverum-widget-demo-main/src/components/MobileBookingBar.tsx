import type { Experience } from '@/types/experience';
import { getDisplayPrice } from '@/lib/pricing';

interface MobileBookingBarProps {
  experience: Experience;
  onReserveClick: () => void;
}

const MobileBookingBar = ({ experience, onReserveClick }: MobileBookingBarProps) => {
  const displayPrice = getDisplayPrice({
    pricingType: experience.pricingType,
    basePriceCents: experience.basePriceCents,
    extraPersonCents: experience.extraPersonCents,
    includedParticipants: experience.includedParticipants,
    minParticipants: experience.minParticipants,
    maxParticipants: experience.maxParticipants,
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between md:hidden z-40 safe-area-bottom">
      <div>
        <span className="font-bold text-foreground">{displayPrice.price}</span>
        <span className="text-muted-foreground ml-1">{displayPrice.suffix}</span>
      </div>
      <button
        onClick={onReserveClick}
        className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-button hover:bg-primary-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Reserve
      </button>
    </div>
  );
};

export default MobileBookingBar;
