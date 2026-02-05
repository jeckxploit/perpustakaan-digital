'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ProfessionalCardProps {
  children: ReactNode
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  hover?: boolean
  noPadding?: boolean
}

export function ProfessionalCard({
  children,
  title,
  description,
  action,
  className = '',
  hover = true,
  noPadding = false,
}: ProfessionalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={hover ? 'hover-lift' : ''}
    >
      <div className={`card-professional ${className}`}>
        {(title || description) && (
          <div className={`p-6 border-b border-neutral-200 ${noPadding ? 'pb-4' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {title && (
                  <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-neutral-600">
                    {description}
                  </p>
                )}
              </div>
              {action && <div className="ml-4">{action}</div>}
            </div>
          </div>
        )}
        <div className={noPadding ? '' : 'p-6'}>
          {children}
        </div>
      </div>
    </motion.div>
  )
}
