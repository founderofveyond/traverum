import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, formatDuration, cn } from '@/lib/utils'
import type { ExperienceWithMedia } from '@/lib/hotels'

interface ExperienceCardProps {
  experience: ExperienceWithMedia
  hotelSlug: string
  embedMode?: 'full' | 'section'
}

export function ExperienceCard({ experience, hotelSlug, embedMode = 'full' }: ExperienceCardProps) {
  const href = `/${hotelSlug}/${experience.slug}`
  
  // In section mode, open in new tab
  const linkProps = embedMode === 'section' 
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {}
  
  return (
    <Link 
      href={href}
      {...linkProps}
      className={cn(
        'card group block',
        embedMode === 'section' && 'hover:shadow-lg'
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {experience.coverImage ? (
          <Image
            src={experience.coverImage}
            alt={experience.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Duration badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium text-gray-700">
          {formatDuration(experience.duration_minutes)}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Supplier name */}
        <p className="text-xs text-gray-500 mb-1">
          {experience.supplier.name}
        </p>
        
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {experience.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {experience.description}
        </p>
        
        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="price text-lg">
              {formatPrice(experience.price_cents, experience.currency)}
            </span>
            {experience.pricing_type === 'per_person' && (
              <span className="text-sm text-gray-500 ml-1">/ person</span>
            )}
          </div>
          
          <span className="text-sm font-medium text-primary group-hover:underline">
            Book now →
          </span>
        </div>
      </div>
    </Link>
  )
}
