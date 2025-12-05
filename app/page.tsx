'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Utensils } from 'lucide-react'
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
    href: "https://yongjin.space/",
    stats: [
      { label: "Established", value: "2020" },
      { label: "Employees", value: "500+" },
      { label: "Locations", value: "3" }
    ]
  },
  {
    id: 2,
    title: "Hojeon Internal App",
    description: "Internal application for Hojeon operations",
    icon: <img src="/icons/icon-256x256.png" alt="Hojeon Icon" className="w-12 h-12 object-contain" />,
    features: ["Employee Portal", "Internal Tools", "Resource Management", "Communication"],
    color: "from-blue-500 to-white-500",
    gradient: "from-blue-50 to-white-50",
    href: "https://app.yongjin.space/",
    stats: [
      { label: "Users", value: "200+" },
      { label: "Modules", value: "15+" },
      { label: "Uptime", value: "99.9%" }
    ]
  },
  {
    id: 3,
    title: "Yongjin One - Survey Canteen",
    description: "Survey application for canteen facility voting",
    icon: <Utensils className="w-12 h-12" />,
    features: ["Voting System", "Real-time Results", "Data Export", "Employee Feedback"],
    color: "from-green-500 to-emerald-500",
    gradient: "from-green-50 to-emerald-50",
    href: "/yongjinone/survey/canteen",
    stats: [
      { label: "Participants", value: "150+" },
      { label: "Options", value: "2" },
      { label: "Completion Rate", value: "95%" }
    ]
  }
]

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel')
  const [isLoading, setIsLoading] = useState(true)

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

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? menuItems.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === menuItems.length - 1 ? 0 : prevIndex + 1))
  }

  const handleCardAction = (item: MenuItem) => {
    if (item.id === 3) {
      window.location.href = "/yongjinone/survey/canteen"
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
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
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
      <Header>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4 px-4"
        >
          PT.YONGJIN JAVASUKA GARMENT
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-4"
        >
          Discover amazing services and solutions to your needs
        </motion.p>
        
        <ViewModeToggle 
          viewMode={viewMode} 
          onViewModeChange={handleViewModeChange} 
        />
      </Header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
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
      </main>
    </DefaultBackground>
  )
}