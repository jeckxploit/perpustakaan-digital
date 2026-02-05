'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PremiumCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
  gradient?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export function PremiumCard({ children, className = '', hover = true, glass = false, gradient }: PremiumCardProps) {
  const getGradientClass = () => {
    if (!gradient) return ''
    return `bg-gradient-to-br from-${gradient}-500/10 to-${gradient}-600/5 border-${gradient}-500/20`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.3 }}
      className={hover ? 'card-hover' : ''}
    >
      <Card
        className={`relative overflow-hidden ${glass ? 'glass-card' : ''} ${getGradientClass()} ${className}`}
      >
        {gradient && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br opacity-50"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {children}
      </Card>
    </motion.div>
  )
}

interface PremiumCardHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function PremiumCardHeader({ title, description, icon, action }: PremiumCardHeaderProps) {
  return (
    <CardHeader className="relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>}
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription className="text-sm">{description}</CardDescription>}
          </div>
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    </CardHeader>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  positive?: boolean
  icon?: ReactNode
}

export function StatCard({ title, value, change, positive, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-hover"
    >
      <div className="relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.p
                key={value}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold mt-1"
              >
                {value}
              </motion.p>
            </div>
            {icon && (
              <motion.div
                className="p-3 bg-primary/10 rounded-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {icon}
              </motion.div>
            )}
          </div>
          {change && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-sm"
            >
              <span className={positive ? 'text-green-600' : 'text-red-600'}>
                {change}
              </span>
              <span className="text-muted-foreground">dari bulan lalu</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
