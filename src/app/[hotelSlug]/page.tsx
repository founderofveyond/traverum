import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHotelWithExperiences } from '@/lib/hotels'
import { getEmbedMode, cn } from '@/lib/utils'
import { Header } from '@/components/Header'
import { ExperienceCard } from '@/components/ExperienceCard'
import { ExperienceListClient } from '@/components/ExperienceListClient'

// Inherit dynamic from layout - hotel config changes take effect immediately
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

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
  const titleEnabled = hotel.widget_title_enabled ?? true
  const widgetTitle = hotel.widget_title || 'Local Experiences'
  const rawSubtitle =
    hotel.widget_subtitle || 'Curated by the team at {{hotel_name}}'
  const widgetSubtitle = rawSubtitle.replace('{{hotel_name}}', hotel.display_name)
  
  // In section mode, limit to 3 experiences
  const displayExperiences = embedMode === 'section' 
    ? experiences.slice(0, 3)
    : experiences
  
  const hasMoreExperiences = embedMode === 'section' && experiences.length > 3
  
  // #region agent log
  // Visible debug banner for production debugging - REMOVE AFTER FIX VERIFIED
  const BUILD_VERSION = 'FIX7-FONT-FIX'; // Update this to verify deployment
  const debugInfo = {
    v: BUILD_VERSION,
    id: hotel.id,
    accent: hotel.accent_color,
    bg: hotel.background_color,
    text: hotel.text_color,
    hFont: hotel.heading_font_family,
    ts: new Date().toISOString(),
  };
  // #endregion
  
  return (
    <div className={cn(
      embedMode === 'full' ? 'embed-full' : 'embed-section'
    )}>
      {/* #region agent log */}
      {/* Debug banner - VERY VISIBLE - REMOVE AFTER FIX VERIFIED */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#ff0000',
        color: '#ffffff',
        padding: '12px 16px',
        fontSize: '14px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        zIndex: 99999,
        textAlign: 'center',
        borderBottom: '4px solid #000',
      }}>
        🔴 DEBUG {BUILD_VERSION} | bg={hotel.background_color || 'NULL'} | font={hotel.heading_font_family?.slice(0,25) || 'NULL'}
      </div>
      {/* #endregion */}
      
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
        {/* Title - configurable, shown in both embed modes */}
        {titleEnabled && (
          <div className="mb-6">
            <h1 
              className="font-heading text-foreground"
              style={{ fontSize: 'var(--font-size-title)' }}
            >
              {widgetTitle}
            </h1>
            {widgetSubtitle && (
              <p 
                className="text-muted-foreground mt-2"
                style={{ fontSize: 'var(--font-size-h3)' }}
              >
                {widgetSubtitle}
              </p>
            )}
          </div>
        )}
        
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
                  className="inline-flex items-center gap-2 text-sm font-medium text-link hover:underline"
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