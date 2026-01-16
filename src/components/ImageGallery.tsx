'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Media } from '@/lib/supabase/types'

interface ImageGalleryProps {
  images: Media[]
  fallbackImage?: string | null
  title: string
}

export function ImageGallery({ images, fallbackImage, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  
  // Combine media with fallback
  const allImages = images.length > 0 
    ? images 
    : fallbackImage 
      ? [{ id: 'fallback', url: fallbackImage }] as any[]
      : []
  
  if (allImages.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 rounded-xl flex items-center justify-center">
        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }
  
  const activeImage = allImages[activeIndex]
  
  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div 
          className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={activeImage.url}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          
          {/* Expand icon */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
          
          {/* Image counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full">
              {activeIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
        
        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all',
                  index === activeIndex 
                    ? 'ring-2 ring-primary ring-offset-2' 
                    : 'opacity-70 hover:opacity-100'
                )}
              >
                <Image
                  src={image.url}
                  alt={`${title} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={allImages}
          initialIndex={activeIndex}
          title={title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

interface LightboxProps {
  images: { id: string; url: string }[]
  initialIndex: number
  title: string
  onClose: () => void
}

function Lightbox({ images, initialIndex, title, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  
  const goNext = () => setIndex((i) => (i + 1) % images.length)
  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* Image */}
      <div 
        className="relative max-w-[90vw] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index].url}
          alt={`${title} ${index + 1}`}
          width={1200}
          height={800}
          className="object-contain max-h-[85vh]"
          sizes="90vw"
        />
      </div>
      
      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
