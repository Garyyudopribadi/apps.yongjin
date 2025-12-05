'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard } from 'lucide-react'

interface DashboardButtonProps {
  onClick: () => void
  showModal: boolean
}

export default function DashboardButton({ onClick, showModal }: DashboardButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: showModal ? 1 : 0, 
        scale: showModal ? 1 : 0 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      aria-label="Dashboard Access"
    >
      <LayoutDashboard className="w-6 h-6" />
    </motion.button>
  )
}