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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="flex justify-center mt-6"
    >
      <div className="inline-flex rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 border border-slate-200 dark:border-slate-700">
        <Button
          variant={viewMode === 'carousel' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('carousel')}
          className="px-3 py-2 text-xs sm:text-sm"
        >
          <Layout className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Carousel</span>
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className="px-3 py-2 text-xs sm:text-sm"
        >
          <Grid className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Grid</span>
        </Button>
      </div>
    </motion.div>
  )
}