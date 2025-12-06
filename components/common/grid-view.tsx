'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import MenuCard, { MenuItem } from '@app/components/common/menu-card'

interface GridViewProps {
  items: MenuItem[]
  onCardAction: (item: MenuItem) => void
}

export default function GridView({ items, onCardAction }: GridViewProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 60, 
      scale: 0.8,
      rotateX: -20,
      filter: "blur(8px)"
    },
    visible: {
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        mass: 0.8,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          whileHover={{ 
            scale: 1.08,
            rotateY: hoveredIndex === index ? 8 : 0,
            rotateX: hoveredIndex === index ? 2 : 0,
            z: 60,
            transition: {
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 200,
              damping: 25
            }
          }}
          whileTap={{ 
            scale: 0.95,
            transition: { duration: 0.15 }
          }}
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
          className="relative group h-full"
          style={{
            perspective: '1200px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Background glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            initial={{ scale: 0.8 }}
            whileHover={{ 
              scale: 1.2,
              transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
            }}
          />

          {/* Card container with enhanced styling */}
          <motion.div
            className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden"
            whileHover={{ 
              boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.3)",
              borderColor: "rgba(59, 130, 246, 0.4)",
              transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
            }}
            style={{
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Animated border */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `conic-gradient(from 0deg, transparent, ${item.color.replace('from-', '').replace('to-', '')}, transparent)`,
                padding: '2px'
              }}
              initial={{ opacity: 0 }}
              whileHover={{ 
                opacity: 1,
                transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
            >
              <div className="w-full h-full bg-white dark:bg-slate-800 rounded-2xl" />
            </motion.div>

            {/* Content */}
            <div className="relative p-0.5">
              <MenuCard 
                item={item} 
                onAction={() => onCardAction(item)}
              />
            </div>

            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none"
              initial={false}
              whileHover={{
                opacity: 1,
                transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
            />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )
}