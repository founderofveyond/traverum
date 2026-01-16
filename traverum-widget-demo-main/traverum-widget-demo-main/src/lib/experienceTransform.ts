import type { Experience, Session } from '@/types/experience';
import type { Tables } from '@/integrations/supabase/types';

type ExperienceRow = Tables<'experiences'>;
type SessionRow = Tables<'experience_sessions'>;
type MediaRow = Tables<'media'>;

export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining > 0 ? `${hours}h ${remaining}min` : `${hours}h`;
  }
  return `${minutes}min`;
}

export function transformExperience(
  dbRow: ExperienceRow,
  media: Pick<MediaRow, 'url' | 'sort_order'>[] = []
): Experience {
  const sortedMedia = [...media].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const mainImage = dbRow.image_url || '/placeholder.svg';
  
  return {
    id: dbRow.id,
    slug: dbRow.slug,
    title: dbRow.title,
    duration: formatDuration(dbRow.duration_minutes),
    maxParticipants: dbRow.max_participants,
    minParticipants: dbRow.min_participants,
    image: mainImage,
    images: sortedMedia.length > 0 
      ? sortedMedia.map(m => m.url) 
      : [mainImage],
    description: dbRow.description,
    meetingPoint: dbRow.meeting_point,
    pricingType: dbRow.pricing_type as 'per_person' | 'flat_rate' | 'base_plus_extra',
    basePriceCents: dbRow.base_price_cents,
    extraPersonCents: dbRow.extra_person_cents,
    includedParticipants: dbRow.included_participants,
    allowsRequests: dbRow.allows_requests ?? true,
    currency: dbRow.currency,
  };
}

export function transformSession(dbRow: SessionRow): Session {
  const dateObj = new Date(dbRow.session_date + 'T00:00:00');
  
  return {
    id: dbRow.id,
    dateObj,
    date: dateObj.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }),
    time: dbRow.start_time.slice(0, 5), // "09:00:00" -> "09:00"
    spotsLeft: dbRow.spots_available,
    spotsTotal: dbRow.spots_total,
    priceOverrideCents: dbRow.price_override_cents,
  };
}
