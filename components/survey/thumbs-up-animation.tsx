'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp } from 'lucide-react'

interface ThumbsUpAnimationProps {
  trigger: boolean
}

export default function ThumbsUpAnimation({ trigger }: ThumbsUpAnimationProps) {
  const thumbs = Array.from({ length: 6 }, (_, i) => i)

  return (
    <AnimatePresence>
      {trigger && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {thumbs.map((i) => (
            <motion.div
              key={i}
              initial={{ 
                scale: 0,
                x: 0,
                y: 0,
                rotate: 0
              }}
              animate={{
                scale: [0, 1.5, 0.8, 0],
                x: (Math.random() - 0.5) * 300,
                y: -Math.random() * 400 - 100,
                rotate: Math.random() * 360 - 180
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: "easeOut"
              }}
              className="absolute"
            >
              <ThumbsUp 
                className="w-8 h-8 text-blue-500" 
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}