'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card'
import { Button } from '@app/components/ui/button'
import { Input } from '@app/components/ui/input'
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react'

interface DashboardAccessProps {
  passkey: string
  setPasskey: (value: string) => void
  dashboardError: string
  onAccess: () => void
  onBack: () => void
}

export default function DashboardAccess({ 
  passkey, 
  setPasskey, 
  dashboardError, 
  onAccess, 
  onBack 
}: DashboardAccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <CardTitle className="text-xl">Dashboard Access</CardTitle>
          <CardDescription>
            Masukkan passkey untuk mengakses dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter passkey"
              className="w-full"
              maxLength={4}
            />
          </div>

          {dashboardError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{dashboardError}</span>
            </motion.div>
          )}

          <Button
            onClick={onAccess}
            disabled={!passkey.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Access Dashboard
          </Button>
          
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Survey
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}