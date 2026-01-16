import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SessionPicker from './SessionPicker';
import type { Experience, Session } from '@/types/experience';
import { useBooking } from '@/context/BookingContext';
import { getDisplayPrice, formatPrice } from '@/lib/pricing';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  experience: Experience;
  sessions: Session[];
}

const BottomSheet = ({
  isOpen,
  onClose,
  experience,
  sessions,
}: BottomSheetProps) => {
  const navigate = useNavigate();
  const { booking, setBooking, totalCents } = useBooking();

  const displayPrice = getDisplayPrice({
    pricingType: experience.pricingType,
    basePriceCents: experience.basePriceCents,
    extraPersonCents: experience.extraPersonCents,
    includedParticipants: experience.includedParticipants,
    minParticipants: experience.minParticipants,
    maxParticipants: experience.maxParticipants,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSessionSelect = (sessionId: string | null, isCustom: boolean) => {
    if (isCustom) {
      setBooking(prev => ({
        ...prev,
        sessionId: null,
        isCustomRequest: true,
        sessionDate: '',
        sessionTime: '',
        sessionPriceOverrideCents: null,
      }));
    } else {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setBooking(prev => ({
          ...prev,
          sessionId: session.id,
          isCustomRequest: false,
          sessionDate: session.date,
          sessionTime: session.time,
          customDate: '',
          customTime: '',
          sessionPriceOverrideCents: session.priceOverrideCents,
        }));
      }
    }
  };

  const handleCustomDateChange = (date: string) => {
    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }) : '';
    
    setBooking(prev => ({
      ...prev,
      customDate: date,
      sessionDate: formattedDate
    }));
  };

  const handleCustomTimeChange = (time: string) => {
    setBooking(prev => ({
      ...prev,
      customTime: time,
      sessionTime: time
    }));
  };

  const handleParticipantsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBooking(prev => ({
      ...prev,
      participants: parseInt(e.target.value)
    }));
  };

  const canContinue = booking.isCustomRequest 
    ? (booking.customDate && booking.customTime)
    : booking.sessionId;

  const handleContinue = () => {
    if (canContinue) {
      onClose();
      navigate(`/experience/${experience.slug}/reserve`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/50 z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl max-h-[85vh] overflow-auto safe-area-bottom"
          >
            {/* Drag Handle */}
            <div className="sticky top-0 bg-background pt-3 pb-4 flex justify-center">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            <div className="px-4 pb-6">
              <div className="flex items-baseline gap-1.5 mb-5">
                <span className="text-2xl font-bold text-foreground">{displayPrice.price}</span>
                <span className="text-base text-muted-foreground">{displayPrice.suffix}</span>
              </div>

              <div className="mb-5">
                <label className="block font-medium text-foreground mb-3">
                  When would you like to go?
                </label>
                <SessionPicker
                  sessions={sessions}
                  selectedSessionId={booking.sessionId}
                  isCustomRequest={booking.isCustomRequest}
                  customDate={booking.customDate}
                  customTime={booking.customTime}
                  onSessionSelect={handleSessionSelect}
                  onCustomDateChange={handleCustomDateChange}
                  onCustomTimeChange={handleCustomTimeChange}
                />
              </div>

              <div className="mb-5">
                <label htmlFor="participants-mobile" className="block font-medium text-foreground mb-3">
                  How many people?
                </label>
                <div className="relative">
                  <select
                    id="participants-mobile"
                    value={booking.participants}
                    onChange={handleParticipantsChange}
                    className="w-full px-4 py-3 border border-border rounded-button text-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-background appearance-none pr-10"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="text-right mb-5">
                <span className="text-xl font-bold text-primary">
                  Total: {formatPrice(totalCents)}
                </span>
              </div>

              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full py-3.5 bg-primary text-primary-foreground font-medium rounded-button hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {booking.isCustomRequest ? 'Send Request' : 'Reserve'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
