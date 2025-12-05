'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DefaultBackground from '@app/components/layout/default-background'
import ThumbsUpAnimation from '@app/components/survey/thumbs-up-animation'
import SurveyForm, { type Participant } from '@app/components/survey/survey-form'
import ParticipantInfo from '@app/components/survey/participant-info'
import VotingOptions from '@app/components/survey/voting-options'
import SubmitButton from '@app/components/survey/submit-button'
import Success from '@app/components/survey/success'
import SurveyHeader from '@app/components/survey/survey-header'
import DashboardButton from '@app/components/survey/dashboard-button'
import DashboardAccess from '@app/components/survey/dashboard-access'
import { supabase } from '@app/lib/supabase'

export default function CanteenSurvey() {
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
      const { data, error } = await supabase
        .from('survey_kantin_yongjinone')
        .select('*')
        .order('id', { ascending: false })
      if (error) {
        console.error('Error fetching participants:', error)
        setIsLoadingParticipants(false)
      } else {
        console.log('Fetched participants for verification:', data?.length || 0)
        setParticipants(data || [])
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
    console.log('Input value:', trimmedInput)
    console.log('Participants count:', participants.length)
    console.log('Participants data:', participants)
    
    const participant = participants.find(p => {
      const lowerInput = trimmedInput.toLowerCase()
      const lowerNik = p.nik.toLowerCase()
      const lowerKtp = p.ktp.toLowerCase()
      
      // Check full match for NIK or KTP
      if (lowerNik === lowerInput || lowerKtp === lowerInput) return true
      
      // For NIK, allow last 6 digits if NIK starts with "YJ1_"
      if (lowerInput.length === 6 && /^\d{6}$/.test(lowerInput) && lowerNik === 'yj1_' + lowerInput) return true
      
      return false
    })
    
    console.log('Found participant:', participant)

    if (participant) {
      // Check if already voted
      if (participant.date_verified) {
        setError('Anda sudah melakukan voting sebelumnya.')
        return
      }

      setCurrentParticipant(participant)
      setStep('voting')
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

    const surveyEntry = {
      nik: currentParticipant.nik,
      ktp: currentParticipant.ktp,
      name: currentParticipant.name,
      department: currentParticipant.department,
      sex: currentParticipant.sex,
      option_a: selectedOption === 'a',
      option_b: selectedOption === 'b',
      date_verified: new Date().toISOString()
    }

    const { error } = await supabase
      .from('survey_kantin_yongjinone')
      .insert([surveyEntry])

    if (error) {
      setError('Error submitting vote. Please try again.')
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    setStep('success')
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
      // Redirect to dashboard
      window.location.href = '/yongjinone/survey/canteen/dashboard'
    } else {
      setDashboardError('Passkey salah. Silakan coba lagi.')
    }
  }

  return (
    <DefaultBackground showFooter={true}>
      <ThumbsUpAnimation trigger={showThumbsUpAnimation} />
      
      <div className="flex-1 flex flex-col justify-center px-3 sm:px-4 py-4">
        <div className="max-w-sm mx-auto w-full">
          <SurveyHeader />
          
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
              <VotingOptions
                selectedOption={selectedOption}
                onVote={handleVote}
                isSubmitting={isSubmitting}
              />
              <SubmitButton
                selectedOption={selectedOption}
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