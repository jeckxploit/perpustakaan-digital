'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
  description?: string
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
    border: 'border-blue-200 dark:border-blue-800',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-900 dark:text-emerald-100',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  orange: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-900 dark:text-amber-100',
    border: 'border-amber-200 dark:border-amber-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-900 dark:text-red-100',
    border: 'border-red-200 dark:border-red-800',
  },
  purple: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
    text: 'text-indigo-900 dark:text-indigo-100',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
}

export function ProfessionalStatCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  description,
}: StatCardProps) {
  const colors = colorClasses[color]
  const isPositive = trend?.startsWith('+')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card-professional">
        <CardContent>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">
                {title}
              </p>
              <motion.div
                key={value}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
                </p>
              </motion.div>
            </div>
            <motion.div
              className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          </div>

          {description && (
            <p className="text-sm text-neutral-600 mb-4">
              {description}
            </p>
          )}

          {trend && (
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isPositive
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}
              >
                <svg
                  className={`w-3 h-3 ${
                    isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isPositive ? (
                    <path d="M7 14l5-5 5-5" />
                  ) : (
                    <path d="M17 7l-10 10M7 17V7" />
                  )}
                </svg>
              </div>
              <span
                className={`text-sm font-medium ${
                  isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {trend}
              </span>
              <span className="text-sm text-neutral-500">
                bulan lalu
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
