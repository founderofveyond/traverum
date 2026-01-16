import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import BookingSummary from '@/components/BookingSummary';
import { useBooking } from '@/context/BookingContext';

const Confirmation = () => {
  const navigate = useNavigate();
  const { booking, resetBooking } = useBooking();

  const isCustomRequest = booking.isCustomRequest;

  const handleBrowseMore = () => {
    resetBooking();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md text-center"
      >
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
          isCustomRequest ? 'bg-warning/10' : 'bg-success/10'
        }`}>
          {isCustomRequest ? (
            <Clock className="w-8 h-8 text-warning" />
          ) : (
            <Check className="w-8 h-8 text-success" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground mt-4">
          {isCustomRequest ? 'Request submitted' : 'Reservation submitted'}
        </h1>

        {/* Subtitle */}
        <div className="text-muted-foreground mt-2 space-y-1">
          {isCustomRequest ? (
            <>
              <p>We've sent your request to the provider.</p>
              <p>You'll hear back within 48 hours.</p>
            </>
          ) : (
            <>
              <p>We've sent the details to your email.</p>
              <p>Provider will confirm within 48 hours.</p>
            </>
          )}
        </div>

        {/* Summary Card */}
        <div className="mt-8">
          <BookingSummary showReference />
        </div>

        {/* Browse More Button */}
        <button
          onClick={handleBrowseMore}
          className="mt-8 px-6 py-3 border-2 border-primary text-primary font-medium rounded-button hover:bg-primary/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Browse More Experiences
        </button>
      </motion.div>
    </div>
  );
};

export default Confirmation;
