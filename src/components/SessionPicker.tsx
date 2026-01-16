'use client'

import { useState, useMemo } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay } from 'date-fns'
import { cn, formatTime } from '@/lib/utils'
import type { ExperienceSession } from '@/lib/supabase/types'

interface SessionPickerProps {
  sessions: ExperienceSession[]
  selectedSession: ExperienceSession | null
  onSelectSession: (session: ExperienceSession | null) => void
  participants: number
}

export function SessionPicker({ sessions, selectedSession, onSelectSession, participants }: SessionPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Get dates that have available sessions with enough spots
  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    sessions.forEach(session => {
      if (session.spots_available >= participants) {
        dates.add(session.session_date)
      }
    })
    return dates
  }, [sessions, participants])
  
  // Get sessions for selected date
  const selectedDate = selectedSession?.session_date
  const sessionsForDate = useMemo(() => {
    if (!selectedDate) return []
    return sessions.filter(s => 
      s.session_date === selectedDate && 
      s.spots_available >= participants
    )
  }, [sessions, selectedDate, participants])
  
  // Calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Pad start of month
  const startPadding = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 // Monday = 0
  
  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (availableDates.has(dateStr)) {
      // Find first available session for this date
      const firstSession = sessions.find(s => 
        s.session_date === dateStr && 
        s.spots_available >= participants
      )
      onSelectSession(firstSession || null)
    }
  }
  
  const handleTimeClick = (session: ExperienceSession) => {
    onSelectSession(session)
  }
  
  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-medium text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding for start of month */}
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
          
          {/* Days */}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isAvailable = availableDates.has(dateStr)
            const isSelected = selectedDate === dateStr
            const isPast = isBefore(day, startOfDay(new Date()))
            const isCurrentDay = isToday(day)
            
            return (
              <button
                key={dateStr}
                onClick={() => !isPast && handleDateClick(day)}
                disabled={isPast || !isAvailable}
                className={cn(
                  'aspect-square flex items-center justify-center text-sm rounded-lg transition-all',
                  isPast && 'text-gray-300 cursor-not-allowed',
                  !isPast && !isAvailable && 'text-gray-400 cursor-not-allowed',
                  !isPast && isAvailable && !isSelected && 'text-gray-900 hover:bg-gray-100 font-medium',
                  isSelected && 'bg-primary text-white font-medium',
                  isCurrentDay && !isSelected && 'ring-1 ring-primary',
                )}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Time slots */}
      {selectedDate && sessionsForDate.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Available times</h4>
          <div className="grid grid-cols-3 gap-2">
            {sessionsForDate.map(session => (
              <button
                key={session.id}
                onClick={() => handleTimeClick(session)}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg border transition-all',
                  selectedSession?.id === session.id
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                )}
              >
                <div className="font-medium">{formatTime(session.start_time)}</div>
                <div className="text-xs text-gray-500">{session.spots_available} spots</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {selectedDate && sessionsForDate.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No available times for {participants} participants on this date.
        </p>
      )}
    </div>
  )
}
