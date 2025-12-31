'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@app/components/ui/card'
import { CheckCircle, Utensils, Users, ThumbsUp, Flower } from 'lucide-react'

interface VotingOptionsProps {
  selectedOption: 'a' | 'b' | null
  onVote: (option: 'a' | 'b') => void
  isSubmitting: boolean
}

export default function VotingOptions({ selectedOption, onVote, isSubmitting }: VotingOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          className={`cursor-pointer transition-all duration-300 h-full ${
            selectedOption === 'a' 
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'hover:shadow-lg'
          }`}
          onClick={() => onVote('a')}
        >
          <CardContent className="p-3 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Meja Makan
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Meja & kursi
            </p>
            {selectedOption === 'a' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-2"
              >
                <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mx-auto" />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          className={`cursor-pointer transition-all duration-300 h-full ${
            selectedOption === 'b' 
              ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' 
              : 'hover:shadow-lg'
          }`}
          onClick={() => onVote('b')}
        >
          <CardContent className="p-3 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Flower className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Istirahat di Taman
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Duduk di area taman
            </p>
            {selectedOption === 'b' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-2"
              >
                <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mx-auto" />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}