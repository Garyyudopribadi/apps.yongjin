'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@app/components/ui/button'
import MenuCard, { MenuItem } from './menu-card'

interface CarouselProps {
  items: MenuItem[]
  currentIndex: number
  onPrev: () => void
  onNext: () => void
  onCardAction: (item: MenuItem) => void
}

export default function Carousel({ items, currentIndex, onPrev, onNext, onCardAction }: CarouselProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [direction, setDirection] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return

    const interval = setInterval(() => {
      setDirection(1)
      onNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, isHovered, onNext])

  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.85,
      rotateY: direction > 0 ? 25 : -25,
      z: -150,
      filter: "blur(4px)"
    }),
    center: {
      zIndex: 10,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      z: 0,
      filter: "blur(0px)"
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.85,
      rotateY: direction < 0 ? 25 : -25,
      z: -150,
      filter: "blur(4px)"
    })
  }

  const sideCardVariants = {
    left: {
      x: -200,
      scale: 0.75,
      opacity: 0.4,
      rotateY: -15,
      z: -75,
      filter: "blur(2px)"
    },
    right: {
      x: 200,
      scale: 0.75,
      opacity: 0.4,
      rotateY: 15,
      z: -75,
      filter: "blur(2px)"
    }
  }

  const handleNext = () => {
    setDirection(1)
    onNext()
  }

  const handlePrev = () => {
    setDirection(-1)
    onPrev()
  }

  const handleIndicatorClick = (index: number) => {
    const diff = index - currentIndex
    setDirection(diff > 0 ? 1 : -1)
    for (let i = 0; i < Math.abs(diff); i++) {
      setTimeout(() => {
        if (diff > 0) onNext()
        else onPrev()
      }, i * 100)
    }
  }

  const getPrevIndex = () => (currentIndex === 0 ? items.length - 1 : currentIndex - 1)
  const getNextIndex = () => (currentIndex === items.length - 1 ? 0 : currentIndex + 1)

  // Touch/Swipe handlers for mobile
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrev()
    }
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Main Carousel Container */}
      <div 
        className="relative h-[400px] sm:h-[420px] flex items-center justify-center perspective-1000"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Side Cards */}
        <motion.div
          variants={sideCardVariants}
          animate="left"
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 120,
            damping: 25
          }}
          className="absolute w-full max-w-xs h-full"
        >
          <MenuCard 
            item={items[getPrevIndex()]} 
            onAction={() => onCardAction(items[getPrevIndex()])}
          />
        </motion.div>

        {/* Center Card */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { 
                type: "spring", 
                stiffness: 150, 
                damping: 30,
                mass: 0.8
              },
              opacity: { 
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
              },
              scale: { 
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
              },
              rotateY: { 
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
              },
              filter: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }}
            className="absolute w-full max-w-sm z-10 h-full"
          >
            <MenuCard 
              item={items[currentIndex]} 
              onAction={() => onCardAction(items[currentIndex])}
            />
          </motion.div>
        </AnimatePresence>

        <motion.div
          variants={sideCardVariants}
          animate="right"
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 120,
            damping: 25
          }}
          className="absolute w-full max-w-xs h-full"
        >
          <MenuCard 
            item={items[getNextIndex()]} 
            onAction={() => onCardAction(items[getNextIndex()])}
          />
        </motion.div>
      </div>

      {/* Navigation Buttons - Hidden on mobile/tablet */}
      <motion.div
        initial={{ opacity: 0, x: -30, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ 
          delay: 0.6,
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:block"
      >
        <motion.button
          onClick={handlePrev}
          whileHover={{ 
            scale: 1.15,
            rotate: -5,
            transition: { 
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 300,
              damping: 25
            }
          }}
          whileTap={{ 
            scale: 0.9,
            rotate: -10,
            transition: { duration: 0.1 }
          }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-xl hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden group"
        >
          {/* Enhanced glow effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-60 blur-lg transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rotating border effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner rotating border */}
          <motion.div
            className="absolute inset-1 rounded-full border border-white/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Icon container */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <ChevronLeft className="w-7 h-7 text-white drop-shadow-lg" />
          </div>
          
          {/* Sparkle effects */}
          <motion.div
            className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              delay: 0
            }}
          />
          <motion.div
            className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full"
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              delay: 1
            }}
          />
        </motion.button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 30, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ 
          delay: 0.6,
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:block"
      >
        <motion.button
          onClick={handleNext}
          whileHover={{ 
            scale: 1.15,
            rotate: 5,
            transition: { 
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 300,
              damping: 25
            }
          }}
          whileTap={{ 
            scale: 0.9,
            rotate: 10,
            transition: { duration: 0.1 }
          }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-xl hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden group"
        >
          {/* Enhanced glow effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-60 blur-lg transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rotating border effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner rotating border */}
          <motion.div
            className="absolute inset-1 rounded-full border border-white/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Icon container */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <ChevronRight className="w-7 h-7 text-white drop-shadow-lg" />
          </div>
          
          {/* Sparkle effects */}
          <motion.div
            className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute bottom-1 right-1 w-1 h-1 bg-white rounded-full"
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              delay: 1.5
            }}
          />
        </motion.button>
      </motion.div>

      {/* Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          delay: 0.8,
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: "spring",
          stiffness: 150,
          damping: 18
        }}
        className="flex justify-center space-x-3 mt-4"
      >
        {items.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => handleIndicatorClick(index)}
            whileHover={{ 
              scale: 1.2,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.9 }}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              index === currentIndex
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125 shadow-lg'
                : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
            }`}
          />
        ))}
      </motion.div>

      {/* Mobile Swipe Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="flex justify-center mt-2 md:hidden"
      >
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center space-x-1"
          >
            <span>Swipe</span>
            <ChevronLeft className="w-3 h-3" />
            <ChevronRight className="w-3 h-3" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}