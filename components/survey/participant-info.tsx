'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card'
import { CheckCircle } from 'lucide-react'

interface Participant {
  nik: string
  ktp: string
  name: string
  department: string
  sex: string
  date_verified?: string | null
}

interface ParticipantInfoProps {
  participant: Participant
}

export default function ParticipantInfo({ participant }: ParticipantInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className=""
    >
      <Card className="shadow-lg">
        <CardHeader className="px-4 sm:px-6 pt-4 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            Data Terverifikasi
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Halo, {participant.name}!
            {participant.date_verified && (
              <span className="block text-amber-600 dark:text-amber-400 mt-1">
                Anda sudah voting sebelumnya. Pilih ulang jika ingin mengubah pilihan.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pt-0 pb-4">
          <div className="grid grid-cols-[72px_1fr] gap-x-3 gap-y-1 text-xs sm:text-sm">
            <span className="text-slate-600 dark:text-slate-400">NIK</span>
            <span className="font-medium text-right break-words">{participant.nik}</span>

            <span className="text-slate-600 dark:text-slate-400">Dept</span>
            <span className="font-medium break-words text-right">{participant.department}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export type { Participant }