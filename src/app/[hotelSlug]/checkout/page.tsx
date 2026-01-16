import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getHotelBySlug } from '@/lib/hotels'
import { createAdminClient } from '@/lib/supabase/server'
import { getEmbedMode, cn } from '@/lib/utils'
import { Header } from '@/components/Header'
import { CheckoutForm } from '@/components/CheckoutForm'
import { BookingSummary } from '@/components/BookingSummary'
import type { Experience, ExperienceSession } from '@/lib/supabase/types'

interface CheckoutPageProps {
  params: Promise<{ hotelSlug: string }>
  searchParams: Promise<{
    embed?: string
    experienceId?: string
    sessionId?: string
    participants?: string
    total?: string
    isRequest?: string
    requestDate?: string
    requestTime?: string
  }>
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { hotelSlug } = await params
  const search = await searchParams
  const embedMode = getEmbedMode(search)
  
  // Validate required params
  const experienceId = search.experienceId
  const participantsStr = search.participants
  const totalStr = search.total
  
  if (!experienceId || !participantsStr || !totalStr) {
    redirect(`/${hotelSlug}`)
  }
  
  const hotel = await getHotelBySlug(hotelSlug)
  if (!hotel) {
    notFound()
  }
  
  // Fetch experience
  const supabase = createAdminClient()
  
  const { data: experienceData } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', experienceId)
    .single()
  
  if (!experienceData) {
    notFound()
  }
  
  const experience = experienceData as Experience
  
  // Fetch session if provided
  let session: ExperienceSession | null = null
  if (search.sessionId) {
    const { data } = await supabase
      .from('experience_sessions')
      .select('*')
      .eq('id', search.sessionId)
      .single()
    session = data as ExperienceSession | null
  }
  
  // Get cover image
  const { data: mediaData } = await supabase
    .from('media')
    .select('url')
    .eq('experience_id', experienceId)
    .order('sort_order')
    .limit(1)
  
  const media = mediaData as { url: string }[] | null
  const coverImage = media?.[0]?.url || experience.image_url
  
  const participants = parseInt(participantsStr)
  const totalCents = parseInt(totalStr)
  const isRequest = search.isRequest === 'true'
  
  return (
    <div className={cn(
      embedMode === 'full' ? 'embed-full' : 'embed-section'
    )}>
      {embedMode === 'full' && (
        <Header 
          hotelName={hotel.display_name}
          logoUrl={hotel.logo_url}
          hotelSlug={hotelSlug}
        />
      )}
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          href={`/${hotelSlug}/${experience.slug}`}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to experience
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Complete Your Booking
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Guest Details
              </h2>
              
              <CheckoutForm
                hotelSlug={hotelSlug}
                experienceId={experience.id}
                sessionId={search.sessionId}
                participants={participants}
                totalCents={totalCents}
                isRequest={isRequest}
                requestDate={search.requestDate}
                requestTime={search.requestTime}
              />
            </div>
          </div>
          
          {/* Summary */}
          <div className="lg:col-span-2">
            <BookingSummary
              experience={experience}
              session={session}
              participants={participants}
              totalCents={totalCents}
              isRequest={isRequest}
              requestDate={search.requestDate}
              requestTime={search.requestTime}
              coverImage={coverImage}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
