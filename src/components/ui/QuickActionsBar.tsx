'use client'

import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface QuickActionButton {
  icon: LucideIcon
  label: string
  onClick: () => void
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
}

interface QuickActionsBarProps {
  actions: QuickActionButton[]
}

export function QuickActionsBar({ actions }: QuickActionsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border mb-6"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground flex-shrink-0">
        <svg
          className="h-4 w-4 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        Aksi Cepat:
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
          >
            <Button
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              className="flex items-center gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
