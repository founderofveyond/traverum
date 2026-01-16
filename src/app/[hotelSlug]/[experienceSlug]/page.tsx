import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHotelBySlug, getExperienceForHotel } from '@/lib/hotels'
import { getAvailableSessions } from '@/lib/sessions'
import { getEmbedMode, formatDuration, cn } from '@/lib/utils'
import { Header } from '@/components/Header'
import { ImageGallery } from '@/components/ImageGallery'
import { BookingPanel } from '@/components/BookingPanel'
import type { Metadata } from 'next'

interface ExperiencePageProps {
  params: Promise<{ hotelSlug: string; experienceSlug: string }>
  searchParams: Promise<{ embed?: string }>
}

export async function generateMetadata({ params }: ExperiencePageProps): Promise<Metadata> {
  const { hotelSlug, experienceSlug } = await params
  const experience = await getExperienceForHotel(hotelSlug, experienceSlug)
  const hotel = await getHotelBySlug(hotelSlug)
  
  if (!experience || !hotel) {
    return { title: 'Experience Not Found' }
  }
  
  return {
    title: `${experience.title} - ${hotel.display_name}`,
    description: experience.description.slice(0, 160),
  }
}

export default async function ExperiencePage({ params, searchParams }: ExperiencePageProps) {
  const { hotelSlug, experienceSlug } = await params
  const search = await searchParams
  const embedMode = getEmbedMode(search)
  
  const [hotel, experience] = await Promise.all([
    getHotelBySlug(hotelSlug),
    getExperienceForHotel(hotelSlug, experienceSlug),
  ])
  
  if (!hotel || !experience) {
    notFound()
  }
  
  const sessions = await getAvailableSessions(experience.id)
  
  return (
    <div className={cn(
      embedMode === 'full' ? 'embed-full' : 'embed-section'
    )}>
      {/* Header - only in full mode */}
      {embedMode === 'full' && (
        <Header 
          hotelName={hotel.display_name}
          logoUrl={hotel.logo_url}
          hotelSlug={hotelSlug}
        />
      )}
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          href={`/${hotelSlug}${embedMode === 'section' ? '?embed=section' : ''}`}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to experiences
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column - Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image gallery */}
            <ImageGallery
              images={experience.media}
              fallbackImage={experience.image_url}
              title={experience.title}
            />
            
            {/* Title and meta */}
            <div>
              <p className="text-sm text-gray-500 mb-1">
                By {experience.supplier.name}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {experience.title}
              </h1>
              
              {/* Quick info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDuration(experience.duration_minutes)}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {experience.min_participants}-{experience.max_participants} participants
                </span>
                {experience.meeting_point && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {experience.meeting_point}
                  </span>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About this experience</h2>
              <div className="text-gray-600 whitespace-pre-line">
                {experience.description}
              </div>
            </div>
            
            {/* Meeting point details */}
            {experience.meeting_point && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Meeting Point
                </h3>
                <p className="text-gray-600">{experience.meeting_point}</p>
              </div>
            )}
            
            {/* Provider info */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Provided by</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {experience.supplier.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{experience.supplier.name}</p>
                  <p className="text-sm text-gray-500">Local experience provider</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Booking panel */}
          <div className="lg:col-span-2">
            <BookingPanel
              experience={experience}
              sessions={sessions}
              hotelSlug={hotelSlug}
            />
          </div>
        </div>
      </main>
      
      {/* Embed mode resize script */}
      {embedMode === 'section' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function sendHeight() {
                  var height = document.body.scrollHeight;
                  window.parent.postMessage({ type: 'traverum-resize', height: height }, '*');
                }
                sendHeight();
                window.addEventListener('resize', sendHeight);
                new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true });
              })();
            `,
          }}
        />
      )}
    </div>
  )
}
