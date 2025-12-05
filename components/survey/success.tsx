'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@app/components/ui/card'
import { Button } from '@app/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface SuccessProps {
  onReset: () => void
}

export default function Success({ onReset }: SuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </motion.div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
            Terima Kasih!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Voting Anda berhasil disimpan
          </p>
          <Button 
            onClick={onReset}
            variant="outline"
            className="w-full text-sm"
          >
            Survey Baru
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}