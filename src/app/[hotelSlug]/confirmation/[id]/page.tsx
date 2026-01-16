import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { getHotelBySlug } from '@/lib/hotels'
import { formatDate, formatTime, formatPrice } from '@/lib/utils'
import { Header } from '@/components/Header'

interface ConfirmationPageProps {
  params: Promise<{ hotelSlug: string; id: string }>
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { hotelSlug, id } = await params
  
  const hotel = await getHotelBySlug(hotelSlug)
  if (!hotel) {
    notFound()
  }
  
  const supabase = createAdminClient()
  
  // Try to find booking by ID or reservation ID
  let booking: any = null
  let reservation: any = null
  
  // First try as booking ID
  const { data: bookingData } = await supabase
    .from('bookings')
    .select(`
      *,
      reservation:reservations(
        *,
        experience:experiences(title, slug, duration_minutes, meeting_point, currency),
        session:experience_sessions(session_date, start_time)
      )
    `)
    .eq('id', id)
    .single()
  
  if (bookingData) {
    booking = bookingData
    reservation = (bookingData as any).reservation
  } else {
    // Try as reservation ID
    const { data: reservationData } = await supabase
      .from('reservations')
      .select(`
        *,
        experience:experiences(title, slug, duration_minutes, meeting_point, currency),
        session:experience_sessions(session_date, start_time),
        booking:bookings(*)
      `)
      .eq('id', id)
      .single()
    
    if (reservationData) {
      reservation = reservationData
      booking = (reservationData as any).booking?.[0] || null
    }
  }
  
  if (!reservation) {
    notFound()
  }
  
  const experience = reservation.experience as any
  const session = reservation.session as any
  const date = session?.session_date || reservation.requested_date || ''
  const time = session?.start_time || reservation.requested_time || ''
  
  return (
    <div className="embed-full">
      <Header 
        hotelName={hotel.display_name}
        logoUrl={hotel.logo_url}
        hotelSlug={hotelSlug}
      />
      
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          {/* Success icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Thank you for your booking. We've sent a confirmation email to{' '}
            <strong>{reservation.guest_email}</strong>
          </p>
          
          {/* Booking reference */}
          {booking && (
            <div className="inline-block bg-gray-100 rounded-lg px-4 py-2 mb-8">
              <span className="text-sm text-gray-500">Booking Reference</span>
              <div className="font-mono text-lg font-bold text-gray-900">
                {booking.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
          )}
          
          {/* Booking details */}
          <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Experience</span>
                <span className="font-medium text-gray-900">{experience.title}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium text-gray-900">
                  {date ? formatDate(date) : 'TBD'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-medium text-gray-900">
                  {time ? formatTime(time) : 'TBD'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Participants</span>
                <span className="font-medium text-gray-900">{reservation.participants}</span>
              </div>
              
              {experience.meeting_point && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Meeting Point</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%]">
                    {experience.meeting_point}
                  </span>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-900">Total Paid</span>
                <span className="font-bold text-primary text-lg">
                  {formatPrice(reservation.total_cents, experience.currency)}
                </span>
              </div>
            </div>
          </div>
          
          {/* What's next */}
          <div className="text-left mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirmation email sent to your inbox
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Arrive at the meeting point on time
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                The provider may contact you with more details
              </li>
            </ul>
          </div>
          
          {/* Back link */}
          <Link
            href={`/${hotelSlug}`}
            className="btn-primary px-6 py-3 inline-flex"
          >
            Browse More Experiences
          </Link>
        </div>
      </main>
    </div>
  )
}
