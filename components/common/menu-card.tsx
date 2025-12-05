'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card'
import { Button } from '@app/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface MenuItem {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  color: string
  gradient: string
  stats?: { label: string; value: string }[]
  href?: string
}

export type { MenuItem }

interface MenuCardProps {
  item: MenuItem
  onAction: () => void
}

export default function MenuCard({ item, onAction }: MenuCardProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 mx-auto max-w-md sm:max-w-none" onClick={onAction}>
      <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-r ${item.color} text-white flex items-center justify-center shadow-md`}
        >
          {item.icon}
        </motion.div>
        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3">
          {item.title}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {item.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        {/* Action Button */}
        <div className="flex justify-center pt-2 sm:pt-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {item.href ? (
              <Link href={item.href}>
                <Button 
                  className={`bg-gradient-to-r ${item.color} hover:shadow-lg transform transition-all duration-200 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium`}
                  size="lg"
                >
                  Get Started <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button 
                className={`bg-gradient-to-r ${item.color} hover:shadow-lg transform transition-all duration-200 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium`}
                size="lg"
                onClick={(e) => {
                  e.stopPropagation()
                  onAction()
                }}
              >
                Get Started <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
              </Button>
            )}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}