'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(6, 'Phone number is required'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  hotelSlug: string
  experienceId: string
  sessionId?: string
  participants: number
  totalCents: number
  isRequest: boolean
  requestDate?: string
  requestTime?: string
}

export function CheckoutForm({
  hotelSlug,
  experienceId,
  sessionId,
  participants,
  totalCents,
  isRequest,
  requestDate,
  requestTime,
}: CheckoutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })
  
  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelSlug,
          experienceId,
          sessionId,
          participants,
          totalCents,
          isRequest,
          requestDate,
          requestTime,
          guestName: `${data.firstName} ${data.lastName}`,
          guestEmail: data.email,
          guestPhone: data.phone,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create reservation')
      }
      
      // Redirect to confirmation page
      router.push(`/${hotelSlug}/reservation/${result.reservationId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First name *
          </label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            className={cn('input', errors.firstName && 'border-red-300')}
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last name *
          </label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            className={cn('input', errors.lastName && 'border-red-300')}
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className={cn('input', errors.email && 'border-red-300')}
          disabled={isSubmitting}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone number *
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          className={cn('input', errors.phone && 'border-red-300')}
          disabled={isSubmitting}
          placeholder="+358 40 123 4567"
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          The provider may contact you about your booking
        </p>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'w-full btn-primary py-3 text-base',
          isSubmitting && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isSubmitting ? 'Sending...' : 'Send Booking Request'}
      </button>
      
      <p className="text-xs text-center text-gray-500">
        By submitting, you agree to our terms of service and privacy policy.
        You won't be charged until the provider accepts and you complete payment.
      </p>
    </form>
  )
}
