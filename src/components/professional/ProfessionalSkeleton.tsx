'use client'

import { motion } from 'framer-motion'

export function ProfessionalSkeleton({
  type = 'card',
  rows = 3,
}: {
  type?: 'card' | 'table' | 'stat'
  rows?: number
}) {
  if (type === 'card') {
    return (
      <div className="animate-fade-in">
        <div className="card-professional p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="skeleton-professional w-20 h-6 rounded" />
            <div className="flex-1">
              <div className="skeleton-professional w-32 h-6 rounded mb-2" />
              <div className="skeleton-professional w-48 h-4 rounded" />
            </div>
          </div>
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 mb-3">
              <div className="skeleton-professional w-10 h-10 rounded" />
              <div className="flex-1">
                <div className="skeleton-professional w-full h-4 rounded mb-2" />
                <div className="skeleton-professional w-3/4 h-4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="animate-fade-in">
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <div className="bg-neutral-50 dark:bg-neutral-800 p-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-4">
              <div className="skeleton-professional w-8 h-4 rounded" />
              <div className="skeleton-professional w-24 h-4 rounded" />
              <div className="skeleton-professional w-20 h-4 rounded" />
              <div className="skeleton-professional w-24 h-4 rounded" />
              <div className="skeleton-professional w-32 h-4 rounded" />
            </div>
          </div>
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0">
              <div className="skeleton-professional w-10 h-10 rounded" />
              <div className="flex-1 space-y-2">
                <div className="skeleton-professional w-1/2 h-4 rounded" />
                <div className="skeleton-professional w-3/4 h-4 rounded" />
              </div>
              <div className="skeleton-professional w-16 h-8 rounded" />
              <div className="skeleton-professional w-16 h-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'stat') {
    return (
      <div className="animate-fade-in">
        <div className="card-professional p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="skeleton-professional w-20 h-5 rounded mb-2" />
              <div className="skeleton-professional w-32 h-4 rounded" />
            </div>
            <div className="skeleton-professional w-10 h-10 rounded-xl" />
          </div>
          <div className="skeleton-professional w-48 h-16 rounded" />
        </div>
      </div>
    )
  }

  return null
}
