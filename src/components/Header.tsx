'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()

  const returnUrl = searchParams.get('returnUrl')
  const homeHref = returnUrl
    ? `/${hotelSlug}?returnUrl=${encodeURIComponent(returnUrl)}`
    : `/${hotelSlug}`

  const isSafeHttpUrl = (url: string) => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleBack = () => {
    // Prefer returning to the hotel site (when embedded)
    if (returnUrl && isSafeHttpUrl(returnUrl)) {
      window.location.assign(returnUrl)
      return
    }

    if (backTo) {
      if (isSafeHttpUrl(backTo)) {
        window.location.assign(backTo)
      } else {
        router.push(backTo)
      }
    } else {
      router.back()
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="container flex items-center h-14 px-4 gap-2">
        {showBack && (
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-2 h-10 -ml-2 rounded-button hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">Back</span>
          </button>
        )}

        <Link href={homeHref} className="flex items-center gap-3">
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
      </div>
    </header>
  )
}