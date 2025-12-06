'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card'
import { Button } from '@app/components/ui/button'
import { CheckCircle, Star, Zap, Shield, Users, BarChart3, Settings, Globe, Database } from 'lucide-react'

interface MenuItem {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  color: string
  gradient: string
  href?: string
}

export type { MenuItem }

interface MenuCardProps {
  item: MenuItem
  onAction: () => void
}

const getFeatureIcon = (feature: string) => {
  const featureLower = feature.toLowerCase()
  if (featureLower.includes('company') || featureLower.includes('information')) return Globe
  if (featureLower.includes('products') || featureLower.includes('corporate')) return Star
  if (featureLower.includes('contact')) return Users
  if (featureLower.includes('employee') || featureLower.includes('portal')) return Shield
  if (featureLower.includes('tools') || featureLower.includes('management')) return Settings
  if (featureLower.includes('communication')) return Zap
  if (featureLower.includes('voting') || featureLower.includes('survey')) return BarChart3
  if (featureLower.includes('results') || featureLower.includes('real-time')) return Database
  if (featureLower.includes('export') || featureLower.includes('data')) return CheckCircle
  if (featureLower.includes('feedback')) return Star
  return CheckCircle // default
}

const getFeatureColor = (index: number) => {
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-blue-500',
    'from-teal-500 to-green-500'
  ]
  return colors[index % colors.length]
}

export default function MenuCard({ item, onAction }: MenuCardProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 mx-auto h-full flex flex-col min-h-[360px] sm:min-h-[380px]" onClick={onAction}>
      <CardHeader className="text-center pb-1.5 sm:pb-2 px-3 sm:px-4 flex-shrink-0">
        <motion.div 
          initial={{ scale: 0, rotate: -180, filter: "blur(4px)" }}
          animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
          transition={{ 
            delay: 0.3, 
            type: "spring", 
            stiffness: 180, 
            damping: 20,
            mass: 0.8,
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          whileHover={{ 
            scale: 1.15,
            rotate: 8,
            transition: { 
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 300,
              damping: 25
            }
          }}
          className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-xl bg-gradient-to-r ${item.color} text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group`}
        >
          {/* Icon glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300`} />
          <div className="relative z-10">
            {item.icon}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CardTitle className="text-base sm:text-lg md:text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-1.5 sm:mb-2 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent leading-tight">
            {item.title}
          </CardTitle>
          <CardDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-xs mx-auto">
            {item.description}
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 pb-2 flex flex-col flex-grow min-h-0">
        {/* Features */}
        <div className="flex-grow flex flex-col min-h-0">
          <motion.h4 
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.5,
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 150,
              damping: 18
            }}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center mb-1.5 flex-shrink-0"
          >
            <Star className="w-3 h-3 mr-1.5 text-yellow-500" />
            Features
          </motion.h4>
          <div className="flex flex-col gap-1.5 flex-grow min-h-0 overflow-hidden">
            {item.features.map((feature, index) => {
              const IconComponent = getFeatureIcon(feature)
              const gradientColor = getFeatureColor(index)
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  transition={{ 
                    delay: 0.6 + index * 0.1,
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    mass: 0.6,
                    duration: 0.7,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { 
                      duration: 0.2,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }
                  }}
                  className="group relative flex-shrink-0"
                >
                  {/* Background glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor} opacity-0 group-hover:opacity-8 rounded-md blur-sm transition-opacity duration-200`} />
                  
                  {/* Feature card */}
                  <div className="relative bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm border border-slate-200/40 dark:border-slate-600/40 rounded-md p-1.5 shadow-sm hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center space-x-2">
                      {/* Icon with gradient background */}
                      <div className={`flex-shrink-0 w-5 h-5 rounded bg-gradient-to-r ${gradientColor} flex items-center justify-center shadow-sm`}>
                        <IconComponent className="w-2.5 h-2.5 text-white" />
                      </div>
                      
                      {/* Feature text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200 leading-tight">
                          {feature}
                        </p>
                      </div>
                      
                      {/* Decorative element */}
                      <div className={`w-0.5 h-3 rounded-full bg-gradient-to-r ${gradientColor} opacity-50 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0`} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-1.5 flex-shrink-0">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.8 + item.features.length * 0.1,
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 150,
              damping: 18
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="relative group w-full"
          >
            {/* Enhanced button glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-40 rounded-lg blur-lg transition-opacity duration-300`} />
            <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 rounded-lg blur-md transition-opacity duration-200`} />
            
            {item.href ? (
              <Link href={item.href} className="block">
                <Button 
                  className={`relative bg-gradient-to-r ${item.color} hover:shadow-2xl transform transition-all duration-300 text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold w-full rounded-lg shadow-lg border-0 overflow-hidden group`}
                  size="sm"
                >
                  {/* Enhanced button inner effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  
                  <span className="relative z-10 flex items-center justify-center">
                    Get Started
                  </span>
                </Button>
              </Link>
            ) : (
              <Button 
                className={`relative bg-gradient-to-r ${item.color} hover:shadow-2xl transform transition-all duration-300 text-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold w-full rounded-lg shadow-lg border-0 overflow-hidden group`}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAction()
                }}
              >
                {/* Enhanced button inner effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                
                <span className="relative z-10 flex items-center justify-center">
                  Get Started
                </span>
              </Button>
            )}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}