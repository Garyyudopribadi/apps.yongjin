'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card'
import { Button } from '@app/components/ui/button'
import { Input } from '@app/components/ui/input'
import { User, CheckCircle, AlertCircle, Utensils, Users, Send, ThumbsUp } from 'lucide-react'

interface Participant {
  id?: number
  nik: string
  ktp: string
  name: string
  department: string
  sex: string
  date_verified: string | null
  option_a: boolean | null
  option_b: boolean | null
}

interface SurveyFormProps {
  inputValue: string
  setInputValue: (value: string) => void
  error: string
  validateParticipant: () => void
  isLoading?: boolean
}

// Mock data for participants
// const mockParticipants: Participant[] = [
//   {
//     nik: "YJ1_000143",
//     ktp: "3202162408820003",
//     name: "DEDE MASHAN",
//     department: "Mekanik",
//     sex: "Male"
//   },
//   {
//     nik: "YJ1_000144",
//     ktp: "3202162508820004",
//     name: "SITI NURHALIZA",
//     department: "Produksi",
//     sex: "Female"
//   },
//   {
//     nik: "YJ1_000145",
//     ktp: "3202162608820005",
//     name: "AHMAD RIFAI",
//     department: "Quality Control",
//     sex: "Male"
//   }
// ]

export default function SurveyForm({ 
  inputValue, 
  setInputValue, 
  error, 
  validateParticipant,
  isLoading = false
}: SurveyFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            Verifikasi Identitas
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Masukkan NIK atau KTP Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="NIK atau KTP"
              className="w-full text-sm sm:text-base"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Contoh: YJ1_000143 atau 3202162408820003
            </p>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-red-700 dark:text-red-400">{error}</span>
            </motion.div>
          )}

          <Button 
            onClick={validateParticipant}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-sm sm:text-base py-2"
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? 'Memuat...' : 'Verifikasi'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export { type Participant }