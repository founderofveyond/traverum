import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, Users } from 'lucide-react';
import type { Experience, Session } from '@/types/experience';
import { useBooking } from '@/context/BookingContext';
import DatePickerDrawer from './DatePickerDrawer';
import { getDisplayPrice, formatPrice } from '@/lib/pricing';

interface BookingPanelProps {
  experience: Experience;
  sessions: Session[];
}

const BookingPanel = ({ experience, sessions }: BookingPanelProps) => {
  const navigate = useNavigate();
  const { booking, setBooking, totalCents } = useBooking();
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);

  const displayPrice = getDisplayPrice({
    pricingType: experience.pricingType,
    basePriceCents: experience.basePriceCents,
    extraPersonCents: experience.extraPersonCents,
    includedParticipants: experience.includedParticipants,
    minParticipants: experience.minParticipants,
    maxParticipants: experience.maxParticipants,
  });

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

  const hasDateSelection = booking.isCustomRequest 
    ? (booking.customDate && booking.customTime)
    : booking.sessionId;

  const getDateDisplayText = () => {
    if (!hasDateSelection) return 'Select date';
    if (booking.sessionDate && booking.sessionTime) {
      return `${booking.sessionDate} · ${booking.sessionTime}`;
    }
    return 'Select date';
  };

  const handleContinue = () => {
    if (hasDateSelection) {
      navigate(`/experience/${experience.slug}/reserve`);
    }
  };

  return (
    <>
      <div className="bg-background-alt rounded-card p-5">
        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-4">
          <span className="text-2xl font-bold text-foreground">{displayPrice.price}</span>
          <span className="text-muted-foreground">{displayPrice.suffix}</span>
        </div>

        {/* Date Selector Button */}
        <button
          onClick={() => setDateDrawerOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 border border-border rounded-button bg-background hover:border-primary/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className={hasDateSelection ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {getDateDisplayText()}
            </span>
          </div>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Participants Selector */}
        <div className="relative mt-3">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <select
            value={booking.participants}
            onChange={handleParticipantsChange}
            className="w-full pl-12 pr-10 py-3 border border-border rounded-button bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Total & CTA */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">{formatPrice(totalCents)}</span>
          </div>
          
          <button
            onClick={handleContinue}
            disabled={!hasDateSelection}
            className="w-full py-3.5 bg-primary text-primary-foreground font-medium rounded-button hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {booking.isCustomRequest ? 'Send Request' : 'Reserve'}
          </button>
        </div>
      </div>

      {/* Date Picker Drawer */}
      <DatePickerDrawer
        isOpen={dateDrawerOpen}
        onClose={() => setDateDrawerOpen(false)}
        sessions={sessions}
        selectedSessionId={booking.sessionId}
        isCustomRequest={booking.isCustomRequest}
        customDate={booking.customDate}
        customTime={booking.customTime}
        onSessionSelect={handleSessionSelect}
        onCustomDateChange={handleCustomDateChange}
        onCustomTimeChange={handleCustomTimeChange}
        onConfirm={() => setDateDrawerOpen(false)}
      />
    </>
  );
};

export default BookingPanel;
