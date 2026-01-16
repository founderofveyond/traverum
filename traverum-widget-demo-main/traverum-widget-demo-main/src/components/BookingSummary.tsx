import { useBooking } from '@/context/BookingContext';
import { formatPrice } from '@/lib/pricing';

interface BookingSummaryProps {
  showReference?: boolean;
}

const BookingSummary = ({ showReference = false }: BookingSummaryProps) => {
  const { booking, totalCents } = useBooking();

  const displayDate = booking.sessionDate || 'Date pending';
  const displayTime = booking.sessionTime || '';
  const displayTitle = booking.experienceTitle || 'Experience';

  return (
    <div className="bg-background-alt rounded-card p-4">
      <h3 className="font-semibold text-foreground">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {booking.isCustomRequest ? 'Requested: ' : ''}
        {displayDate}{displayTime && ` · ${displayTime}`} · {booking.participants} {booking.participants === 1 ? 'person' : 'people'}
      </p>
      <div className="flex items-center justify-between mt-3">
        {showReference && booking.referenceNumber && (
          <span className="text-sm font-mono text-muted-foreground">{booking.referenceNumber}</span>
        )}
        <span className={`font-bold text-primary ${!showReference ? 'ml-auto' : ''}`}>{formatPrice(totalCents)}</span>
      </div>
    </div>
  );
};

export default BookingSummary;
