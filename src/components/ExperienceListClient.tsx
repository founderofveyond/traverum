'use client'

import { motion } from 'framer-motion'
import { ExperienceCard } from './ExperienceCard'
import { cn } from '@/lib/utils'
import type { ExperienceWithMedia } from '@/lib/hotels'
import type { EmbedMode } from '@/lib/utils'

interface ExperienceListClientProps {
  experiences: ExperienceWithMedia[]
  hotelSlug: string
  embedMode: EmbedMode
}

export function ExperienceListClient({ experiences, hotelSlug, embedMode }: ExperienceListClientProps) {
  return (
    <div className={cn(
      'grid gap-4 md:gap-6',
      embedMode === 'full' 
        ? 'grid-cols-1 md:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    )}>
      {experiences.map((experience, index) => (
        <motion.div
          key={experience.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ExperienceCard
            experience={experience}
            hotelSlug={hotelSlug}
            embedMode={embedMode}
          />
        </motion.div>
      ))}
    </div>
  )
}