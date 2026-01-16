import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronDown, Check } from 'lucide-react';
import type { Session } from '@/types/experience';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SessionPickerProps {
  sessions: Session[];
  selectedSessionId: string | null;
  isCustomRequest: boolean;
  customDate: string;
  customTime: string;
  onSessionSelect: (sessionId: string | null, isCustom: boolean) => void;
  onCustomDateChange: (date: string) => void;
  onCustomTimeChange: (time: string) => void;
}

// Time options grouped by period
const timeGroups = {
  morning: ['08:00', '09:00', '10:00', '11:00'],
  afternoon: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  evening: ['18:00', '19:00', '20:00', '21:00']
};

const SessionPicker = ({
  sessions,
  selectedSessionId,
  isCustomRequest,
  customDate,
  customTime,
  onSessionSelect,
  onCustomDateChange,
  onCustomTimeChange
}: SessionPickerProps) => {
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(
    customDate ? new Date(customDate) : undefined
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasAvailableSessions = sessions.length > 0;

  // Handle calendar date selection for custom request
  const handleCalendarDateSelect = (date: Date | undefined) => {
    setSelectedCalendarDate(date);
    if (date) {
      onCustomDateChange(format(date, 'yyyy-MM-dd'));
      // Clear session selection - we're in request mode
      onSessionSelect(null, true);
    }
  };

  // Handle time selection for custom request
  const handleTimeSelect = (time: string) => {
    onCustomTimeChange(time);
    onSessionSelect(null, true);
  };

  // Handle selecting a confirmed session
  const handleSessionSelect = (session: Session) => {
    onSessionSelect(session.id, false);
    setSlotsOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Primary: Request Form */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-3">
            Pick your preferred date & time
          </p>
          
          {/* Calendar */}
          <div className="flex justify-center mb-4">
            <Calendar
              mode="single"
              selected={selectedCalendarDate}
              onSelect={handleCalendarDateSelect}
              disabled={(date) => {
                const dateOnly = new Date(date);
                dateOnly.setHours(0, 0, 0, 0);
                return dateOnly < today;
              }}
              className="rounded-lg border border-border p-3 pointer-events-auto"
            />
          </div>

          {/* Time Selection */}
          <AnimatePresence>
            {selectedCalendarDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm text-muted-foreground mb-3">
                  Select preferred time for {format(selectedCalendarDate, 'EEE, d MMM')}
                </p>
                
                <div className="space-y-3">
                  {/* Morning */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Morning</p>
                    <div className="flex flex-wrap gap-2">
                      {timeGroups.morning.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`px-3 py-2 text-sm rounded-button border transition-all ${
                            customTime === time && isCustomRequest
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'border-border bg-background hover:border-primary/50 text-foreground'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Afternoon</p>
                    <div className="flex flex-wrap gap-2">
                      {timeGroups.afternoon.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`px-3 py-2 text-sm rounded-button border transition-all ${
                            customTime === time && isCustomRequest
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'border-border bg-background hover:border-primary/50 text-foreground'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Evening */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Evening</p>
                    <div className="flex flex-wrap gap-2">
                      {timeGroups.evening.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`px-3 py-2 text-sm rounded-button border transition-all ${
                            customTime === time && isCustomRequest
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'border-border bg-background hover:border-primary/50 text-foreground'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info message */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
                {sessions.length} confirmed {sessions.length === 1 ? 'slot' : 'slots'} available
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
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionSelect(session)}
                  className={`w-full flex items-center justify-between py-3 px-4 rounded-lg border-2 transition-all ${
                    selectedSessionId === session.id && !isCustomRequest
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 bg-background'
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
  );
};

export default SessionPicker;
