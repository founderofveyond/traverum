import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { getHotelBySlug } from '@/lib/hotels'
import { formatDate, formatTime, formatPrice, cn } from '@/lib/utils'
import { Header } from '@/components/Header'

interface ReservationPageProps {
  params: Promise<{ hotelSlug: string; id: string }>
  searchParams: Promise<{ embed?: string }>
}

export default async function ReservationPage({ params, searchParams }: ReservationPageProps) {
  const { hotelSlug, id } = await params
  const search = await searchParams
  
  const hotel = await getHotelBySlug(hotelSlug)
  if (!hotel) {
    notFound()
  }
  
  const supabase = createAdminClient()
  
  const { data: reservationData } = await supabase
    .from('reservations')
    .select(`
      *,
      experience:experiences(title, slug, duration_minutes, meeting_point, currency),
      session:experience_sessions(session_date, start_time)
    `)
    .eq('id', id)
    .single()
  
  if (!reservationData) {
    notFound()
  }
  
  const reservation = reservationData as any
  const date = reservation.session?.session_date || reservation.requested_date || ''
  const time = reservation.session?.start_time || reservation.requested_time || ''
  const experience = reservation.experience
  
  return (
    <div className="embed-full">
      <Header 
        hotelName={hotel.display_name}
        logoUrl={hotel.logo_url}
        hotelSlug={hotelSlug}
      />
      
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          {/* Status icon */}
          <div className={cn(
            'w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center',
            reservation.reservation_status === 'pending' && 'bg-amber-100',
            reservation.reservation_status === 'approved' && 'bg-green-100',
            reservation.reservation_status === 'declined' && 'bg-red-100',
            reservation.reservation_status === 'expired' && 'bg-gray-100',
          )}>
            {reservation.reservation_status === 'pending' && (
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {reservation.reservation_status === 'approved' && (
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {reservation.reservation_status === 'declined' && (
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {reservation.reservation_status === 'expired' && (
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          {/* Status title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {reservation.reservation_status === 'pending' && 'Request Sent!'}
            {reservation.reservation_status === 'approved' && 'Booking Approved!'}
            {reservation.reservation_status === 'declined' && 'Booking Unavailable'}
            {reservation.reservation_status === 'expired' && 'Request Expired'}
          </h1>
          
          {/* Status message */}
          <p className="text-gray-600 mb-8">
            {reservation.reservation_status === 'pending' && 
              'Your booking request has been sent to the experience provider. They will respond within 48 hours.'}
            {reservation.reservation_status === 'approved' && 
              'Great news! Your booking has been approved. Check your email for the payment link.'}
            {reservation.reservation_status === 'declined' && 
              'Unfortunately, the provider was unable to accept your booking for this time.'}
            {reservation.reservation_status === 'expired' && 
              'This booking request has expired. The provider did not respond in time.'}
          </p>
          
          {/* Booking details */}
          <div className="bg-gray-50 rounded-lg p-5 text-left mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Experience</span>
                <span className="font-medium text-gray-900">{experience.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium text-gray-900">
                  {date ? formatDate(date) : 'Custom request'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-medium text-gray-900">
                  {time ? formatTime(time) : 'Custom request'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Participants</span>
                <span className="font-medium text-gray-900">{reservation.participants}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-primary">
                  {formatPrice(reservation.total_cents, experience.currency)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Payment link for approved */}
          {reservation.reservation_status === 'approved' && reservation.stripe_payment_link_url && (
            <a
              href={reservation.stripe_payment_link_url}
              className="btn-primary px-8 py-3 text-base inline-flex"
            >
              Complete Payment
            </a>
          )}
          
          {/* Back link */}
          <div className="mt-6">
            <Link
              href={`/${hotelSlug}`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to experiences
            </Link>
          </div>
        </div>
        
        {/* Email notice */}
        <p className="text-center text-sm text-gray-500 mt-6">
          We've sent a confirmation email to <strong>{reservation.guest_email}</strong>
        </p>
      </main>
    </div>
  )
}
