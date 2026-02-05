'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ProfessionalEmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  features?: string[]
  className?: string
}

export function ProfessionalEmptyState({
  icon,
  title,
  description,
  action,
  features = [],
  className = '',
}: ProfessionalEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center py-20 px-8 text-center ${className}`}
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl" />
            <div className="relative p-6 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              {icon}
            </div>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed max-w-lg mx-auto"
        >
          {description}
        </motion.p>

        {action && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className="button-professional px-8 py-3 text-base"
          >
            {action.label}
          </motion.button>
        )}

        {features.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 6L9 17l-5-5 5-5M4 6l5 5 5-5" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {feature}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
