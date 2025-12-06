'use client'

import { motion } from 'framer-motion'
import { Button } from '@app/components/ui/button'
import { Layout, Grid } from 'lucide-react'

interface ViewModeToggleProps {
  viewMode: 'carousel' | 'grid'
  onViewModeChange: (mode: 'carousel' | 'grid') => void
}

export default function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="flex justify-center"
    >
      <div className="inline-flex rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-1">
        <Button
          variant={viewMode === 'carousel' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('carousel')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
            viewMode === 'carousel'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
          }`}
        >
          <Layout className="w-4 h-4 mr-2" />
          Carousel
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
            viewMode === 'grid'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
          }`}
        >
          <Grid className="w-4 h-4 mr-2" />
          Grid
        </Button>
      </div>
    </motion.div>
  )
}