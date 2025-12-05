'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Footer from './footer'

interface DefaultBackgroundProps {
  children: React.ReactNode
  className?: string
  showFooter?: boolean
}

export default function DefaultBackground({ children, className = '', showFooter = false }: DefaultBackgroundProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden ${className}`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => {
          // Use deterministic values based on index to avoid hydration mismatch
          const positions = [
            { left: '20%', top: '50%' },
            { left: '80%', top: '30%' },
            { left: '90%', top: '70%' },
            { left: '10%', top: '80%' },
            { left: '60%', top: '20%' },
            { left: '40%', top: '90%' }
          ]
          
          return (
            <motion.div
              key={i}
              className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-200/20 to-purple-200/20 dark:from-blue-900/10 dark:to-purple-900/10"
              style={positions[i]}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )
        })}
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex-1">
        {children}
      </div>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  )
}