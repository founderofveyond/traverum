import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import BookingSummary from '@/components/BookingSummary';
import { useBooking, generateReferenceNumber } from '@/context/BookingContext';

const GuestDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { booking, setBooking } = useBooking();

  const [firstName, setFirstName] = useState(booking.guestFirstName);
  const [lastName, setLastName] = useState(booking.guestLastName);
  const [email, setEmail] = useState(booking.guestEmail);
  const [phone, setPhone] = useState(booking.guestPhone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const refNumber = generateReferenceNumber();
    
    setBooking(prev => ({
      ...prev,
      guestFirstName: firstName,
      guestLastName: lastName,
      guestEmail: email,
      guestPhone: phone,
      referenceNumber: refNumber
    }));

    navigate(`/experience/${slug}/confirmation`);
  };

  const isValid = firstName.trim() && lastName.trim() && email.trim() && email.includes('@');

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backTo={`/experience/${slug}`} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="container px-4 py-6 max-w-lg mx-auto"
      >
        <h1 className="text-2xl font-semibold text-foreground">
          {booking.isCustomRequest ? 'Complete your request' : 'Complete your reservation'}
        </h1>

        <div className="mt-6">
          <BookingSummary />
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Your details</h2>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3 border border-border rounded-button text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-4 py-3 border border-border rounded-button text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-border rounded-button text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                Phone (optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full px-4 py-3 border border-border rounded-button text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full mt-8 py-3.5 bg-primary text-primary-foreground font-medium rounded-button hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {booking.isCustomRequest ? 'Send Request' : 'Submit Reservation'}
          </button>

          <p className="text-sm text-muted-foreground text-center mt-3">
            {booking.isCustomRequest 
              ? 'Provider will confirm your request within 48 hours. Payment link is sent once confirmed.'
              : 'You\'ll receive a confirmation email. Payment link is sent once the provider confirms your spot.'
            }
          </p>
        </form>
      </motion.main>
    </div>
  );
};

export default GuestDetails;
