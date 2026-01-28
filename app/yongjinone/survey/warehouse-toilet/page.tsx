'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DefaultBackground from '@app/components/layout/default-background'
import ThumbsUpAnimation from '@app/components/survey/thumbs-up-animation'
import SurveyForm, { type Participant } from '@app/components/survey/survey-form'
import ParticipantInfo from '@app/components/survey/participant-info'
import VotingOptionsToilet from '@app/components/survey/voting-options-toilet'
import SubmitButton from '@app/components/survey/submit-button'
import Success from '@app/components/survey/success'
import SurveyHeader from '@app/components/survey/survey-header'
import DashboardButton from '@app/components/survey/dashboard-button'
import DashboardAccess from '@app/components/survey/dashboard-access'
import { supabase } from '@app/lib/supabase'
import { AlertCircle, Toilet } from 'lucide-react'

export default function WarehouseToiletSurvey() {
    const [inputValue, setInputValue] = useState('')
    const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null)
    const [selectedOption, setSelectedOption] = useState<'a' | 'b' | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showThumbsUpAnimation, setShowThumbsUpAnimation] = useState(false)
    const [error, setError] = useState('')
    const [step, setStep] = useState<'input' | 'voting' | 'success'>('input')
    const [showDashboardModal, setShowDashboardModal] = useState(false)
    const [passkey, setPasskey] = useState('')
    const [dashboardError, setDashboardError] = useState('')
    const [participants, setParticipants] = useState<Participant[]>([])
    const [isLoadingParticipants, setIsLoadingParticipants] = useState(true)

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

            // Pre-select previous vote should be reset or mapped correctly?
            // Assuming mapping: option_a = Puas, option_b = Kurang Puas
            if (participant.date_verified) {
                if (participant.option_a) {
                    setSelectedOption('a')
                } else if (participant.option_b) {
                    setSelectedOption('b')
                }
            }
        } else {
            setError('Data tidak ditemukan. Silakan periksa kembali NIK atau nomor KTP Anda.')
        }
    }

    const handleVote = (option: 'a' | 'b') => {
        setSelectedOption(option)
        setShowThumbsUpAnimation(true)
        setTimeout(() => setShowThumbsUpAnimation(false), 2000)
    }

    const submitVote = async () => {
        if (!selectedOption || !currentParticipant) return

        setIsSubmitting(true)
        setError('')

        try {
            const surveyUpdate = {
                option_a: selectedOption === 'a',
                option_b: selectedOption === 'b',
                date_verified: new Date().toISOString()
            }

            const { error } = await supabase
                .from('survey_warehousetoilet_yongjinone')
                .update(surveyUpdate)
                .eq('id', currentParticipant.id)

            if (error) {
                console.error('Supabase update error:', error)
                setError('Error submitting vote. Please try again.')
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
        setSelectedOption(null)
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
            <ThumbsUpAnimation trigger={showThumbsUpAnimation} />

            <div className="flex-1 flex flex-col justify-center px-3 sm:px-4 py-4">
                <div className="max-w-sm mx-auto w-full">
                    <SurveyHeader
                        Icon={Toilet}
                        title="Survey Toilet Warehouse"
                        subtitle="Pendapat Anda meningkatkan kenyamanan toilet warehouse"
                    />

                    {/* Input Step */}
                    {step === 'input' && (
                        <SurveyForm
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            error={error}
                            validateParticipant={validateParticipant}
                            isLoading={isLoadingParticipants}
                        />
                    )}

                    {/* Voting Step */}
                    {step === 'voting' && currentParticipant && (
                        <div className="space-y-3">
                            <ParticipantInfo participant={currentParticipant} />

                            <VotingOptionsToilet
                                selectedOption={selectedOption}
                                onVote={handleVote}
                                isSubmitting={isSubmitting}
                            />

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

                            <SubmitButton
                                selectedOption={selectedOption} // Note: SubmitButton might expect 'a'|'b'|'c'|'d', check type compat
                                isSubmitting={isSubmitting}
                                onSubmit={submitVote}
                            />
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
