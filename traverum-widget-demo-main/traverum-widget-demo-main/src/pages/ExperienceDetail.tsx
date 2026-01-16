import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import ImageGallery from '@/components/ImageGallery';
import BookingPanel from '@/components/BookingPanel';
import MobileBookingBar from '@/components/MobileBookingBar';
import BottomSheet from '@/components/BottomSheet';
import { useExperience, useExperienceSessions } from '@/hooks/useExperiences';
import { useBooking } from '@/context/BookingContext';
import { getDisplayPrice } from '@/lib/pricing';

const ExperienceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { setBooking } = useBooking();

  const { data: experience, isLoading } = useExperience(slug);
  const { data: sessions = [] } = useExperienceSessions(experience?.id);

  useEffect(() => {
    if (experience) {
      setBooking(prev => ({
        ...prev,
        experienceSlug: experience.slug,
        experienceTitle: experience.title,
        pricingType: experience.pricingType,
        basePriceCents: experience.basePriceCents,
        extraPersonCents: experience.extraPersonCents,
        includedParticipants: experience.includedParticipants,
        minParticipants: experience.minParticipants,
        maxParticipants: experience.maxParticipants,
        sessionPriceOverrideCents: null,
      }));
    }
  }, [experience, setBooking]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack backTo="/" />
        <div className="container px-4 py-4 md:py-6">
          <div className="md:grid md:grid-cols-5 md:gap-6">
            <div className="md:col-span-3">
              <div className="aspect-[4/3] rounded-card bg-muted animate-pulse" />
              <div className="mt-5 space-y-3">
                <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                <div className="h-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="hidden md:block md:col-span-2">
              <div className="h-64 bg-muted rounded-card animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Experience not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-primary hover:underline"
          >
            Return to experiences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header showBack backTo="/" />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="container px-4 py-4 md:py-6"
      >
        <div className="md:grid md:grid-cols-5 md:gap-6">
          {/* Left Column - Content */}
          <div className="md:col-span-3">
            <ImageGallery images={experience.images} title={experience.title} />

            <div className="mt-5">
              <h1 className="text-2xl font-semibold text-foreground">{experience.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {experience.duration} · Up to {experience.maxParticipants} people
              </p>
              <p className="text-sm text-foreground mt-3 leading-relaxed">
                {experience.description}
              </p>
            </div>

            {/* Info Sections */}
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">How it works</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reserve now — free and non-binding. Pay after provider confirms.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Cancellation</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Free cancellation up to 7 days before.
                </p>
              </div>
              {experience.meetingPoint && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Meeting point</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {experience.meetingPoint}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Panel (Desktop) */}
          <div className="hidden md:block md:col-span-2">
            <div className="sticky top-6">
              <BookingPanel
                experience={experience}
                sessions={sessions}
              />
            </div>
          </div>
        </div>
      </motion.main>

      {/* Mobile Booking Bar & Bottom Sheet */}
      <MobileBookingBar
        experience={experience}
        onReserveClick={() => setSheetOpen(true)}
      />
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        experience={experience}
        sessions={sessions}
      />
    </div>
  );
};

export default ExperienceDetail;
