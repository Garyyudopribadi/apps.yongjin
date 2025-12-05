'use client'

import { motion } from 'framer-motion'
import { Button } from '@app/components/ui/button'
import { Send } from 'lucide-react'

interface SubmitButtonProps {
  selectedOption: 'a' | 'b' | null
  isSubmitting: boolean
  onSubmit: () => void
}

export default function SubmitButton({ selectedOption, isSubmitting, onSubmit }: SubmitButtonProps) {
  return (
    <Button 
      onClick={onSubmit}
      disabled={!selectedOption || isSubmitting}
      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-sm sm:text-base py-2"
    >
      {isSubmitting ? (
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Menyimpan...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Submit Voting
        </div>
      )}
    </Button>
  )
}