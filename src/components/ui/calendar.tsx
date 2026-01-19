'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { enGB } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={enGB}
      weekStartsOn={1}
      className={cn('p-3 pointer-events-auto select-none', className)}
      classNames={{
        months: 'flex flex-col',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-semibold text-foreground',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'h-7 w-7 bg-transparent p-0 inline-flex items-center justify-center rounded-md border border-input',
          'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse rdp-table',
        head_row: '',
        head_cell: cn(
          'text-muted-foreground h-9 font-medium text-xs text-center rdp-head_cell'
        ),
        row: 'mt-1',
        cell: cn(
          'relative p-0 text-center text-sm h-10 rdp-cell',
          'focus-within:relative focus-within:z-20',
          '[&:has([aria-selected].day-range-end)]:rounded-r-md',
          '[&:has([aria-selected].day-outside)]:bg-accent/50',
          '[&:has([aria-selected])]:bg-accent',
          'first:[&:has([aria-selected])]:rounded-l-md',
          'last:[&:has([aria-selected])]:rounded-r-md'
        ),
        day: cn(
          'h-10 w-10 p-0 font-normal inline-flex items-center justify-center rounded-md transition-colors mx-auto',
          'hover:bg-primary/10 hover:text-primary cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'aria-selected:opacity-100'
        ),
        day_range_end: 'day-range-end',
        day_selected: cn(
          'bg-primary text-primary-foreground font-medium',
          'hover:bg-primary hover:text-primary-foreground',
          'focus:bg-primary focus:text-primary-foreground'
        ),
        day_today: 'bg-accent text-accent-foreground font-semibold',
        day_outside: 'day-outside text-muted-foreground/40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground/30 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground/30',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }