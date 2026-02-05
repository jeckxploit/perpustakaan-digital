'use client'

import { Button } from '@/components/ui/button'
import { LucideIcon, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  features?: string[]
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  features = [],
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center"
        >
          <Icon className="h-16 w-16 text-primary" />
        </motion.div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="absolute -top-2 -right-2 w-12 h-12 bg-success/10 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="h-6 w-6 text-success" />
        </motion.div>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl font-semibold mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-muted-foreground max-w-md mb-6"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button onClick={onAction} size="lg" className="shadow-lg">
          <CheckCircle className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      </motion.div>

      {features.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
        >
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>{feature}</span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
