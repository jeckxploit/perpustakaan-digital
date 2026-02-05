'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'accent-purple' | 'accent-blue' | 'accent-pink' | 'accent-orange'
  format?: 'number' | 'currency' | 'percentage'
  urgent?: boolean
  suffix?: string
}

const colorMap = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
  'accent-purple': 'text-purple-500',
  'accent-blue': 'text-blue-500',
  'accent-pink': 'text-pink-500',
  'accent-orange': 'text-orange-500',
}

const bgColorMap = {
  primary: 'bg-primary/10',
  secondary: 'bg-secondary/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  error: 'bg-error/10',
  info: 'bg-info/10',
  'accent-purple': 'bg-purple-500/10',
  'accent-blue': 'bg-blue-500/10',
  'accent-pink': 'bg-pink-500/10',
  'accent-orange': 'bg-orange-500/10',
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  format = 'number',
  urgent = false,
  suffix = '',
}: StatsCardProps) {
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

  const getTrendIcon = () => {
    if (!trend) return null
    const isPositive = trend.startsWith('+')
    return isPositive ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : (
      <TrendingDown className="h-4 w-4 text-error" />
    )
  }

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground'
    return trend.startsWith('+') ? 'text-success' : 'text-error'
  }

  return (
    <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${
      urgent ? 'border-error/50' : ''
    }`}>
      {/* Gradient background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgColorMap[color]} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            {title}
          </div>
          <div className={`p-2 ${bgColorMap[color]} rounded-lg`}>
            <Icon className={`h-5 w-5 ${colorMap[color]}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${urgent ? 'text-error' : colorMap[color]}`}>
            {formatValue(value)}
            {suffix && <span className="text-lg font-normal text-muted-foreground ml-1">{suffix}</span>}
          </span>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-sm">
            {getTrendIcon()}
            <span className={getTrendColor()}>{trend}</span>
            <span className="text-muted-foreground">dari bulan lalu</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
