'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { formatPrice, formatDuration, cn } from '@/lib/utils'
import { calculatePrice } from '@/lib/pricing'
import { SessionPicker } from './SessionPicker'
import { ParticipantSelector } from './ParticipantSelector'
import type { ExperienceWithMedia } from '@/lib/hotels'
import type { ExperienceSession } from '@/lib/supabase/types'

interface BookingPanelProps {
  experience: ExperienceWithMedia
  sessions: ExperienceSession[]
  hotelSlug: string
}

export function BookingPanel({ experience, sessions, hotelSlug }: BookingPanelProps) {
  const router = useRouter()
  const [participants, setParticipants] = useState(experience.min_participants)
  const [selectedSession, setSelectedSession] = useState<ExperienceSession | null>(null)
  const [isCustomRequest, setIsCustomRequest] = useState(false)
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  
  // Calculate price
  const priceCalc = useMemo(() => {
    return calculatePrice(experience, participants, selectedSession)
  }, [experience, participants, selectedSession])
  
  // Reset session if participants change and not enough spots
  useEffect(() => {
    if (selectedSession && selectedSession.spots_available < participants) {
      setSelectedSession(null)
    }
  }, [participants, selectedSession])
  
  const canProceed = isCustomRequest 
    ? (customDate && customTime && experience.allows_requests)
    : selectedSession !== null
  
  const handleContinue = () => {
    const params = new URLSearchParams()
    params.set('experienceId', experience.id)
    params.set('participants', participants.toString())
    params.set('total', priceCalc.totalPrice.toString())
    
    if (isCustomRequest) {
      params.set('requestDate', customDate)
      params.set('requestTime', customTime)
      params.set('isRequest', 'true')
    } else if (selectedSession) {
      params.set('sessionId', selectedSession.id)
    }
    
    router.push(`/${hotelSlug}/checkout?${params.toString()}`)
  }
  
  const hasSessions = sessions.length > 0
  const allowsRequests = experience.allows_requests
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24">
      {/* Price header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(experience.price_cents, experience.currency)}
          </span>
          {experience.pricing_type === 'per_person' && (
            <span className="text-gray-500">/ person</span>
          )}
          {experience.pricing_type === 'per_group' && (
            <span className="text-gray-500">/ group</span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDuration(experience.duration_minutes)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {experience.min_participants}-{experience.max_participants} people
          </span>
        </div>
      </div>
      
      {/* Booking options */}
      <div className="p-5 space-y-5">
        {/* Mode toggle if both options available */}
        {hasSessions && allowsRequests && (
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setIsCustomRequest(false)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
                !isCustomRequest 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Available Dates
            </button>
            <button
              onClick={() => setIsCustomRequest(true)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
                isCustomRequest 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Custom Request
            </button>
          </div>
        )}
        
        {/* Participants */}
        <div className="pb-4 border-b border-gray-100">
          <ParticipantSelector
            value={participants}
            onChange={setParticipants}
            min={experience.min_participants}
            max={experience.max_participants}
            availableSpots={selectedSession?.spots_available}
          />
        </div>
        
        {/* Session picker or custom request */}
        {!isCustomRequest && hasSessions ? (
          <SessionPicker
            sessions={sessions}
            selectedSession={selectedSession}
            onSelectSession={setSelectedSession}
            participants={participants}
          />
        ) : allowsRequests ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Request your preferred date and time. The provider will confirm availability.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred date
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred time
              </label>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="input"
              />
            </div>
          </div>
        ) : !hasSessions ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              No dates currently available.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Check back soon for new dates!
            </p>
          </div>
        ) : null}
        
        {/* Price breakdown */}
        {canProceed && (
          <div className="pt-4 border-t border-gray-100 space-y-2">
            {experience.pricing_type === 'per_person' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {formatPrice(priceCalc.pricePerPerson!, experience.currency)} × {participants} {participants === 1 ? 'person' : 'people'}
                </span>
                <span className="text-gray-900">
                  {formatPrice(priceCalc.basePrice, experience.currency)}
                </span>
              </div>
            )}
            {experience.pricing_type === 'per_group' && priceCalc.extraParticipants > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base price ({priceCalc.includedParticipants} included)</span>
                  <span className="text-gray-900">{formatPrice(priceCalc.basePrice, experience.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Extra participants ({priceCalc.extraParticipants})</span>
                  <span className="text-gray-900">{formatPrice(priceCalc.extraPersonFee, experience.currency)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2">
              <span>Total</span>
              <span className="text-primary">{formatPrice(priceCalc.totalPrice, experience.currency)}</span>
            </div>
          </div>
        )}
        
        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={!canProceed}
          className={cn(
            'w-full btn-primary py-3 text-base',
            !canProceed && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isCustomRequest ? 'Request Booking' : 'Continue to Details'}
        </button>
        
        <p className="text-xs text-center text-gray-500">
          You won't be charged yet
        </p>
      </div>
    </div>
  )
}
