'use client'

import Image from 'next/image'
import Link from 'next/link'

interface HeaderProps {
  hotelName: string
  logoUrl: string | null
  hotelSlug: string
}

export function Header({ hotelName, logoUrl, hotelSlug }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Link href={`/${hotelSlug}`} className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={hotelName}
              width={40}
              height={40}
              className="rounded-lg object-contain"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
              {hotelName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{hotelName}</h1>
            <p className="text-xs text-gray-500">Local Experiences</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
