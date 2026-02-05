'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface TableCardViewProps<T> {
  data: T[]
  renderItem: (item: T) => {
    title: string
    subtitle?: string
    status?: { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }
    fields: { label: string; value: string }[]
    actions?: { edit: () => void; delete: () => void }
  }
  emptyMessage?: string
}

export function TableCardView<T>({
  data,
  renderItem,
  emptyMessage = 'Tidak ada data',
}: TableCardViewProps<T>) {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 text-muted-foreground"
      >
        {emptyMessage}
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const { title, subtitle, status, fields, actions } = renderItem(item)
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{title}</h4>
                    {subtitle && (
                      <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
                    )}
                  </div>
                  {status && (
                    <Badge variant={status.variant || 'default'} className="ml-2 flex-shrink-0">
                      {status.label}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  {fields.map((field, fieldIndex) => (
                    <div key={fieldIndex}>
                      <span className="text-muted-foreground">{field.label}:</span>
                      <span className="ml-1 font-medium">{field.value}</span>
                    </div>
                  ))}
                </div>

                {actions && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={actions.edit}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={actions.delete}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
