'use client'

import { Button } from '@/components/ui/button'
import { LucideIcon, CheckCircle, Sparkles, Zap, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

interface PremiumEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  features?: string[]
  badge?: string
  showConfetti?: boolean
}

export function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  features = [],
  badge,
  showConfetti = false,
}: PremiumEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center relative"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Badge */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg">
            {badge}
          </span>
        </motion.div>
      )}

      {/* Icon Container */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="relative mb-8"
      >
        <div className="relative">
          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Main Icon */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center shadow-2xl border border-primary/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <Icon className="h-16 w-16 text-primary" />
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CheckCircle className="h-6 w-6 text-white" />
            </motion.div>

            <motion.div
              className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Title & Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 max-w-lg"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 mb-10"
      >
        <motion.button
          onClick={onAction}
          className="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <span className="relative flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {actionLabel}
          </span>
        </motion.button>
      </motion.div>

      {/* Features Grid */}
      {features.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="flex flex-col items-center gap-3 p-4 bg-card/50 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                {index === 0 && <Zap className="h-6 w-6 text-primary" />}
                {index === 1 && <Shield className="h-6 w-6 text-secondary" />}
                {index === 2 && <Sparkles className="h-6 w-6 text-purple-500" />}
              </div>
              <p className="text-sm font-medium text-center">{feature}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Bottom Decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-12 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <motion.div
          className="w-8 h-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </motion.div>
        <span>Mulai sekarang dan kelola dengan mudah</span>
      </motion.div>
    </motion.div>
  )
}
