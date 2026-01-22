'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface HeaderProps {
  hotelName: string
  logoUrl: string | null
  hotelSlug: string
  showBack?: boolean
  backTo?: string
}

export function Header({ hotelName, logoUrl, hotelSlug, showBack = false, backTo }: HeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backTo) {
      router.push(backTo)
    } else {
      router.back()
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="container flex items-center h-14 px-4">
        {showBack ? (
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-button hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        ) : (
          <Link href={`/${hotelSlug}`} className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={hotelName}
                width={32}
                height={32}
                className="rounded-lg object-contain"
              />
            ) : null}
            <h1 className="text-lg text-foreground">{hotelName}</h1>
          </Link>
        )}
      </div>
    </header>
  )
}