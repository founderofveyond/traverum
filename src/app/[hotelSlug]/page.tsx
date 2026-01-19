import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHotelWithExperiences } from '@/lib/hotels'
import { getEmbedMode, cn } from '@/lib/utils'
import { Header } from '@/components/Header'
import { ExperienceCard } from '@/components/ExperienceCard'
import { ExperienceListClient } from '@/components/ExperienceListClient'

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
        'container',
        embedMode === 'full' ? 'px-4 py-6' : 'p-4'
      )}>
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Local Experiences</h1>
          <p className="text-muted-foreground mt-1">Curated by our concierge team</p>
        </div>
        
        {/* Experience grid */}
        {experiences.length > 0 ? (
          <>
            <ExperienceListClient 
              experiences={displayExperiences}
              hotelSlug={hotelSlug}
              embedMode={embedMode}
            />
            
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
            <p className="text-muted-foreground">No experiences available</p>
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