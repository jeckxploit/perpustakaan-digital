'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface MobileNavItem {
  value: string
  label: string
  icon: LucideIcon
}

interface MobileNavProps {
  items: MobileNavItem[]
  activeTab: string
  onTabChange: (value: string) => void
}

export function MobileNav({ items, activeTab, onTabChange }: MobileNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t z-50 safe-area-bottom shadow-lg">
      <div className="grid grid-cols-6 gap-0 p-1">
        {items.map((item, index) => {
          const isActive = activeTab === item.value
          return (
            <motion.button
              key={item.value}
              onClick={() => onTabChange(item.value)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'text-primary bg-gradient-to-t from-primary/10 to-transparent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              whileTap={{ scale: 0.95 }}
              initial={false}
              animate={{ scale: isActive ? 1 : 1 }}
            >
              {/* Background glow for active state */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"
                  layoutId="mobileNavGlow"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                className="relative"
                animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3, delay: isActive ? 0 : 0 }}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
              </motion.div>

              {/* Label */}
              <span className={`text-xs font-medium mt-0.5 ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-0.5 bg-background/50" />
    </div>
  )
}
