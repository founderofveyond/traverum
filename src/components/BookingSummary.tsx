import Image from 'next/image'
import { formatPrice, formatDuration, formatDate, formatTime } from '@/lib/utils'
import type { Experience, ExperienceSession } from '@/lib/supabase/types'

interface BookingSummaryProps {
  experience: Experience
  session?: ExperienceSession | null
  participants: number
  totalCents: number
  isRequest: boolean
  requestDate?: string
  requestTime?: string
  coverImage?: string | null
}

export function BookingSummary({
  experience,
  session,
  participants,
  totalCents,
  isRequest,
  requestDate,
  requestTime,
  coverImage,
}: BookingSummaryProps) {
  const date = session?.session_date || requestDate || ''
  const time = session?.start_time || requestTime || ''
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Image */}
      {coverImage && (
        <div className="relative aspect-[16/9]">
          <Image
            src={coverImage}
            alt={experience.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}
      
      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-gray-900">{experience.title}</h3>
          <p className="text-sm text-gray-500">{formatDuration(experience.duration_minutes)}</p>
        </div>
        
        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Date</span>
            <span className="font-medium text-gray-900">
              {date ? formatDate(date) : 'Not selected'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Time</span>
            <span className="font-medium text-gray-900">
              {time ? formatTime(time) : 'Not selected'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Participants</span>
            <span className="font-medium text-gray-900">{participants}</span>
          </div>
          
          {isRequest && (
            <div className="flex justify-between">
              <span className="text-gray-600">Type</span>
              <span className="font-medium text-amber-600">Custom Request</span>
            </div>
          )}
        </div>
        
        {/* Total */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(totalCents, experience.currency)}
            </span>
          </div>
        </div>
        
        {/* Notice */}
        {isRequest && (
          <p className="text-xs text-gray-500 bg-amber-50 p-3 rounded-lg">
            This is a custom request. The provider will confirm if this time is available.
          </p>
        )}
      </div>
    </div>
  )
}
