'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface PremiumStatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'blue' | 'pink' | 'orange'
  format?: 'number' | 'currency' | 'percentage'
  urgent?: boolean
  suffix?: string
  gradient?: boolean
}

const colorMap = {
  primary: {
    bg: 'from-indigo-500/10 to-purple-500/10',
    icon: 'text-indigo-500',
    text: 'text-indigo-500',
    border: 'border-indigo-500/20',
  },
  secondary: {
    bg: 'from-emerald-500/10 to-teal-500/10',
    icon: 'text-emerald-500',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
  },
  success: {
    bg: 'from-green-500/10 to-emerald-500/10',
    icon: 'text-green-500',
    text: 'text-green-500',
    border: 'border-green-500/20',
  },
  warning: {
    bg: 'from-amber-500/10 to-orange-500/10',
    icon: 'text-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
  },
  error: {
    bg: 'from-red-500/10 to-rose-500/10',
    icon: 'text-red-500',
    text: 'text-red-500',
    border: 'border-red-500/20',
  },
  info: {
    bg: 'from-cyan-500/10 to-blue-500/10',
    icon: 'text-cyan-500',
    text: 'text-cyan-500',
    border: 'border-cyan-500/20',
  },
  purple: {
    bg: 'from-purple-500/10 to-pink-500/10',
    icon: 'text-purple-500',
    text: 'text-purple-500',
    border: 'border-purple-500/20',
  },
  blue: {
    bg: 'from-blue-500/10 to-indigo-500/10',
    icon: 'text-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
  },
  pink: {
    bg: 'from-pink-500/10 to-rose-500/10',
    icon: 'text-pink-500',
    text: 'text-pink-500',
    border: 'border-pink-500/20',
  },
  orange: {
    bg: 'from-orange-500/10 to-amber-500/10',
    icon: 'text-orange-500',
    text: 'text-orange-500',
    border: 'border-orange-500/20',
  },
}

export function PremiumStatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  format = 'number',
  urgent = false,
  suffix = '',
  gradient = true,
}: PremiumStatsCardProps) {
  const colors = colorMap[color]
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return `Rp ${val.toLocaleString('id-ID')}`
      case 'percentage':
        return `${val.toLocaleString('id-ID')}%`
      default:
        return val.toLocaleString('id-ID')
    }
  }

  const isPositiveTrend = trend?.startsWith('+')
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown
  const ArrowIcon = isPositiveTrend ? ArrowUpRight : ArrowDownRight

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`relative overflow-hidden ${gradient ? 'card-hover' : ''} ${
          urgent ? 'border-red-500/50' : ''
        }`}
      >
        {/* Animated Gradient Background */}
        {gradient && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-50`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Corner Decoration */}
        <div
          className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${colors.bg} rounded-full opacity-60`}
        />

        <CardContent className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </h3>
              <motion.div
                key={value}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className={`text-3xl font-bold ${colors.text} ${urgent ? 'animate-pulse' : ''}`}>
                  {formatValue(value)}
                  {suffix && (
                    <span className="text-lg font-normal text-muted-foreground ml-1">
                      {suffix}
                    </span>
                  )}
                </p>
              </motion.div>
            </div>

            <motion.div
              className={`p-3 rounded-xl ${gradient ? colors.bg : colors.bg} ${colors.icon}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>

          {/* Trend Indicator */}
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
                  isPositiveTrend ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                }`}
              >
                <ArrowIcon className="h-3.5 w-3.5" />
                <TrendIcon className="h-3.5 w-3.5" />
              </div>
              <span className={`text-sm font-medium ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </span>
              <span className="text-sm text-muted-foreground">
                bulan lalu
              </span>
            </motion.div>
          )}

          {/* Progress Bar for Visual Appeal */}
          {!trend && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className={`h-1 rounded-full bg-gradient-to-r ${colors.bg.replace('/10', '')}/20`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${colors.bg.replace('/10', '')}`}
              />
            </motion.div>
          )}
        </CardContent>

        {/* Shine Effect */}
        {gradient && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 2 }}
          />
        )}
      </Card>
    </motion.div>
  )
}
