import { notFound } from 'next/navigation'
import { getHotelBySlug } from '@/lib/hotels'
import { hexToHsl } from '@/lib/utils'
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
  
  // Generate CSS variables for theming (convert hex to HSL)
  const primaryColor = hotel.primary_color || '#2563eb'
  const primaryHsl = hexToHsl(primaryColor)
  
  // Calculate hover color (slightly darker)
  const [h, s, l] = primaryHsl.split(' ').map(v => parseFloat(v.replace('%', '')))
  const hoverL = Math.max(0, l - 5) // Darken by 5%
  
  const cssVariables = {
    '--primary': primaryHsl,
    '--primary-hover': `${h} ${s}% ${hoverL}%`,
    '--ring': primaryHsl,
  } as React.CSSProperties
  
  return (
    <div style={cssVariables} className="min-h-screen">
      {children}
    </div>
  )
}
