'use client'

import { cn } from '@/lib/utils'

interface ParticipantSelectorProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  availableSpots?: number
}

export function ParticipantSelector({ 
  value, 
  onChange, 
  min, 
  max,
  availableSpots 
}: ParticipantSelectorProps) {
  const effectiveMax = availableSpots ? Math.min(max, availableSpots) : max
  
  const decrease = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }
  
  const increase = () => {
    if (value < effectiveMax) {
      onChange(value + 1)
    }
  }
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-gray-900">Participants</span>
        {availableSpots && availableSpots < max && (
          <p className="text-xs text-gray-500">
            {availableSpots} spots available
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrease}
          disabled={value <= min}
          className={cn(
            'w-9 h-9 rounded-full border flex items-center justify-center transition-colors',
            value <= min
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        <span className="w-8 text-center text-lg font-semibold text-gray-900">
          {value}
        </span>
        
        <button
          type="button"
          onClick={increase}
          disabled={value >= effectiveMax}
          className={cn(
            'w-9 h-9 rounded-full border flex items-center justify-center transition-colors',
            value >= effectiveMax
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  )
}
