'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ChevronDown, Check } from 'lucide-react'
import { format } from 'date-fns'
import { enGB } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { formatTime, cn } from '@/lib/utils'
import type { ExperienceSession } from '@/lib/supabase/types'

interface SessionPickerProps {
  sessions: ExperienceSession[]
  selectedSessionId: string | null
  isCustomRequest: boolean
  customDate: string
  customTime: string
  onSessionSelect: (sessionId: string | null, isCustom: boolean) => void
  onCustomDateChange: (date: string) => void
  onCustomTimeChange: (time: string) => void
  participants: number
}

// All time options in a flat array for simpler grid layout
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00'
]

export function SessionPicker({
  sessions,
  selectedSessionId,
  isCustomRequest,
  customDate,
  customTime,
  onSessionSelect,
  onCustomDateChange,
  onCustomTimeChange,
  participants,
}: SessionPickerProps) {
  const [slotsOpen, setSlotsOpen] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(
    customDate ? new Date(customDate) : undefined
  )
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Filter sessions based on participants
  const availableSessions = useMemo(() => {
    return sessions.filter(session => session.spots_available >= participants)
  }, [sessions, participants])

  const hasAvailableSessions = availableSessions.length > 0

  // Transform sessions to match demo format (European date format: dd.mm.yyyy)
  const transformedSessions = useMemo(() => {
    return availableSessions.map(session => ({
      id: session.id,
      date: format(new Date(session.session_date), 'dd.MM.yyyy'),
      time: formatTime(session.start_time),
      spotsLeft: session.spots_available,
      spotsTotal: session.spots_total,
      priceOverrideCents: session.price_override_cents,
      sessionDate: session.session_date,
      startTime: session.start_time,
    }))
  }, [availableSessions])

  // Handle calendar date selection for custom request
  const handleCalendarDateSelect = (date: Date | undefined) => {
    setSelectedCalendarDate(date)
    if (date) {
      onCustomDateChange(format(date, 'yyyy-MM-dd'))
      // Clear session selection - we're in request mode
      onSessionSelect(null, true)
    }
  }

  // Handle time selection for custom request
  const handleTimeSelect = (time: string) => {
    onCustomTimeChange(time)
    onSessionSelect(null, true)
  }

  // Handle selecting a confirmed session
  const handleSessionSelect = (sessionId: string) => {
    onSessionSelect(sessionId, false)
    setSlotsOpen(false)
  }

  return (
    <div className="space-y-4 font-body">
      {/* Primary: Request Form */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          Pick your preferred date & time
        </p>
        
        {/* Calendar - centered and compact */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedCalendarDate}
            onSelect={handleCalendarDateSelect}
            disabled={(date) => {
              const dateOnly = new Date(date)
              dateOnly.setHours(0, 0, 0, 0)
              return dateOnly < today
            }}
            className="rounded-lg border border-border"
          />
        </div>

        {/* Time Selection - Grid layout for mobile */}
        <AnimatePresence>
          {selectedCalendarDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Time for {format(selectedCalendarDate, 'dd.MM.yyyy')}
                </p>
                
                {/* Grid of time slots - 4 columns on mobile, responsive */}
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={cn(
                        'py-2.5 text-sm rounded-lg border transition-all font-medium',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                        customTime === time && isCustomRequest
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-border bg-background hover:border-accent hover:bg-accent/5 text-foreground'
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info message */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>Provider will confirm your request within 48 hours</span>
        </div>
      </div>

      {/* Secondary: Available Sessions (Collapsible) */}
      {hasAvailableSessions && (
        <Collapsible open={slotsOpen} onOpenChange={setSlotsOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between py-3 px-4 bg-success/10 text-success rounded-lg hover:bg-success/15 transition-colors">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">
                {availableSessions.length} confirmed {availableSessions.length === 1 ? 'slot' : 'slots'} available
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${slotsOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 space-y-2"
            >
              <p className="text-xs text-muted-foreground mb-2">
                Select a confirmed slot for instant booking
              </p>
              {transformedSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionSelect(session.id)}
                  className={`w-full flex items-center justify-between py-3 px-4 rounded-lg border-2 transition-all ${
                    selectedSessionId === session.id && !isCustomRequest
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50 bg-background'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {session.date} · {session.time}
                    </span>
                  </div>
                  <span
                    className={`text-xs ${
                      session.spotsLeft <= 3 ? 'text-warning' : 'text-muted-foreground'
                    }`}
                  >
                    {session.spotsLeft} spots left
                  </span>
                </button>
              ))}
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}