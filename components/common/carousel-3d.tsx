'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, useScroll, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@app/components/ui/button'
import MenuCard, { MenuItem } from './menu-card'

interface Carousel3DProps {
  items: MenuItem[]
  currentIndex: number
  onPrev: () => void
  onNext: () => void
  onCardAction: (item: MenuItem) => void
  onIndexChange?: (index: number) => void
}

export default function Carousel3D({ items, currentIndex, onPrev, onNext, onCardAction, onIndexChange }: Carousel3DProps) {
  const [dragStartX, setDragStartX] = useState(0)
  const dragX = useMotionValue(0)
  const totalItems = items.length
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverReady, setHoverReady] = useState(false)
  const autoRotateMs = 4000
  const reduce = useReducedMotion()
  
  // Scroll-based parallax for the whole section
  const { scrollYProgress } = useScroll()
  const sectionTranslateY = useTransform(scrollYProgress, [0, 1], [0, 40])
  const spotlightOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.25, 0.15])

  // Calculate rotation angle for each card
  const angleStep = 360 / totalItems
  
  // Get the card at a specific offset from current
  const getCardAtOffset = (offset: number) => {
    const index = (currentIndex + offset + totalItems) % totalItems
    return items[index]
  }

  // Calculate transform for each card position
  const getCardTransform = (offset: number, dragOffset: number = 0) => {
    const angle = (offset * angleStep + dragOffset) % 360
    const normalizedAngle = ((angle + 180) % 360) - 180
    // Distance from camera (Z-axis)
    const radius = 520 // Slightly larger circle for cleaner spacing
    const rotateY = angle
    const translateZ = -radius
    // Calculate scale based on angle (cards in front are larger)
    const scale = 1 - Math.abs(normalizedAngle) / 300
    const finalScale = Math.max(0.55, Math.min(1, scale))
    // Calculate opacity based on angle
    const opacity = normalizedAngle > -95 && normalizedAngle < 95 ? 1 : 0.25
    // Z-index based on angle (front cards on top)
    const zIndex = Math.round(50 + Math.cos((normalizedAngle * Math.PI) / 180) * 60)
    
    return {
      rotateY,
      translateZ,
      scale: finalScale,
      opacity,
      zIndex
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50
    if (info.offset.x > threshold) {
      handlePrev()
    } else if (info.offset.x < -threshold) {
      handleNext()
    }
    dragX.set(0)
    setIsDragging(false)
  }

  const handlePrev = () => {
    onPrev()
  }

  const handleNext = () => {
    onNext()
  }

  const handleCardClick = (offset: number) => {
    if (offset === 0) {
      // Center card - trigger action
      onCardAction(getCardAtOffset(0))
    } else if (offset > 0) {
      // Click on right cards - go next
      for (let i = 0; i < offset; i++) {
        setTimeout(() => handleNext(), i * 100)
      }
    } else {
      // Click on left cards - go prev
      for (let i = 0; i < Math.abs(offset); i++) {
        setTimeout(() => handlePrev(), i * 100)
      }
    }
  }

  // Generate array of offsets for visible cards
  const visibleOffsets = Array.from({ length: totalItems }, (_, i) => i - Math.floor(totalItems / 2))

  // Auto-rotate with pause on hover or drag
  useEffect(() => {
    if (reduce || isHovered || isDragging) return
    const id = setInterval(() => {
      handleNext()
    }, autoRotateMs)
    return () => clearInterval(id)
  }, [reduce, isHovered, isDragging, currentIndex])

  // Prevent initial hover scaling glitch by delaying hover readiness
  useEffect(() => {
    const t = setTimeout(() => setHoverReady(true), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative">
      <div className="flex items-center justify-center">
        <motion.div 
          className="relative w-full h-[420px] sm:h-[520px] md:h-[580px] flex items-center justify-center overflow-visible"
          style={{
            perspective: '2000px',
            transformStyle: 'preserve-3d',
            x: dragX
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{ y: reduce ? 0 : (sectionTranslateY as any) }}
        >
          {/* Ambient shadow under the carousel */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-8 rounded-full blur-2xl opacity-40 bg-slate-400/40 dark:bg-black/60" />

          {/* Center spotlight */}
          <motion.div className="absolute top-6 left-1/2 -translate-x-1/2 w-3/4 h-24 rounded-full blur-2xl bg-white/40 dark:bg-blue-200/20" style={{ opacity: spotlightOpacity }} />

          {/* Floor reflection under center card */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[55%] h-16 rounded-[100%] blur-2xl opacity-25 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.5), rgba(255,255,255,0))'
            }}
          />

          <motion.div 
            className="relative w-full max-w-lg h-full"
            style={{
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {visibleOffsets.map((offset) => {
              const transform = getCardTransform(offset)
              const card = getCardAtOffset(offset)
              
              return (
                <motion.div
                  key={`${card.id}-${offset}`}
                  className="absolute top-1/2 left-1/2 w-full px-4"
                  initial={false}
                  animate={{
                    rotateY: transform.rotateY,
                    translateZ: transform.translateZ,
                    translateX: '-50%',
                    translateY: '-50%',
                    scale: transform.scale,
                    opacity: transform.opacity,
                    zIndex: transform.zIndex
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 30,
                    mass: 0.8
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    pointerEvents: offset === 0 ? 'auto' : 'auto',
                    cursor: offset === 0 ? 'pointer' : 'pointer',
                    transformOrigin: 'center'
                  }}
                  onClick={() => handleCardClick(offset)}
                  whileHover={hoverReady && offset === 0 ? { scale: 1.02 } : {}}
                >
                  <MenuCard 
                    item={card}
                    onAction={() => onCardAction(card)}
                    is3D={true}
                    isCenter={offset === 0}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation Buttons - Desktop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute left-2 sm:left-8 md:left-12 top-1/2 -translate-y-1/2 z-[100] hidden sm:block"
      >
        <Button
          variant="outline"
          size="icon"
          className="relative bg-white/95 dark:bg-slate-800/90 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 rounded-full"
          onClick={handlePrev}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%)' }}
          />
        </Button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute right-2 sm:right-8 md:right-12 top-1/2 -translate-y-1/2 z-[100] hidden sm:block"
      >
        <Button
          variant="outline"
          size="icon"
          className="relative bg-white/95 dark:bg-slate-800/90 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 rounded-full"
          onClick={handleNext}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%)' }}
          />
        </Button>
      </motion.div>

      {/* Mobile Navigation Buttons and indicators */}
      <div className="flex justify-between items-center mt-8 sm:hidden px-4">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border-2"
          onClick={handlePrev}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const diff = index - currentIndex
                if (diff > 0) {
                  for (let i = 0; i < diff; i++) {
                    setTimeout(() => handleNext(), i * 100)
                  }
                } else if (diff < 0) {
                  for (let i = 0; i < Math.abs(diff); i++) {
                    setTimeout(() => handlePrev(), i * 100)
                  }
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-8' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border-2"
          onClick={handleNext}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Desktop indicators with progress */}
      <div className="hidden sm:flex justify-center mt-6 gap-2">
        {items.map((_, index) => (
          <div key={`dot-${index}`} className={`relative h-2 rounded-full overflow-hidden ${index === currentIndex ? 'w-10 bg-primary/20' : 'w-2 bg-slate-300 dark:bg-slate-700'}`}>
            {index === currentIndex && (
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: autoRotateMs / 1000, ease: 'easeInOut' }}
                className="absolute left-0 top-0 h-full bg-primary"
              />
            )}
          </div>
        ))}
      </div>

      {/* Keyboard Navigation Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="hidden md:flex justify-center mt-8 text-sm text-muted-foreground"
      >
        <p>Use arrow keys or drag to navigate • Click side cards to rotate</p>
      </motion.div>
    </div>
  )
}
