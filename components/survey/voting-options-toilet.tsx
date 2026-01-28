'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@app/components/ui/card'
import { ThumbsUp, ThumbsDown, Smile, Frown } from 'lucide-react'

interface VotingOptionsToiletProps {
    selectedOption: 'a' | 'b' | null
    onVote: (option: 'a' | 'b') => void
    isSubmitting: boolean
}

export default function VotingOptionsToilet({ selectedOption, onVote, isSubmitting }: VotingOptionsToiletProps) {
    const disabled = isSubmitting

    return (
        <div className="grid grid-cols-2 gap-3">
            {/* Option A - Puas */}
            <motion.div
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
            >
                <Card
                    className={`cursor-pointer transition-all duration-300 h-full ${selectedOption === 'a'
                        ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'hover:shadow-lg'
                        } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={() => !disabled && onVote('a')}
                >
                    <CardContent className="p-3 text-center">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Smile className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
                            Puas
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Fasilitas bersih & nyaman
                        </p>
                        {selectedOption === 'a' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-2"
                            >
                                <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto" />
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Option B - Kurang Puas */}
            <motion.div
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
            >
                <Card
                    className={`cursor-pointer transition-all duration-300 h-full ${selectedOption === 'b'
                        ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'hover:shadow-lg'
                        } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={() => !disabled && onVote('b')}
                >
                    <CardContent className="p-3 text-center">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-2 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <Frown className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
                            Kurang Puas
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Perlu perbaikan & peningkatan
                        </p>
                        {selectedOption === 'b' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-2"
                            >
                                <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto" />
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
