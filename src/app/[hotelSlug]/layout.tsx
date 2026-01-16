import { notFound } from 'next/navigation'
import { getHotelBySlug } from '@/lib/hotels'
import { darkenColor, lightenColor } from '@/lib/utils'
import type { Metadata } from 'next'

interface HotelLayoutProps {
  children: React.ReactNode
  params: Promise<{ hotelSlug: string }>
}

export async function generateMetadata({ params }: HotelLayoutProps): Promise<Metadata> {
  const { hotelSlug } = await params
  const hotel = await getHotelBySlug(hotelSlug)
  
  if (!hotel) {
    return {
      title: 'Hotel Not Found',
    }
  }
  
  return {
    title: `${hotel.display_name} - Book Local Experiences`,
    description: `Discover and book amazing local experiences through ${hotel.display_name}`,
  }
}

export default async function HotelLayout({ children, params }: HotelLayoutProps) {
  const { hotelSlug } = await params
  const hotel = await getHotelBySlug(hotelSlug)
  
  if (!hotel) {
    notFound()
  }
  
  // Generate CSS variables for theming
  const primaryColor = hotel.primary_color || '#2563eb'
  const primaryHover = darkenColor(primaryColor, 15)
  const primaryLight = lightenColor(primaryColor, 90)
  
  const cssVariables = {
    '--color-primary': primaryColor,
    '--color-primary-hover': primaryHover,
    '--color-primary-light': primaryLight,
  } as React.CSSProperties
  
  return (
    <div style={cssVariables} className="min-h-screen">
      {children}
    </div>
  )
}
