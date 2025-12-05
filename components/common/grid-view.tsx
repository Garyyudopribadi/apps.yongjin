'use client'

import { motion } from 'framer-motion'
import MenuCard, { MenuItem } from '@app/components/common/menu-card'

interface GridViewProps {
  items: MenuItem[]
  onCardAction: (item: MenuItem) => void
}

export default function GridView({ items, onCardAction }: GridViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.03 }}
          className="w-full"
        >
          <MenuCard 
            item={item} 
            onAction={() => onCardAction(item)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}