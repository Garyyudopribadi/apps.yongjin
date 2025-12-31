"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@app/lib/supabase"
import { Button } from "@app/components/ui/button"
import { Input } from "@app/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@app/components/ui/card"
import { Loader2, CheckCircle2, AlertCircle, PlayCircle, FileText } from "lucide-react"
import { motion } from "framer-motion"
import domtoimage from 'dom-to-image'
import DefaultBackground from "@app/components/layout/default-background"

// Types
interface UserData {
    id: number
    facility: string
    nik: string
    ktp: string
    name: string
    department: string
    sex: string
    status: boolean | null
    score: number | null
}

const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "Apa pengertian Safety Machine?",
        options: [
            { key: "A", text: "Sistem perawatan mesin untuk meningkatkan produktivitas" },
            { key: "B", text: "Sistem, perangkat, dan prosedur keselamatan untuk melindungi operator dari risiko cedera" },
            { key: "C", text: "Sistem pemeliharaan mesin jahit secara berkala" },
            { key: "D", text: "Sistem manajemen kualitas produksi" },
        ],
        correct: "B",
    },
    {
        id: 2,
        question: "Apa fungsi utama dari Eye Guard?",
        options: [
            { key: "A", text: "Melindungi tangan dari tertusuk jarum" },
            { key: "B", text: "Melindungi mata dari pecahan jarum atau benda kecil yang terlempar" },
            { key: "C", text: "Melindungi bagian mesin yang berputar" },
            { key: "D", text: "Menghentikan mesin saat kondisi darurat" },
        ],
        correct: "B",
    },
    {
        id: 3,
        question: "Apakah ketentuan penggunaan Needle Guard?",
        options: [
            { key: "A", text: "Boleh dilepas saat menjahit detail" },
            { key: "B", text: "Terpasang tepat di area jarum dan tidak menghalangi proses jahit" },
            { key: "C", text: "Hanya perlu dipasang pada mesin berkecepatan rendah" },
            { key: "D", text: "Boleh dimodifikasi sesuai kebutuhan operator" },
        ],
        correct: "B",
    },
    {
        id: 4,
        question: "Tanggung jawab Operator meliputi hal-hal berikut, KECUALI:",
        options: [
            { key: "A", text: "Menggunakan mesin sesuai SOP" },
            { key: "B", text: "Melepas safety device saat mesin rusak" },
            { key: "C", text: "Melaporkan safety machine yang rusak" },
            { key: "D", text: "Menghentikan mesin bila terjadi kondisi tidak aman" },
        ],
        correct: "B",
    },
    {
        id: 5,
        question: "Apa tanggung jawab utama Mekanik terkait Safety Machine?",
        options: [
            { key: "A", text: "Mengoperasikan mesin setiap hari" },
            { key: "B", text: "Mengizinkan mesin beroperasi tanpa safety device jika mendesak" },
            { key: "C", text: "Memastikan seluruh safety machine terpasang lengkap dan melakukan pengecekan rutin" },
            { key: "D", text: "Mengganti safety device sesuai permintaan operator" },
        ],
        correct: "C",
    },
]

export default function SafetyMachineTraining() {
    const [step, setStep] = useState<"validation" | "training" | "quiz" | "completed">("validation")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [userData, setUserData] = useState<UserData | null>(null)

    // Validation Form State
    const [facility, setFacility] = useState("Factory 1")
    const [nikOrKtp, setNikOrKtp] = useState("")
    const [userIpAddress, setUserIpAddress] = useState("")
    // Quiz State
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [score, setScore] = useState(0)
    
    // PDF Reading Tracking
    const [pdfReadConfirmed, setPdfReadConfirmed] = useState(false)
    const [timeSpentReading, setTimeSpentReading] = useState(0)
    const [pdfLoading, setPdfLoading] = useState(true)
    const MIN_READING_TIME = 59

    const CERT_BASE_WIDTH = 1100
    const CERT_ASPECT_RATIO = 16 / 11
    const certificateViewportRef = useRef<HTMLDivElement | null>(null)
    const [certificateScale, setCertificateScale] = useState(1)

    // Passkey dialog state for dashboard access
    const [showPasskeyDialog, setShowPasskeyDialog] = useState(false)
    const [passkeyInput, setPasskeyInput] = useState("")
    const [passkeyDialogError, setPasskeyDialogError] = useState("")

    useEffect(() => {
        if (step !== "completed") return

        const el = certificateViewportRef.current
        if (!el) return

        const updateScale = () => {
            const availableWidth = el.clientWidth
            if (!availableWidth) return
            const nextScale = Math.min(1, availableWidth / CERT_BASE_WIDTH)
            setCertificateScale(nextScale)
        }

        updateScale()

        const cleanups: Array<() => void> = []

        if (typeof ResizeObserver !== "undefined") {
            const ro = new ResizeObserver(() => updateScale())
            ro.observe(el)
            cleanups.push(() => ro.disconnect())
        }

        // Backstops for browser zoom + mobile visual viewport changes
        window.addEventListener("resize", updateScale)
        cleanups.push(() => window.removeEventListener("resize", updateScale))

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", updateScale)
            cleanups.push(() => window.visualViewport?.removeEventListener("resize", updateScale))
        }

        return () => {
            cleanups.forEach((fn) => fn())
        }
    }, [step])

    // Fetch user's IP address on component mount
    useEffect(() => {
        const fetchIpAddress = async () => {
            try {
                const response = await fetch('https://api.ipify.org?format=json')
                const data = await response.json()
                setUserIpAddress(data.ip)
            } catch (err) {
                console.error('Failed to fetch IP address:', err)
                setUserIpAddress('unknown')
            }
        }
        fetchIpAddress()
    }, [])

    const handleValidation = async () => {
        setError("")
        setLoading(true)

        const trimmedInput = nikOrKtp.trim()

        // Validate input format
        if (!trimmedInput) {
            setError("Please enter your NIK or KTP.")
            setLoading(false)
            return
        }

        // Check if input is numeric
        if (!/^\d+$/.test(trimmedInput)) {
            setError("Please enter only numbers for NIK or KTP.")
            setLoading(false)
            return
        }

        // Check input length
        if (trimmedInput.length === 6) {
            // 6 digits - treat as NIK suffix
        } else if (trimmedInput.length >= 10 && trimmedInput.length <= 20) {
            // Longer input - treat as full KTP
        } else {
            setError("NIK must be 6 digits. KTP must be 10-20 digits.")
            setLoading(false)
            return
        }

        try {

            // Proceed with user validation
            let query = supabase
                .from("etraining-safetymachine")
                .select("*")
                .eq("facility", facility)

            // Determine if input is 6 digits (NIK) or longer (KTP)
            const isSixDigits = /^\d{6}$/.test(nikOrKtp.trim())

            if (isSixDigits) {
                // For 6-digit input, search for NIK ending with these digits
                query = query.ilike('nik', `%${nikOrKtp.trim()}`)
            } else {
                // For longer input, search for exact KTP match
                query = query.eq('ktp', nikOrKtp.trim())
            }

            const { data, error } = await query.single()

            if (error || !data) {
                const isSixDigits = /^\d{6}$/.test(trimmedInput)
                const errorMsg = isSixDigits
                    ? "NIK ending with these digits not found. Please check your NIK."
                    : "KTP not found. Please check your KTP number."
                setError(errorMsg)
                setLoading(false)
                return
            }

            // Check if this IP address has been used with a DIFFERENT NIK/KTP today
            const today = new Date().toISOString().split('T')[0]
            const { data: ipCheckData, error: ipCheckError } = await supabase
                .from("etraining-safetymachine")
                .select("nik, ktp")
                .eq("ipaddress", userIpAddress)
                .gte("date_verified", `${today}T00:00:00`)
                .lte("date_verified", `${today}T23:59:59`)

            if (ipCheckError) {
                console.error('IP check error:', ipCheckError)
            }

            // Check if any existing records have different NIK/KTP
            if (ipCheckData && ipCheckData.length > 0) {
                const hasDifferentIdentity = ipCheckData.some(record => {
                    if (isSixDigits) {
                        // For NIK, check if the last 6 digits are different
                        return !record.nik?.endsWith(nikOrKtp.trim())
                    } else {
                        // For KTP, check if it's different
                        return record.ktp !== nikOrKtp.trim()
                    }
                })

                if (hasDifferentIdentity) {
                    setError("This device has already been used for a different account today. Only one account per device per day is allowed.")
                    setLoading(false)
                    return
                }
            }

            // Save IP address to the user record
            const { error: updateError } = await supabase
                .from("etraining-safetymachine")
                .update({ ipaddress: userIpAddress })
                .eq("id", data.id)

            if (updateError) {
                console.error('Failed to save IP address:', updateError)
            }

            setUserData(data)

            if (data.status === true) {
                setStep("completed")
                setScore(data.score || 0)
            } else {
                setStep("training")
                setPdfLoading(true)
                // Start reading time tracker
                const interval = setInterval(() => {
                    setTimeSpentReading(prev => prev + 1)
                }, 1000)
                // Store interval ID for cleanup
                ;(window as any).readingInterval = interval
            }
        } catch (err) {
            setError("An unexpected error occurred.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleStartQuiz = () => {
        if (!pdfReadConfirmed || timeSpentReading < MIN_READING_TIME) {
            setError("Please read the training material completely and confirm before starting the quiz.")
            return
        }
        setStep("quiz")
        setPdfLoading(true)
        window.scrollTo(0, 0)
    }

    const handleAnswerChange = (questionId: number, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }))
    }

    const handleSubmitQuiz = async () => {
        setLoading(true)

        // Calculate Score
        let correctCount = 0
        QUIZ_QUESTIONS.forEach((q) => {
            if (answers[q.id] === q.correct) {
                correctCount++
            }
        })

        // Score calculation: (Correct / Total) * 100
        const finalScore = (correctCount / QUIZ_QUESTIONS.length) * 100
        setScore(finalScore)

        // Update Supabase
        try {
            if (!userData) return

            const { error } = await supabase
                .from("etraining-safetymachine")
                .update({
                    answer: answers,
                    score: finalScore,
                    status: true,
                    date_verified: new Date().toISOString(),
                })
                .eq("id", userData.id)

            if (error) throw error

            setStep("completed")
            window.scrollTo(0, 0)

        } catch (err) {
            setError("Failed to submit results. Please try again.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const downloadCertificate = async () => {
        // Always export from the hidden desktop-layout certificate to keep output identical
        // across mobile/tablet/desktop.
        const certificate = document.getElementById('certificate-export')
        if (!certificate) return

        try {
            // Wait for fonts to load before generating image
            await document.fonts.ready

            // Specifically wait for Caveat to load with multiple weights
            let attempts = 0
            while (attempts < 10) {
                const weights = ['400', '500', '600', '700']
                const allLoaded = await Promise.all(
                    weights.map(weight => document.fonts.check(`${weight} 1em "Caveat"`))
                )
                if (allLoaded.every(loaded => loaded)) break
                await new Promise(resolve => setTimeout(resolve, 200))
                attempts++
            }

            // Additional wait to ensure fonts are fully rendered
            await new Promise(resolve => setTimeout(resolve, 500))

            // Ensure all images in the certificate are loaded
            const images = certificate.getElementsByTagName('img')
            await Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve()
                return new Promise((resolve) => {
                    img.onload = resolve
                    img.onerror = resolve
                })
            }))

            // Fetch the Caveat font and convert to base64
            const fontUrl = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap'
            const fontCss = await fetch(fontUrl).then(res => res.text())
            
            // Extract font URLs and fetch them as base64
            const fontUrlMatches = fontCss.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)
            let embeddedFontCss = fontCss
            
            if (fontUrlMatches) {
                for (const match of fontUrlMatches) {
                    const url = match.match(/url\((https:\/\/[^)]+)\)/)?.[1]
                    if (url) {
                        try {
                            const fontData = await fetch(url).then(res => res.arrayBuffer())
                            const base64 = btoa(String.fromCharCode(...new Uint8Array(fontData)))
                            const mimeType = url.endsWith('.woff2') ? 'font/woff2' : 'font/woff'
                            embeddedFontCss = embeddedFontCss.replace(url, `data:${mimeType};base64,${base64}`)
                        } catch (e) {
                            console.warn('Failed to embed font:', url, e)
                        }
                    }
                }
            }

            // Use fixed dimensions for consistent output across all devices
            // This ensures the downloaded certificate is always high resolution (desktop quality)
            // regardless of the device screen size (mobile/tablet)
            const fixedWidth = 1600 // High resolution width
            const aspectRatio = 16 / 11 // Standard landscape aspect ratio
            const fixedHeight = Math.round(fixedWidth / aspectRatio)

            // Use dom-to-image with fixed dimensions and scaling
            const dataUrl = await domtoimage.toPng(certificate, {
                width: fixedWidth,
                height: fixedHeight,
                style: {
                    transform: `scale(${fixedWidth / certificate.offsetWidth})`,
                    transformOrigin: 'top left',
                    width: certificate.offsetWidth + 'px',
                    height: certificate.offsetHeight + 'px',
                    // Force desktop-like layout styles during capture
                    fontSize: '16px', 
                },
                quality: 1,
                cacheBust: true,
                imagePlaceholder: undefined,
                filter: function(node: any) {
                    return true
                }
            })

            // Create download link
            const link = document.createElement('a')
            link.href = dataUrl
            link.download = `Safety_Machine_Certificate_${userData?.nik}_${new Date().toISOString().split('T')[0]}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

        } catch (error) {
            console.error('Failed to download certificate:', error)
            alert('Failed to download certificate. Please try again.')
        }
    }

    // Floating dashboard passkey handler (opens in-page dialog)
    const DASHBOARD_PASSKEY = "0123456"
    const handleOpenDashboard = () => {
        if (typeof window === "undefined") return
        if (sessionStorage.getItem("safetyMachineDashAuthorized") === "1") {
            window.location.href = '/e-training/safety-machine/dashboard'
            return
        }
        setPasskeyInput("")
        setPasskeyDialogError("")
        setShowPasskeyDialog(true)
    }

    const submitPasskeyDialog = () => {
        if (passkeyInput.trim() === DASHBOARD_PASSKEY) {
            try { sessionStorage.setItem('safetyMachineDashAuthorized', '1') } catch (e) {}
            setShowPasskeyDialog(false)
            window.location.href = '/e-training/safety-machine/dashboard'
            return
        }
        setPasskeyDialogError('Incorrect passkey')
    }

    return (
        <DefaultBackground showFooter={true}>
            <div className="flex-1 flex flex-col justify-center px-3 sm:px-4 py-4">
                <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto w-full">
                    {step === "validation" && (
                        <div className="text-center mb-6">
                            <img
                                src="/yongjinlogo.png"
                                alt="Yongjin Logo"
                                className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-lg"
                            />
                            <h2 className="text-lg md:text-xl font-bold text-slate-700 mb-2 tracking-wide">
                                PT. YONGJIN JAVASUKA GARMENT
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-3 rounded-full"></div>
                            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-1">
                                Safety Machine Training
                            </h1>
                            <p className="text-sm md:text-base text-slate-600 font-medium">
                                Internal Safety Training Program
                            </p>
                        </div>
                    )}

                    {step === "validation" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="w-fit mx-auto shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
                                <CardHeader className="pb-2 pt-4 md:pt-6">
                                    <CardDescription className="text-center text-sm md:text-base">
                                        Please validate your identity to begin the training.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 px-2 md:px-6 pb-4">
                                    <div className="space-y-2 max-w-xs mx-auto">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none text-center block">Select Facility</label>
                                            <div className="flex gap-2 flex-wrap justify-center">
                                                {["Factory 1", "Factory 2", "Factory 3"].map((fac) => (
                                                    <Button
                                                        key={fac}
                                                        variant={facility === fac ? "default" : "outline"}
                                                        onClick={() => setFacility(fac)}
                                                        className={`flex-1 min-w-[80px] text-sm py-2 h-9 ${
                                                            facility === fac
                                                                ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                                                                : "hover:bg-slate-50"
                                                        } transition-all duration-200`}
                                                    >
                                                        {fac}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium leading-none text-center block">NIK (Last 6 Digits) or KTP (Full)</label>
                                            <Input
                                                placeholder="Enter last 6 digits of NIK or full KTP"
                                                value={nikOrKtp}
                                                onChange={(e) => setNikOrKtp(e.target.value)}
                                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 h-9"
                                            />
                                            <p className="text-xs text-slate-500 mt-1 text-center">
                                                NIK: Last 6 digits only • KTP: Full number (10-20 digits)
                                            </p>
                                        </div>
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
                                </CardContent>
                                <CardFooter className="px-4 md:px-8 pb-6 pt-2 flex justify-center">
                                    <Button
                                        onClick={handleValidation}
                                        className="text-sm md:text-base h-10 md:h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                                        disabled={loading || !nikOrKtp.trim() || (!/^\d{6}$/.test(nikOrKtp.trim()) && !/^\d{10,20}$/.test(nikOrKtp.trim()))}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Validating...
                                            </>
                                        ) : (
                                            "Validate Identity"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                {step === "training" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="w-full shadow-xl border-0 overflow-hidden rounded-2xl">
                            <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                    <div>
                                        <CardTitle className="text-2xl md:text-3xl font-bold">Training Material</CardTitle>
                                        <CardDescription className="text-slate-300 mt-2 text-sm md:text-base">
                                            Read the document carefully and confirm before taking the quiz.
                                        </CardDescription>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-sm font-medium opacity-80">Hello, {userData?.name}</p>
                                        <p className="text-xs opacity-60">{userData?.department}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                                                    style={{ width: `${Math.min((timeSpentReading / MIN_READING_TIME) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs opacity-70">{Math.floor(timeSpentReading)}s</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 bg-gradient-to-br from-slate-50 to-slate-100">
                                <div className="w-full h-[70vh] md:h-[75vh] lg:h-[80vh] bg-white border-y border-slate-200 relative">
                                    {pdfLoading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                                            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                                            <p className="text-slate-600 font-medium">Loading training material...</p>
                                            <p className="text-sm text-slate-500 mt-2">Please wait while the PDF loads</p>
                                        </div>
                                    )}
                                    <iframe
                                        src="https://mozilla.github.io/pdf.js/web/viewer.html?file=https://phzyooddlafqozryxcqa.supabase.co/storage/v1/object/public/pdf/etraining-safetymachine.pdf"
                                        className="w-full h-full"
                                        title="Training PDF"
                                        allow="fullscreen"
                                        onLoad={() => setPdfLoading(false)}
                                    />
                                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs md:text-sm">
                                        <a
                                            href="https://phzyooddlafqozryxcqa.supabase.co/storage/v1/object/public/pdf/etraining-safetymachine.pdf"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Open in new tab
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 md:p-6 bg-white border-t flex flex-col gap-4">
                                <div className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <input
                                        type="checkbox"
                                        id="confirm-read"
                                        checked={pdfReadConfirmed}
                                        onChange={(e) => setPdfReadConfirmed(e.target.checked)}
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <label htmlFor="confirm-read" className="text-sm md:text-base text-slate-700 cursor-pointer flex-1">
                                        I have read and understood the Safety Machine training material completely.
                                    </label>
                                </div>
                                <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => {
                                            setStep("validation")
                                            if ((window as any).readingInterval) {
                                                clearInterval((window as any).readingInterval)
                                            }
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        Back
                                    </Button>
                                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                                        {timeSpentReading < MIN_READING_TIME && (
                                            <span className="text-xs text-amber-600 font-medium">
                                                Please spend at least {MIN_READING_TIME - timeSpentReading} more seconds reading
                                            </span>
                                        )}
                                        <Button
                                            onClick={handleStartQuiz}
                                            disabled={!pdfReadConfirmed || timeSpentReading < MIN_READING_TIME}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white min-w-[150px] w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                        >
                                            Start Quiz <PlayCircle className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}

                {step === "quiz" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="w-full shadow-lg border-0">
                        <CardHeader className="bg-slate-900 text-white p-6 sticky top-0 z-10">
                            <div className="flex justify-between items-center">
                                <CardTitle>Quiz Assessment</CardTitle>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-mono">
                                    {Object.keys(answers).length}/{QUIZ_QUESTIONS.length} Answered
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-8">
                            {QUIZ_QUESTIONS.map((q, index) => (
                                <div key={q.id} className="space-y-4 border-b border-dashed border-slate-200 pb-6 last:border-0">
                                    <h3 className="text-lg font-medium text-slate-800">
                                        <span className="text-slate-400 mr-2">0{index + 1}.</span>
                                        {q.question}
                                    </h3>
                                    <div className="grid gap-3 pl-0 md:pl-8">
                                        {q.options.map((opt) => (
                                            <label
                                                key={opt.key}
                                                className={`
                            flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-200
                            ${answers[q.id] === opt.key
                                                        ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                                                        : "hover:bg-slate-50 border-slate-200"
                                                    }
                        `}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${q.id}`}
                                                    value={opt.key}
                                                    checked={answers[q.id] === opt.key}
                                                    onChange={() => handleAnswerChange(q.id, opt.key)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="flex-1 text-sm md:text-base text-slate-700">
                                                    <span className="font-semibold mr-2">{opt.key}.</span>
                                                    {opt.text}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="p-6 bg-slate-50 border-t flex justify-end">
                            <Button
                                onClick={handleSubmitQuiz}
                                disabled={Object.keys(answers).length < QUIZ_QUESTIONS.length || loading}
                                className="w-full md:w-auto text-lg h-12 px-8"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Submit Answers"}
                            </Button>
                        </CardFooter>
                    </Card>
                    </motion.div>
                )}

                {step === "completed" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {score < 80 ? (
                            // Score below 80 - Retake required
                            <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 text-center overflow-hidden">
                                <div className="h-32 w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500">
                                    <AlertCircle className="h-16 w-16 text-white" />
                                </div>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-3xl font-bold text-slate-800">Training Not Completed</CardTitle>
                                    <CardDescription className="text-base mt-2">
                                        You need to score at least 80 to complete the training.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pb-8">
                                    <div className="py-6">
                                        <p className="text-sm text-slate-600 uppercase tracking-widest mb-3">Your Score</p>
                                        <p className="text-7xl font-bold text-orange-600 mb-4">
                                            {score}
                                        </p>
                                        <p className="text-lg text-slate-600">
                                            Minimum required: <span className="font-bold text-slate-800">80</span>
                                        </p>
                                    </div>

                                    <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg max-w-lg mx-auto">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-left">
                                                <h4 className="font-semibold text-slate-800 mb-2">Please Try Again</h4>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    Review the training material carefully and retake the quiz. You need to achieve a minimum score of 80 to receive your completion certificate.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-lg text-left max-w-md mx-auto space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Name:</span>
                                            <span className="font-medium">{userData?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">NIK:</span>
                                            <span className="font-medium">{userData?.nik}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Attempt Date:</span>
                                            <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <span className="font-medium text-orange-600">INCOMPLETE</span>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            onClick={() => {
                                                setStep("training")
                                                setAnswers({})
                                                setPdfReadConfirmed(false)
                                                setTimeSpentReading(0)
                                                window.scrollTo(0, 0)
                                            }}
                                            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-6 text-lg h-auto"
                                        >
                                            Review Material & Retake Quiz
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            // Score 80 or above - Show Certificate
                            <>
                        {/* On-screen certificate: scale-to-fit so it always fits mobile/tablet screens */}
                        <div ref={certificateViewportRef} className="w-full">
                            <div
                                className="mx-auto"
                                style={{
                                    width: CERT_BASE_WIDTH * certificateScale,
                                    height: (CERT_BASE_WIDTH / CERT_ASPECT_RATIO) * certificateScale,
                                }}
                            >
                                <div
                                    style={{
                                        width: CERT_BASE_WIDTH,
                                        height: CERT_BASE_WIDTH / CERT_ASPECT_RATIO,
                                        transform: `scale(${certificateScale})`,
                                        transformOrigin: "top left",
                                    }}
                                >
                        <Card className="w-[1100px] mx-auto shadow-2xl border-8 border-double border-slate-300 bg-white overflow-hidden" id="certificate-display">
                            <div className="relative aspect-[16/11] bg-gradient-to-br from-blue-50 via-white to-purple-50 p-12">
                                {/* Decorative Border Pattern */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Outer decorative frame */}
                                    <div className="absolute inset-8 border-4 border-double border-slate-300/50"></div>
                                    <div className="absolute inset-10 border border-slate-200/50"></div>
                                </div>

                                {/* Background Pattern/Texture */}
                                <div className="absolute inset-0 opacity-[0.03]" style={{
                                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px),
                                    repeating-linear-gradient(-45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)`,
                                    color: '#334155'
                                }}></div>
                                
                                {/* Subtle Dot Pattern */}
                                <div className="absolute inset-0 opacity-[0.02]" style={{
                                    backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}></div>

                                {/* Watermark Pattern */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none">
                                    <div className="text-9xl font-bold text-slate-800 transform rotate-[-45deg]">
                                        YONGJIN
                                    </div>
                                </div>

                                {/* Decorative Corner Ornaments */}
                                <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-blue-600 z-10">
                                    <div className="absolute top-2 left-2 w-12 h-12 border-l-2 border-t-2 border-blue-400"></div>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-purple-600 z-10">
                                    <div className="absolute top-2 right-2 w-12 h-12 border-r-2 border-t-2 border-purple-400"></div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-purple-600 z-10">
                                    <div className="absolute bottom-2 left-2 w-12 h-12 border-l-2 border-b-2 border-purple-400"></div>
                                </div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-blue-600 z-10">
                                    <div className="absolute bottom-2 right-2 w-12 h-12 border-r-2 border-b-2 border-blue-400"></div>
                                </div>

                                {/* Main Content - Landscape Layout */}
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    {/* Header Section */}
                                    <div className="flex flex-row items-center justify-between gap-4 mb-4">
                                        {/* Left: Logo */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src="/yongjinlogo.png"
                                                alt="Yongjin Logo"
                                                crossOrigin="anonymous"
                                                className="w-28 h-28 object-contain drop-shadow-lg"
                                            />
                                        </div>
                                        
                                        {/* Center: Company Info */}
                                        <div className="flex-1 text-center">
                                            <h2 className="text-2xl font-bold text-slate-800 mb-1 tracking-wide">
                                                PT. YONGJIN JAVASUKA GARMENT
                                            </h2>
                                            <div className="w-64 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-1"></div>
                                            <p className="text-base text-slate-600 font-medium">Internal Safety Training Program</p>
                                        </div>

                                        {/* Right: Score Badge */}
                                        <div className="flex-shrink-0">
                                            <div className={`relative w-28 h-28 rounded-full flex items-center justify-center ${score >= 80 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-orange-400 to-amber-500'} shadow-2xl ring-4 ring-white`}>
                                                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                                    <div className="text-center">
                                                        <p className={`text-4xl font-bold ${score >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                                                            {score}
                                                        </p>
                                                        <p className="text-xs text-slate-500 font-semibold tracking-wider">SCORE</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certificate Title */}
                                    <div className="text-center mb-3">
                                        <div className="inline-block px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
                                            <h3 className="text-xl font-bold text-white tracking-widest uppercase">
                                                Certificate of Completion
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="text-center flex-1 flex flex-col justify-center">
                                        <p className="text-base text-slate-600 mb-3 font-medium italic">
                                            This is to certify that
                                        </p>
                                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-blue-700 bg-clip-text text-transparent mb-3 tracking-wide px-2 py-1 leading-tight overflow-visible">
                                            {userData?.name}
                                        </h1>
                                        <div className="max-w-3xl mx-auto px-4">
                                            <p className="text-base text-slate-700 leading-relaxed mb-4">
                                                has successfully completed the <span className="font-bold text-blue-700">Safety Machine Training Program</span> and has demonstrated exceptional understanding of workplace safety protocols, machine operation standards, and commitment to maintaining a safe working environment.
                                            </p>
                                        </div>

                                        {/* User Details - Horizontal Layout */}
                                        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto mb-4">
                                            <div className="bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-lg border-2 border-blue-200 shadow-md">
                                                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Employee ID</p>
                                                <p className="text-base font-bold text-slate-800">{userData?.nik}</p>
                                            </div>
                                            <div className="bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-lg border-2 border-purple-200 shadow-md">
                                                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Department</p>
                                                <p className="text-base font-bold text-slate-800">{userData?.department}</p>
                                            </div>
                                            <div className="bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-lg border-2 border-blue-200 shadow-md">
                                                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Facility</p>
                                                <p className="text-base font-bold text-slate-800">{userData?.facility}</p>
                                            </div>
                                            <div className="bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-lg border-2 border-purple-200 shadow-md">
                                                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Date</p>
                                                <p className="text-base font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer - Signatures */}
                                    <div className="border-t-2 border-slate-200 pt-4">
                                        <div className="flex justify-between items-end max-w-3xl mx-auto px-4">
                                            <div className="text-center flex-1">
                                                <div className="inline-block">
                                                    <p className="text-sm font-bold text-slate-700 mb-1">David Eom</p>
                                                    <div className="w-36 border-t-2 border-slate-800 mb-1"></div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Director of Compliance</p>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 mx-8">
                                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg ring-2 ring-slate-200 p-2">
                                                    <img
                                                        src="/logoHojeon.png"
                                                        alt="Hojeon Logo"
                                                        crossOrigin="anonymous"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-center flex-1">
                                                <div className="inline-block">
                                                    <p className="text-sm font-bold text-slate-700 mb-1">Dennis Yu</p>
                                                    <div className="w-36 border-t-2 border-slate-800 mb-1"></div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Compliance Manager</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                                </div>
                            </div>
                        </div>

                        {/* Hidden certificate for export: fixed desktop/original layout */}
                        <div className="fixed left-[-10000px] top-0">
                            <Card className="w-[1100px] mx-auto shadow-2xl border-8 border-double border-slate-300 bg-white overflow-hidden" id="certificate-export">
                                <div className="relative aspect-[16/11] bg-gradient-to-br from-blue-50 via-white to-purple-50 p-12">
                                    {/* Decorative Border Pattern */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        {/* Outer decorative frame */}
                                        <div className="absolute inset-8 border-4 border-double border-slate-300/50"></div>
                                        <div className="absolute inset-10 border border-slate-200/50"></div>
                                    </div>

                                    {/* Background Pattern/Texture */}
                                    <div className="absolute inset-0 opacity-[0.03]" style={{
                                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px),
                                        repeating-linear-gradient(-45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)`,
                                        color: '#334155'
                                    }}></div>
                                    
                                    {/* Subtle Dot Pattern */}
                                    <div className="absolute inset-0 opacity-[0.02]" style={{
                                        backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                                        backgroundSize: '20px 20px'
                                    }}></div>

                                    {/* Watermark Pattern */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none">
                                        <div className="text-9xl font-bold text-slate-800 transform rotate-[-45deg]">
                                            YONGJIN
                                        </div>
                                    </div>

                                    {/* Decorative Corner Ornaments */}
                                    <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-blue-600 z-10">
                                        <div className="absolute top-2 left-2 w-12 h-12 border-l-2 border-t-2 border-blue-400"></div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-purple-600 z-10">
                                        <div className="absolute top-2 right-2 w-12 h-12 border-r-2 border-t-2 border-purple-400"></div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-purple-600 z-10">
                                        <div className="absolute bottom-2 left-2 w-12 h-12 border-l-2 border-b-2 border-purple-400"></div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-blue-600 z-10">
                                        <div className="absolute bottom-2 right-2 w-12 h-12 border-r-2 border-b-2 border-blue-400"></div>
                                    </div>

                                    {/* Main Content - Landscape Layout */}
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        {/* Header Section */}
                                        <div className="flex flex-row items-center justify-between gap-4 mb-4">
                                            {/* Left: Logo */}
                                            <div className="flex-shrink-0">
                                                <img
                                                    src="/yongjinlogo.png"
                                                    alt="Yongjin Logo"
                                                    crossOrigin="anonymous"
                                                    className="w-28 h-28 object-contain drop-shadow-lg"
                                                />
                                            </div>
                                            
                                            {/* Center: Company Info */}
                                            <div className="flex-1 text-center">
                                                <h2 className="text-2xl font-bold text-slate-800 mb-1 tracking-wide">
                                                    PT. YONGJIN JAVASUKA GARMENT
                                                </h2>
                                                <div className="w-64 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-1"></div>
                                                <p className="text-base text-slate-600 font-medium">Internal Safety Training Program</p>
                                            </div>

                                            {/* Right: Score Badge */}
                                            <div className="flex-shrink-0">
                                                <div className={`relative w-28 h-28 rounded-full flex items-center justify-center ${score >= 80 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-orange-400 to-amber-500'} shadow-2xl ring-4 ring-white`}>
                                                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                                        <div className="text-center">
                                                            <p className={`text-4xl font-bold ${score >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                                                                {score}
                                                            </p>
                                                            <p className="text-xs text-slate-500 font-semibold tracking-wider">SCORE</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Certificate Title */}
                                        <div className="text-center mb-3">
                                            <div className="inline-block px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
                                                <h3 className="text-xl font-bold text-white tracking-widest uppercase">
                                                    Certificate of Completion
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="text-center flex-1 flex flex-col justify-center">
                                            <p className="text-base text-slate-600 mb-3 font-medium italic">
                                                This is to certify that
                                            </p>
                                            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-blue-700 bg-clip-text text-transparent mb-3 tracking-wide px-2 py-1 leading-tight overflow-visible">
                                                {userData?.name}
                                            </h1>
                                            <div className="max-w-3xl mx-auto px-4">
                                                <p className="text-base text-slate-700 leading-relaxed mb-4">
                                                    has successfully completed the <span className="font-bold text-blue-700">Safety Machine Training Program</span> and has demonstrated exceptional understanding of workplace safety protocols, machine operation standards, and commitment to maintaining a safe working environment.
                                                </p>
                                            </div>

                                            {/* User Details - Horizontal Layout */}
                                            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto mb-4">
                                                <div className="bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-lg border-2 border-blue-200 shadow-md">
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Employee ID</p>
                                                    <p className="text-base font-bold text-slate-800">{userData?.nik}</p>
                                                </div>
                                                <div className="bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-lg border-2 border-purple-200 shadow-md">
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Department</p>
                                                    <p className="text-base font-bold text-slate-800">{userData?.department}</p>
                                                </div>
                                                <div className="bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-lg border-2 border-blue-200 shadow-md">
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Facility</p>
                                                    <p className="text-base font-bold text-slate-800">{userData?.facility}</p>
                                                </div>
                                                <div className="bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-lg border-2 border-purple-200 shadow-md">
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Date</p>
                                                    <p className="text-base font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer - Signatures */}
                                        <div className="border-t-2 border-slate-200 pt-4">
                                            <div className="flex justify-between items-end max-w-3xl mx-auto px-4">
                                                <div className="text-center flex-1">
                                                    <div className="inline-block">
                                                        <p className="text-sm font-bold text-slate-700 mb-1">David Eom</p>
                                                        <div className="w-36 border-t-2 border-slate-800 mb-1"></div>
                                                        <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Director of Compliance</p>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 mx-8">
                                                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg ring-2 ring-slate-200 p-2">
                                                        <img
                                                            src="/logoHojeon.png"
                                                            alt="Hojeon Logo"
                                                            crossOrigin="anonymous"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-center flex-1">
                                                    <div className="inline-block">
                                                        <p className="text-sm font-bold text-slate-700 mb-1">Dennis Yu</p>
                                                        <div className="w-36 border-t-2 border-slate-800 mb-1"></div>
                                                        <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Compliance Manager</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Action Buttons */}
                        <Card className="w-full max-w-6xl mx-auto shadow-lg border-0">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                                    <Button
                                        onClick={downloadCertificate}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 h-10 sm:h-11 text-sm sm:text-base w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Download Certificate
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => window.location.reload()}
                                        className="px-6 sm:px-8 h-10 sm:h-11 text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        Back to Home
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        </>
                        )}
                    </motion.div>
                )}
            </div>
        </div>

        {/* Floating dashboard access button (bottom-right) */}
        <div className="fixed right-4 bottom-4 z-50">
            <button
                onClick={handleOpenDashboard}
                className="flex items-center justify-center w-14 h-14 rounded-full shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:scale-105 transition-transform"
                aria-label="Open Dashboard"
            >
                <FileText className="w-6 h-6" />
            </button>
        </div>

        {/* Passkey Dialog */}
        {showPasskeyDialog && (
            <div className="fixed inset-0 z-60 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowPasskeyDialog(false)} />
                <Card className="z-70 w-full max-w-md mx-4">
                    <CardHeader>
                        <CardTitle>Enter Dashboard Passkey</CardTitle>
                        <CardDescription>Enter the admin passkey to access the Safety Machine dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input
                            type="password"
                            value={passkeyInput}
                            onChange={(e) => { setPasskeyInput(e.target.value); setPasskeyDialogError("") }}
                            placeholder="Passkey"
                            className="text-center tracking-widest"
                        />
                        {passkeyDialogError && (
                            <div className="text-sm text-red-600">{passkeyDialogError}</div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowPasskeyDialog(false)}>Cancel</Button>
                        <Button onClick={submitPasskeyDialog} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">Enter</Button>
                    </CardFooter>
                </Card>
            </div>
        )}

        </DefaultBackground>
    )
}
