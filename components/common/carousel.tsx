'use client'

import { useState } from 'react'
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

  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45
    })
  }

  const [direction, setDirection] = useState(0)

  const handleNext = () => {
    setDirection(1)
    onNext()
  }

  const handlePrev = () => {
    setDirection(-1)
    onPrev()
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-center">
        <div className="relative w-full max-w-2xl sm:max-w-3xl h-[350px] sm:h-[400px] md:h-[450px] flex items-center justify-center perspective-1000">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                rotateY: { duration: 0.6 }
              }}
              className="absolute w-full px-4 sm:px-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <MenuCard 
                item={items[currentIndex]} 
                onAction={() => onCardAction(items[currentIndex])}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons - Hidden on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 hidden sm:block"
      >
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          onClick={handlePrev}
          onMouseEnter={() => setIsHovered(false)}
          onMouseLeave={() => setIsHovered(true)}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 hidden sm:block"
      >
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          onClick={handleNext}
          onMouseEnter={() => setIsHovered(false)}
          onMouseLeave={() => setIsHovered(true)}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </motion.div>

      {/* Mobile Navigation Buttons */}
      <div className="flex justify-between items-center mt-6 sm:hidden px-4">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={handlePrev}
          onMouseEnter={() => setIsHovered(false)}
          onMouseLeave={() => setIsHovered(true)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={handleNext}
          onMouseEnter={() => setIsHovered(false)}
          onMouseLeave={() => setIsHovered(true)}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}