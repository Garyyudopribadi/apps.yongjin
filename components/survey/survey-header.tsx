'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Utensils } from 'lucide-react'

interface SurveyHeaderProps {
  title?: string
  subtitle?: string
  Icon?: LucideIcon
}

export default function SurveyHeader({
  title = 'Survey Kantin Yongjin',
  subtitle = 'Pilih fasilitas kantin pilihan Anda',
  Icon = Utensils,
}: SurveyHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-4"
    >
      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </h1>
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
        {subtitle}
      </p>
    </motion.div>
  )
}