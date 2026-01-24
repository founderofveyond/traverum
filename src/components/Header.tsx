'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const returnUrl = searchParams.get('returnUrl')
  const homeHref = returnUrl
    ? `/${hotelSlug}?returnUrl=${encodeURIComponent(returnUrl)}`
    : `/${hotelSlug}`

  const allExperiencesHref = returnUrl
    ? `/${hotelSlug}?embed=full&returnUrl=${encodeURIComponent(returnUrl)}`
    : `/${hotelSlug}?embed=full`

  const isOnExperiencesPage = pathname === `/${hotelSlug}`

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
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2 min-w-0">
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

          <Link href={homeHref} className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={hotelName}
                width={32}
                height={32}
                className="rounded-lg object-contain"
              />
            ) : null}
            <h1 className="text-lg text-foreground truncate">{hotelName}</h1>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {isOnExperiencesPage ? (
            <span
              className="inline-flex items-center h-10 px-3 rounded-button border border-border bg-muted text-sm font-medium text-foreground/70 cursor-default select-none"
              aria-current="page"
            >
              All experiences
            </span>
          ) : (
            <Link
              href={allExperiencesHref}
              className="inline-flex items-center h-10 px-3 rounded-button border border-border bg-background hover:bg-muted transition-colors text-sm font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="All experiences"
            >
              All experiences
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}