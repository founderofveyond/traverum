import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHotelWithExperiences } from '@/lib/hotels'
import { getEmbedMode, cn } from '@/lib/utils'
import { Header } from '@/components/Header'
import { ExperienceCard } from '@/components/ExperienceCard'

interface HotelPageProps {
  params: Promise<{ hotelSlug: string }>
  searchParams: Promise<{ embed?: string }>
}

export default async function HotelPage({ params, searchParams }: HotelPageProps) {
  const { hotelSlug } = await params
  const search = await searchParams
  const embedMode = getEmbedMode(search)
  
  const data = await getHotelWithExperiences(hotelSlug)
  
  if (!data) {
    notFound()
  }
  
  const { hotel, experiences } = data
  
  // In section mode, limit to 3 experiences
  const displayExperiences = embedMode === 'section' 
    ? experiences.slice(0, 3)
    : experiences
  
  const hasMoreExperiences = embedMode === 'section' && experiences.length > 3
  
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
      
      <main className={cn(
        'max-w-6xl mx-auto',
        embedMode === 'full' ? 'px-4 py-8' : 'p-4'
      )}>
        {/* Title - only in full mode */}
        {embedMode === 'full' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Local Experiences
            </h2>
            <p className="text-gray-600">
              Discover amazing activities curated by {hotel.display_name}
            </p>
          </div>
        )}
        
        {/* Experience grid */}
        {experiences.length > 0 ? (
          <>
            <div className={cn(
              'grid gap-6',
              embedMode === 'full' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            )}>
              {displayExperiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  hotelSlug={hotelSlug}
                  embedMode={embedMode}
                />
              ))}
            </div>
            
            {/* View all link - section mode only */}
            {hasMoreExperiences && (
              <div className="mt-6 text-center">
                <Link
                  href={`/${hotelSlug}?embed=full`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  View all {experiences.length} experiences
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No experiences available
            </h3>
            <p className="text-gray-500">
              Check back soon for new activities!
            </p>
          </div>
        )}
      </main>
      
      {/* Embed mode resize script */}
      {embedMode === 'section' && (
        <EmbedResizer />
      )}
    </div>
  )
}

// Client component for iframe resizing
function EmbedResizer() {
  return (
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
  )
}
