'use client'

import { motion } from 'framer-motion'

interface HeaderProps {
  children: React.ReactNode
}

export default function Header({ children }: HeaderProps) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative px-3 sm:px-4 py-4 sm:py-6 text-center"
    >
      {children}
    </motion.header>
  )
}