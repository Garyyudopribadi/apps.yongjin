'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Utensils, Shield } from 'lucide-react'
import DefaultBackground from '../components/layout/default-background'
import Header from '../components/common/header'
import ViewModeToggle from '../components/common/view-mode-toggle'
import Carousel from '../components/common/carousel'
import GridView from '../components/common/grid-view'
import MenuCard, { type MenuItem } from '../components/common/menu-card'

const menuItems: MenuItem[] = [
  {
    id: 1,
    title: "Yongjin Official Web",
    description: "Official website of PT.YONGJIN JAVASUKA GARMENT",
    icon: <img src="/yongjinlogo.png" alt="Yongjin Logo" className="w-12 h-12 object-contain" />,
    features: ["Company Information", "Products", "Contact Details", "Corporate News"],
    color: "from-blue-500 to-cyan-500",
    gradient: "from-blue-50 to-cyan-50",
    href: "https://yongjin.space/"
  },
  {
    id: 2,
    title: "Hojeon Internal App",
    description: "Internal application for Hojeon operations",
    icon: <img src="/icons/icon-256x256.png" alt="Hojeon Icon" className="w-12 h-12 object-contain" />,
    features: ["Employee Portal", "Internal Tools", "Resource Management", "Communication"],
    color: "from-blue-500 to-white-500",
    gradient: "from-blue-50 to-white-50",
    href: "https://app.yongjin.space/"
  },
  {
    id: 3,
    title: "Yongjin One - Survey Canteen",
    description: "Survey application for canteen facility voting",
    icon: <Utensils className="w-12 h-12" />,
    features: ["Voting System", "Real-time Results", "Data Export", "Employee Feedback"],
    color: "from-green-500 to-emerald-500",
    gradient: "from-green-50 to-emerald-50",
    href: "/yongjinone/survey/canteen"
  },
  {
    id: 4,
    title: "E-Training Safety Machine",
    description: "Safety training program for machine operations",
    icon: <Shield className="w-12 h-12" />,
    features: ["Safety Protocols", "Machine Training", "Quiz Assessment", "Certificate"],
    color: "from-red-500 to-orange-500",
    gradient: "from-red-50 to-orange-50",
    href: "/e-training/safety-machine"
  }
]

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel')
  const [isLoading, setIsLoading] = useState(true)
  const toggleRef = useRef<HTMLDivElement>(null)

  // Load view mode from localStorage and simulate loading
  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode') as 'carousel' | 'grid' | null
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  // Save view mode to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('viewMode', viewMode)
    }
  }, [viewMode, isLoading])

  // Focus on toggle when page loads
  useEffect(() => {
    if (!isLoading && toggleRef.current) {
      // Small delay to ensure animations are complete
      setTimeout(() => {
        toggleRef.current?.focus()
      }, 1000)
    }
  }, [isLoading])

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? menuItems.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === menuItems.length - 1 ? 0 : prevIndex + 1))
  }

  const handleCardAction = (item: MenuItem) => {
    if (item.id === 3) {
      window.location.href = "/yongjinone/survey/canteen"
    } else if (item.id === 4) {
      window.location.href = "/e-training/safety-machine"
    } else {
      // Simulate navigation or action
      console.log(`Navigating to ${item.title}`)
    }
  }

  const handleViewModeChange = (mode: 'carousel' | 'grid') => {
    setViewMode(mode)
  }

  // Loading state
  if (isLoading) {
    return (
      <DefaultBackground showFooter={true}>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
                PT.YONGJIN JAVASUKA GARMENT
              </h1>
              <p className="text-muted-foreground">Loading amazing services and solutions...</p>
            </div>
            <div className="w-64 space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Preparing your experience</p>
            </div>
          </div>
        </div>
      </DefaultBackground>
    )
  }

  return (
    <DefaultBackground showFooter={true}>
      <div className="flex flex-col items-center px-4 py-6">
        <Header>
          <motion.h1 
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-3 px-4 tracking-tight"
            style={{
              textShadow: '0 0 30px rgba(59, 130, 246, 0.2)',
              WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.1)'
            }}
          >
            PT.YONGJIN JAVASUKA GARMENT
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 120,
              damping: 18
            }}
            className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-4 font-medium leading-relaxed"
          >
            Discover amazing services and solutions to your needs
          </motion.p>
        </Header>

        {/* View Mode Toggle - positioned near menu items */}
        <motion.div
          ref={toggleRef}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.6, 
            delay: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 150,
            damping: 18
          }}
          className="mb-6 focus:outline-none focus:ring-4 focus:ring-blue-500/50 rounded-full"
          tabIndex={-1}
        >
          <ViewModeToggle 
            viewMode={viewMode} 
            onViewModeChange={handleViewModeChange} 
          />
        </motion.div>

        {/* Main Content */}
        <motion.main 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 80,
            damping: 20
          }}
          className="relative max-w-7xl mx-auto w-full"
        >
          {/* Carousel View */}
          {viewMode === 'carousel' && (
            <Carousel
              items={menuItems}
              currentIndex={currentIndex}
              onPrev={handlePrev}
              onNext={handleNext}
              onCardAction={handleCardAction}
            />
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <GridView
              items={menuItems}
              onCardAction={handleCardAction}
            />
          )}
        </motion.main>
      </div>
    </DefaultBackground>
  )
}