'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DefaultBackground from '@app/components/layout/default-background'
import SurveyForm, { type Participant } from '@app/components/survey/survey-form'
import ParticipantInfo from '@app/components/survey/participant-info'
import SubmitButton from '@app/components/survey/submit-button'
import Success from '@app/components/survey/success'
import SurveyHeader from '@app/components/survey/survey-header'
import DashboardButton from '@app/components/survey/dashboard-button'
import DashboardAccess from '@app/components/survey/dashboard-access'
import { supabase } from '@app/lib/supabase'
import { AlertCircle, Toilet, CheckCircle2 } from 'lucide-react'
import { Label } from '../../../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group'
import { Textarea } from '../../../../components/ui/textarea'
import { Input } from '../../../../components/ui/input'

export default function WarehouseToiletSurvey() {
    const [inputValue, setInputValue] = useState('')
    const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [step, setStep] = useState<'input' | 'voting' | 'success'>('input')
    const [showDashboardModal, setShowDashboardModal] = useState(false)
    const [passkey, setPasskey] = useState('')
    const [dashboardError, setDashboardError] = useState('')
    const [participants, setParticipants] = useState<Participant[]>([])
    const [isLoadingParticipants, setIsLoadingParticipants] = useState(true)

    // Conditional Flow State
    const [needToilet, setNeedToilet] = useState<'yes' | 'no' | null>(null)

    // New state for 4 detailed questions
    const [preferredToilet, setPreferredToilet] = useState<string>('')
    const [reasonPreference, setReasonPreference] = useState('')
    const [nearestToilet, setNearestToilet] = useState('')
    const [suggestionImprovement, setSuggestionImprovement] = useState('')

    useEffect(() => {
        // Fetch all participants from Supabase for verification
        const fetchParticipants = async () => {
            setIsLoadingParticipants(true)
            try {
                const { data, error } = await supabase
                    .from('survey_warehousetoilet_yongjinone')
                    .select('*')
                    .order('id', { ascending: false })

                if (error) {
                    console.error('Error fetching participants:', error)
                    setParticipants([])
                    setIsLoadingParticipants(false)
                    return
                }

                console.log('Fetched participants for verification:', data?.length || 0)
                setParticipants(data || [])
                setIsLoadingParticipants(false)
            } catch (err) {
                console.error('Error fetching participants:', err)
                setParticipants([])
                setIsLoadingParticipants(false)
            }
        }
        fetchParticipants()
    }, [])

    const validateParticipant = async () => {
        if (isLoadingParticipants) {
            setError('Sedang memuat data, silakan tunggu sebentar...')
            return
        }

        setError('')
        const trimmedInput = inputValue.trim()
        const normalizedInput = (trimmedInput || '').toLowerCase()
        const normalizedAlnumInput = normalizedInput.replace(/[^a-z0-9]/g, '')
        const digitInput = (trimmedInput || '').replace(/\D/g, '')

        console.log('Validate input:', { trimmedInput, normalizedInput, digitInput })

        const normalizeField = (v: any) => (v === null || v === undefined) ? '' : String(v).toLowerCase()
        const normalizeAlnum = (v: any) => normalizeField(v).replace(/[^a-z0-9]/g, '')
        const normalizeDigits = (v: any) => (v === null || v === undefined) ? '' : String(v).replace(/\D/g, '')

        // Try in-memory find first
        let participant = participants.find(p => {
            const nikStr = normalizeField(p.nik)
            const ktpStr = normalizeField(p.ktp)
            const nikAlnum = normalizeAlnum(p.nik)
            const ktpAlnum = normalizeAlnum(p.ktp)
            const nikDigits = normalizeDigits(p.nik)

            // Exact full match
            if (nikStr === normalizedInput || ktpStr === normalizedInput) return true

            // Alphanumeric equal
            if (nikAlnum === normalizedAlnumInput || ktpAlnum === normalizedAlnumInput) return true

            // If input is exactly 6 digits, match suffix of NIK digits only
            if (digitInput.length === 6) {
                if (nikDigits.endsWith(digitInput)) return true
            }

            return false
        })

        // Server-side fallback
        if (!participant) {
            try {
                if (trimmedInput) {
                    let { data: exactNik, error: errNik } = await supabase
                        .from('survey_warehousetoilet_yongjinone')
                        .select('*')
                        .ilike('nik', trimmedInput)
                        .limit(1)

                    if (exactNik && exactNik.length > 0) participant = exactNik[0]

                    if (!participant) {
                        const { data: exactKtp, error: errKtp } = await supabase
                            .from('survey_warehousetoilet_yongjinone')
                            .select('*')
                            .ilike('ktp', trimmedInput)
                            .limit(1)
                        if (exactKtp && exactKtp.length > 0) participant = exactKtp[0]
                    }

                    if (!participant && digitInput && digitInput.length >= 4) {
                        const { data: likeNik, error: errLikeNik } = await supabase
                            .from('survey_warehousetoilet_yongjinone')
                            .select('*')
                            .ilike('nik', `%${digitInput}`)
                            .limit(1)
                        if (likeNik && likeNik.length > 0) participant = likeNik[0]
                    }
                }
            } catch (err) {
                console.error('Error during server-side fallback lookup:', err)
            }
        }

        if (participant) {
            setCurrentParticipant(participant)
            setStep('voting')

            // Reset form fields
            setNeedToilet(null)
            setPreferredToilet('')
            setReasonPreference('')
            setNearestToilet('')
            setSuggestionImprovement('')

            // Pre-fill if already voted
            if (participant.date_verified) {
                // @ts-ignore
                if (participant.option_a) setNeedToilet('yes')
                // @ts-ignore
                else if (participant.option_b) setNeedToilet('no')

                // @ts-ignore
                if (participant.preferred_toilet) setPreferredToilet(participant.preferred_toilet)
                // @ts-ignore
                if (participant.reason_preference) setReasonPreference(participant.reason_preference)
                // @ts-ignore
                if (participant.nearest_toilet) setNearestToilet(participant.nearest_toilet)
                // @ts-ignore
                if (participant.suggestion_improvement) setSuggestionImprovement(participant.suggestion_improvement)
            }
        } else {
            setError('Data tidak ditemukan. Silakan periksa kembali NIK atau nomor KTP Anda.')
        }
    }

    const submitVote = async () => {
        if (!currentParticipant) return

        if (!needToilet) {
            setError('Mohon pilih apakah perlu penambahan toilet atau tidak.')
            return
        }

        // Validate detailed questions ONLY if needToilet is 'yes'
        if (needToilet === 'yes') {
            if (!preferredToilet) {
                setError('Mohon pilih toilet yang sering Anda gunakan (Pertanyaan No. 1).')
                return
            }
            if (!reasonPreference.trim()) {
                setError('Mohon isi alasan Anda memilih toilet tersebut (Pertanyaan No. 2).')
                return
            }
            if (!nearestToilet.trim()) {
                setError('Mohon isi toilet yang paling dekat dari gudang menurut Anda (Pertanyaan No. 3).')
                return
            }
            if (!suggestionImprovement.trim()) {
                setError('Mohon isi saran perbaikan yang Anda harapkan (Pertanyaan No. 4).')
                return
            }
        }

        setIsSubmitting(true)
        setError('')

        try {
            const surveyUpdate = {
                option_a: needToilet === 'yes',
                option_b: needToilet === 'no',
                preferred_toilet: needToilet === 'yes' ? preferredToilet : null,
                reason_preference: needToilet === 'yes' ? reasonPreference : null,
                nearest_toilet: needToilet === 'yes' ? nearestToilet : null,
                suggestion_improvement: needToilet === 'yes' ? suggestionImprovement : null,
                date_verified: new Date().toISOString()
            }

            const { error } = await supabase
                .from('survey_warehousetoilet_yongjinone')
                .update(surveyUpdate)
                .eq('id', currentParticipant.id)

            if (error) {
                console.error('Supabase update error:', error)
                setError('Error submitting survey. Please try again.')
            } else {
                setStep('success')
            }
        } catch (err) {
            console.error('Unexpected error during submit:', err)
            setError('Unexpected error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setInputValue('')
        setCurrentParticipant(null)
        setNeedToilet(null)
        setPreferredToilet('')
        setReasonPreference('')
        setNearestToilet('')
        setSuggestionImprovement('')
        setError('')
        setStep('input')
    }

    const handleDashboardAccess = () => {
        setDashboardError('')
        if (passkey === '0000') {
            document.cookie = 'dashboardAuthenticated=true; path=/; max-age=3600'
            window.location.href = '/yongjinone/survey/warehouse-toilet/dashboard'
        } else {
            setDashboardError('Passkey salah. Silakan coba lagi.')
        }
    }

    return (
        <DefaultBackground showFooter={true}>
            <div className="flex-1 flex flex-col justify-center px-3 sm:px-4 py-8">
                <div className="max-w-xl mx-auto w-full">
                    <SurveyHeader
                        Icon={Toilet}
                        title="Survey Toilet Warehouse"
                        subtitle="Masukan Anda sangat berharga untuk peningkatan fasilitas kami"
                    />

                    {/* Input Step */}
                    {step === 'input' && (
                        <div className="max-w-sm mx-auto w-full">
                            <SurveyForm
                                inputValue={inputValue}
                                setInputValue={setInputValue}
                                error={error}
                                validateParticipant={validateParticipant}
                                isLoading={isLoadingParticipants}
                            />
                        </div>
                    )}

                    {/* Voting Step */}
                    {step === 'voting' && currentParticipant && (
                        <div className="space-y-6 mt-6">
                            <div className="max-w-sm mx-auto w-full">
                                <ParticipantInfo participant={currentParticipant} />
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6 bg-white/50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm"
                            >
                                {/* Initial Question: Need Toilet? */}
                                <div className="space-y-4">
                                    <RadioGroup value={needToilet || ''} onValueChange={(val: 'yes' | 'no') => setNeedToilet(val)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <RadioGroupItem value="yes" id="need-yes" className="peer sr-only" />
                                            <Label
                                                htmlFor="need-yes"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:text-slate-900 peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 peer-data-[state=checked]:text-green-700 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:peer-data-[state=checked]:border-green-400 dark:peer-data-[state=checked]:bg-green-950/30 dark:peer-data-[state=checked]:text-green-300 cursor-pointer transition-all"
                                            >
                                                <span className="text-base font-bold">Ya, Perlu</span>
                                                <span className="text-xs text-slate-500 mt-1">Lanjut ke pertanyaan detail</span>
                                                {needToilet === 'yes' && (
                                                    <CheckCircle2 className="w-5 h-5 mt-2 text-green-500" />
                                                )}
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="no" id="need-no" className="peer sr-only" />
                                            <Label
                                                htmlFor="need-no"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:text-slate-900 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50 peer-data-[state=checked]:text-red-700 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:peer-data-[state=checked]:border-red-400 dark:peer-data-[state=checked]:bg-red-950/30 dark:peer-data-[state=checked]:text-red-300 cursor-pointer transition-all"
                                            >
                                                <span className="text-base font-bold">Tidak Perlu</span>
                                                <span className="text-xs text-slate-500 mt-1">Selesai mengisi survey</span>
                                                {needToilet === 'no' && (
                                                    <CheckCircle2 className="w-5 h-5 mt-2 text-red-500" />
                                                )}
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Detailed Questions - Only show if needToilet is 'yes' */}
                                {needToilet === 'yes' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-6 border-t border-slate-200 dark:border-slate-700 pt-6"
                                    >
                                        {/* Question 1 */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                                1. Toilet mana yang sering Anda gunakan di tempat kerja? <span className="text-red-500">*</span>
                                            </Label>
                                            <RadioGroup value={preferredToilet} onValueChange={setPreferredToilet} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {['Toilet Cutting', 'Toilet Samping Downroom', 'Toilet Luar'].map((option) => (
                                                    <div key={option}>
                                                        <RadioGroupItem value={option} id={option} className="peer sr-only" />
                                                        <Label
                                                            htmlFor={option}
                                                            className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:text-slate-900 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:text-blue-700 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:peer-data-[state=checked]:border-blue-400 dark:peer-data-[state=checked]:bg-blue-950/30 dark:peer-data-[state=checked]:text-blue-300 cursor-pointer transition-all"
                                                        >
                                                            <span className="text-sm font-medium text-center">{option}</span>
                                                            {preferredToilet === option && (
                                                                <CheckCircle2 className="w-4 h-4 mt-2 text-blue-500" />
                                                            )}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        {/* Question 2 */}
                                        <div className="space-y-3">
                                            <Label htmlFor="q2" className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                                2. Mengapa Anda memilih untuk menggunakan toilet tersebut? <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="q2"
                                                placeholder="Tuliskan alasan Anda..."
                                                value={reasonPreference}
                                                onChange={(e) => setReasonPreference(e.target.value)}
                                                className="min-h-[80px]"
                                            />
                                        </div>

                                        {/* Question 3 */}
                                        <div className="space-y-3">
                                            <Label htmlFor="q3" className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                                3. Menurut Anda, toilet yang paling dekat dari gudang adalah? <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="q3"
                                                placeholder="Jawaban Anda..."
                                                value={nearestToilet}
                                                onChange={(e) => setNearestToilet(e.target.value)}
                                            />
                                        </div>

                                        {/* Question 4 */}
                                        <div className="space-y-3">
                                            <Label htmlFor="q4" className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                                4. Perbaikan apa yang Anda harapkan dari toilet yang sudah tersedia saat ini? <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="q4"
                                                placeholder="Saran perbaikan..."
                                                value={suggestionImprovement}
                                                onChange={(e) => setSuggestionImprovement(e.target.value)}
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400"
                                    >
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {/* Show Submit Button if 'no' is selected OR 'yes' is selected and (optional check if valid) */}
                                {needToilet && (
                                    <SubmitButton
                                        // @ts-ignore
                                        selectedOption={needToilet === 'yes' ? (preferredToilet ? 'a' : null) : 'b'}
                                        // Logic above: If yes, we need preferredToilet to act as 'valid' signal for existing button logic that checks selectedOption.
                                        // Or we can just pass 'a' if needToilet is 'no'.
                                        // Let's rely on validation in submitVote and just enable button if needToilet is set.
                                        isSubmitting={isSubmitting}
                                        onSubmit={submitVote}
                                        label="Kirim Jawaban"
                                    />
                                )}
                            </motion.div>
                        </div>
                    )}

                    {/* Success Step */}
                    {step === 'success' && (
                        <Success onReset={resetForm} />
                    )}
                </div>
            </div>

            {/* Dashboard Floating Button */}
            <DashboardButton
                onClick={() => setShowDashboardModal(true)}
                showModal={!showDashboardModal}
            />

            {/* Dashboard Modal */}
            {showDashboardModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-sm"
                    >
                        <DashboardAccess
                            passkey={passkey}
                            setPasskey={setPasskey}
                            dashboardError={dashboardError}
                            onAccess={handleDashboardAccess}
                            onBack={() => setShowDashboardModal(false)}
                        />
                    </motion.div>
                </div>
            )}
        </DefaultBackground>
    )
}
