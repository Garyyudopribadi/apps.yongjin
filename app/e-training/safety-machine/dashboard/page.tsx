"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@app/components/ui/card"
import { Button } from "@app/components/ui/button"
import { Input } from "@app/components/ui/input"
import DefaultBackground from "@app/components/layout/default-background"
import { supabase } from "@app/lib/supabase"
import { AlertCircle, CheckCircle2, Clock, Download, LogOut, ShieldCheck, Users, X, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface TrainingUser {
	id: number
	facility: string | null
	nik: string | null
	ktp: string | null
	name: string | null
	department: string | null
	sex: string | null
	status: boolean | null
	score: number | null
	date_verified: string | null
	ipaddress?: string | null
	answer?: any
}

const PASSKEY = "0123456"

type Language = "en" | "id"

const translations: Record<Language, {
	appTitle: string
	appSubtitle: string
	loadingTitle: string
	loadingSubtitle: string
	loadingBody: string
	passkeyTitle: string
	passkeyDescription: string
	passkeyPlaceholder: string
	passkeyButton: string
	passkeyHint: string
	authInvalid: string
	totalParticipants: string
	completedTraining: string
	completionRate: string
	avgScoreLabel: string
	avgScoreSubtitle: string
	pendingTraining: string
	pendingSubtitle: string
	filtersTitle: string
	filtersDescription: string
	searchLabel: string
	facilityLabel: string
	resetButton: string
	exportCsvButton: string
	allFacilities: string
	pendingSectionTitle: string
	pendingSectionSubtitle: string
	pendingEmpty: string
	completedSectionTitle: string
	completedSectionSubtitle: string
	completedEmpty: string
	columnName: string
	columnNik: string
	columnDepartment: string
	columnFacility: string
	columnScore: string
	columnLastVerified: string
	columnVerifiedAt: string
	columnActions: string
	logout: string
	exportError: string
	loadError: string
	answersTitle: string
	answersEmployee: string
	answersDepartment: string
	answersQuestion: string
	answersAnswer: string
}> = {
	en: {
		appTitle: "Safety Machine Training Dashboard",
		appSubtitle: "Live overview of training completion across facilities.",
		loadingTitle: "Loading Training Dashboard",
		loadingSubtitle: "Preparing Safety Machine training overview...",
		loadingBody: "",
		passkeyTitle: "Safety Machine Admin Dashboard",
		passkeyDescription: "Enter admin passkey to monitor training completion status.",
		passkeyPlaceholder: "Enter passkey (0123456)",
		passkeyButton: "Access Dashboard",
		passkeyHint: "For internal monitoring of E-Training Safety Machine completion only.",
		authInvalid: "Invalid passkey. Please try again.",
		totalParticipants: "Total Participants",
		completedTraining: "Completed Training",
		completionRate: "completion rate",
		avgScoreLabel: "Average Score (Completed)",
		avgScoreSubtitle: "Out of 100",
		pendingTraining: "Pending Training",
		pendingSubtitle: "Employees not yet completed",
		filtersTitle: "Filters",
		filtersDescription: "Search and segment training participants.",
		searchLabel: "Search",
		facilityLabel: "Facility",
		resetButton: "Reset",
		exportCsvButton: "Export CSV",
		allFacilities: "All Facilities",
		pendingSectionTitle: "Pending / Not Completed",
		pendingSectionSubtitle: "Users who have not passed the quiz (status not completed).",
		pendingEmpty: "All users have completed training for this filter.",
		completedSectionTitle: "Completed / Verified",
		completedSectionSubtitle: "Users who passed the quiz and received a certificate.",
		completedEmpty: "No completed users for this filter yet.",
		columnName: "Name",
		columnNik: "NIK",
		columnDepartment: "Department",
		columnFacility: "Facility",
		columnScore: "Score",
		columnLastVerified: "Last Verified",
		columnVerifiedAt: "Verified At",
		columnActions: "Actions",
		logout: "Logout",
		exportError: "Failed to export CSV. Please try again.",
		loadError: "Failed to load training data. Please try again later.",
		answersTitle: "Quiz Answers",
		answersEmployee: "Employee:",
		answersDepartment: "Department:",
		answersQuestion: "Question",
		answersAnswer: "Answer:",
	},
	id: {
		appTitle: "Dashboard Pelatihan Safety Machine",
		appSubtitle: "Ringkasan langsung status penyelesaian pelatihan di setiap pabrik.",
		loadingTitle: "Memuat Dashboard Pelatihan",
		loadingSubtitle: "Menyiapkan ringkasan pelatihan Safety Machine...",
		loadingBody: "",
		passkeyTitle: "Dashboard Admin Safety Machine",
		passkeyDescription: "Masukkan passkey admin untuk memantau status penyelesaian pelatihan.",
		passkeyPlaceholder: "Masukkan passkey (0123456)",
		passkeyButton: "Masuk ke Dashboard",
		passkeyHint: "Hanya untuk pemantauan internal penyelesaian E-Training Safety Machine.",
		authInvalid: "Passkey salah. Silakan coba lagi.",
		totalParticipants: "Total Peserta",
		completedTraining: "Pelatihan Selesai",
		completionRate: "tingkat penyelesaian",
		avgScoreLabel: "Rata-rata Skor (Lulus)",
		avgScoreSubtitle: "Dari 100",
		pendingTraining: "Pelatihan Tertunda",
		pendingSubtitle: "Karyawan yang belum menyelesaikan pelatihan",
		filtersTitle: "Filter",
		filtersDescription: "Cari dan kelompokkan peserta pelatihan.",
		searchLabel: "Pencarian",
		facilityLabel: "Pabrik",
		resetButton: "Reset",
		exportCsvButton: "Ekspor CSV",
		allFacilities: "Semua Pabrik",
		pendingSectionTitle: "Belum Selesai / Pending",
		pendingSectionSubtitle: "Pengguna yang belum lulus kuis (status belum selesai).",
		pendingEmpty: "Semua pengguna telah menyelesaikan pelatihan untuk filter ini.",
		completedSectionTitle: "Sudah Selesai / Terverifikasi",
		completedSectionSubtitle: "Pengguna yang lulus kuis dan sudah menerima sertifikat.",
		completedEmpty: "Belum ada pengguna yang selesai untuk filter ini.",
		columnName: "Nama",
		columnNik: "NIK",
		columnDepartment: "Departemen",
		columnFacility: "Pabrik",
		columnScore: "Skor",
		columnLastVerified: "Terakhir Verifikasi",
		columnVerifiedAt: "Waktu Verifikasi",
		columnActions: "Aksi",
		logout: "Keluar",
		exportError: "Gagal mengekspor CSV. Silakan coba lagi.",
		loadError: "Gagal memuat data pelatihan. Silakan coba lagi nanti.",
		answersTitle: "Jawaban Kuis",
		answersEmployee: "Karyawan:",
		answersDepartment: "Departemen:",
		answersQuestion: "Pertanyaan",
		answersAnswer: "Jawaban:",
	},
}

// Quiz questions to render friendly answers in the sheet (partial, used to map ids)
const QUIZ_QUESTIONS = [
	{ id: 1, question: "Apa pengertian Safety Machine?" },
	{ id: 2, question: "Apa fungsi utama dari Eye Guard?" },
	{ id: 3, question: "Apakah ketentuan penggunaan Needle Guard?" },
	{ id: 4, question: "Tanggung jawab Operator meliputi hal-hal berikut, KECUALI:" },
	{ id: 5, question: "Apa tanggung jawab utama Mekanik terkait Safety Machine?" },
]

export default function SafetyMachineDashboard() {
	const [language, setLanguage] = useState<Language>("en")
	const t = translations[language]
	const [allUsers, setAllUsers] = useState<TrainingUser[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const router = useRouter()

	const [passkey, setPasskey] = useState("")
	const [isAuthorized, setIsAuthorized] = useState(false)
	const [authError, setAuthError] = useState("")

	const [search, setSearch] = useState("")
	const [searchInput, setSearchInput] = useState("")
	const [facilityFilter, setFacilityFilter] = useState<string>("all")

	// Answers sheet state
	const [showAnswersSheet, setShowAnswersSheet] = useState(false)
	const [sheetUser, setSheetUser] = useState<TrainingUser | null>(null)

	// Pagination
	const PAGE_SIZE = 5
	const [verifiedPage, setVerifiedPage] = useState(0)
	const [unverifiedPage, setUnverifiedPage] = useState(0)

	// Debounce search input
	useEffect(() => {
		const t = setTimeout(() => setSearch(searchInput.trim()), 400)
		return () => clearTimeout(t)
	}, [searchInput])

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true)
				setError(null)

				// First request the exact count using a head query
				const countRes = await supabase
					.from("etraining-safetymachine")
					.select("id", { count: "exact", head: true })

				if (countRes.error) {
					// Fallback: try a simple select (may be capped at 1000)
					const { data, error } = await supabase
						.from("etraining-safetymachine")
						.select("id, facility, nik, ktp, name, department, sex, status, score, date_verified, ipaddress, answer")
						.order("id", { ascending: true })
					if (error) throw error
					setAllUsers((data as TrainingUser[]) || [])
					return
				}

				const total = countRes.count ?? 0
				if (total === 0) {
					setAllUsers([])
					return
				}

				// Fetch in batches (Supabase may cap single-response size). Use 1000 per batch.
				const batchSize = 1000
				let accumulated: TrainingUser[] = []
				for (let start = 0; start < total; start += batchSize) {
					const end = Math.min(total - 1, start + batchSize - 1)
					const res = await supabase
						.from("etraining-safetymachine")
						.select("id, facility, nik, ktp, name, department, sex, status, score, date_verified, ipaddress, answer")
						.order("id", { ascending: true })
						.range(start, end)
					if (res.error) throw res.error
					accumulated = accumulated.concat((res.data as TrainingUser[]) || [])
				}
				setAllUsers(accumulated)
			} catch (err: any) {
				console.error("Failed to load safety training data", err)
				setError("Failed to load training data. Please try again later.")
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [])

	// Auto-authorize if the floating button previously set a session flag
	useEffect(() => {
		if (typeof window !== "undefined") {
			const ok = sessionStorage.getItem("safetyMachineDashAuthorized")
			if (ok === "1") setIsAuthorized(true)
		}
	}, [])

	const handleAccess = () => {
		if (passkey === PASSKEY) {
			setIsAuthorized(true)
			setAuthError("")
		} else {
			setAuthError(t.authInvalid)
		}
	}

	const handleLogout = () => {
		setIsAuthorized(false)
		setPasskey("")
		setAuthError("")
		if (typeof window !== "undefined") sessionStorage.removeItem("safetyMachineDashAuthorized")
		router.push('/e-training/safety-machine')
	}

	const filteredUsers = useMemo(() => {
		let users = [...allUsers]

		if (facilityFilter !== "all") {
			users = users.filter((u) => (u.facility || "").toLowerCase() === facilityFilter.toLowerCase())
		}

		if (search) {
			const q = search.toLowerCase()
			users = users.filter((u) => {
				const fields = [u.name, u.nik, u.ktp, u.department, u.facility]
				return fields.some((f) => (f || "").toLowerCase().includes(q))
			})
		}

		return users
	}, [allUsers, facilityFilter, search])

	const openAnswersSheet = (user: TrainingUser) => {
		setSheetUser(user)
		setShowAnswersSheet(true)
	}

	const closeAnswersSheet = () => {
		setShowAnswersSheet(false)
		setSheetUser(null)
	}

	// Reset pages when filters change
	useEffect(() => {
		setVerifiedPage(0)
		setUnverifiedPage(0)
	}, [search, facilityFilter])

	const verifiedUsers = useMemo(
		() => filteredUsers.filter((u) => u.status === true),
		[filteredUsers]
	)
	const unverifiedUsers = useMemo(
		() => filteredUsers.filter((u) => !u.status),
		[filteredUsers]
	)

	const totalUsers = allUsers.length
	const totalCompleted = allUsers.filter((u) => u.status === true).length
	const avgScore = totalCompleted
		? allUsers
				.filter((u) => typeof u.score === "number")
				.reduce((sum, u) => sum + (u.score || 0), 0) / totalCompleted
		: 0

	const completionRate = totalUsers ? (totalCompleted / totalUsers) * 100 : 0

	const facilities = useMemo(() => {
		const set = new Set<string>()
		allUsers.forEach((u) => {
			if (u.facility) set.add(u.facility)
		})
		return Array.from(set).sort()
	}, [allUsers])

	const exportCsv = () => {
		try {
			const rows = [
				[
					"ID",
					"Name",
					"NIK",
					"KTP",
					"Department",
					"Facility",
					"Score",
					"Status",
					"Date Verified",
					"IP Address",
				],
				...filteredUsers.map((u) => [
					u.id,
					u.name || "",
					u.nik || "",
					u.ktp || "",
					u.department || "",
					u.facility || "",
					u.score ?? "",
					u.status ? "COMPLETED" : "NOT COMPLETED",
					u.date_verified ? new Date(u.date_verified).toLocaleString() : "-",
					u.ipaddress || "",
				]),
			]

			const csv = rows.map((r) => r.join(",")).join("\n")
			const blob = new Blob([csv], { type: "text/csv" })
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = `safety_machine_training_${new Date().toISOString().split("T")[0]}.csv`
			a.click()
			URL.revokeObjectURL(url)
		} catch (err) {
			console.error("Failed to export CSV", err)
			setError(t.exportError)
		}
	}

	// Loading state before auth (for data)
	if (isLoading) {
		return (
			<DefaultBackground>
				<div className="flex flex-col items-center justify-center h-screen">
					<div className="flex flex-col items-center justify-center space-y-6">
						<div className="relative">
							<div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
							<div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
						</div>
						<div className="text-center space-y-2">
							<h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
								{t.loadingTitle}
							</h1>
							<p className="text-muted-foreground">{t.loadingSubtitle}</p>
						</div>
					</div>
				</div>
			</DefaultBackground>
		)
	}

	// Passkey gate
	if (!isAuthorized) {
		return (
			<DefaultBackground showFooter={true}>
				<div className="flex-1 flex items-center justify-center px-4 py-8">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
						className="w-full max-w-md"
					>
						<Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
							<CardHeader className="text-center">
								<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center shadow-lg">
									<ShieldCheck className="w-8 h-8" />
								</div>
									<CardTitle className="text-xl">{t.passkeyTitle}</CardTitle>
									<CardDescription>
										{t.passkeyDescription}
									</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Input
										type="password"
										value={passkey}
										onChange={(e) => setPasskey(e.target.value)}
										placeholder={t.passkeyPlaceholder}
										className="w-full text-center tracking-[0.3em]"
									/>
								</div>

								{authError && (
									<motion.div
										initial={{ opacity: 0, y: -8 }}
										animate={{ opacity: 1, y: 0 }}
										className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
									>
										<AlertCircle className="w-4 h-4 text-red-500" />
										<span className="text-sm text-red-700">{authError}</span>
									</motion.div>
								)}

								<Button
									onClick={handleAccess}
									disabled={!passkey.trim()}
									className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
								>
									{t.passkeyButton}
								</Button>

								<p className="text-xs text-center text-slate-500">
									{t.passkeyHint}
								</p>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</DefaultBackground>
		)
	}

	return (
		<DefaultBackground showFooter={true}>
			<div className="px-3 sm:px-4 py-4 max-w-7xl mx-auto w-full">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
				>
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 bg-clip-text text-transparent">
							{t.appTitle}
						</h1>
						<p className="text-sm text-slate-600">
							{t.appSubtitle}
						</p>
					</div>
					<div className="flex items-center gap-2 self-end sm:self-auto">
						<div className="flex gap-1 mr-2">
							<button
								type="button"
								onClick={() => setLanguage("en")}
								className={`px-2 py-1 text-xs rounded-full border ${language === "en" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`}
							>
								EN
							</button>
							<button
								type="button"
								onClick={() => setLanguage("id")}
								className={`px-2 py-1 text-xs rounded-full border ${language === "id" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`}
							>
								ID
							</button>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleLogout}
							className="flex items-center gap-2"
						>
							<LogOut className="w-4 h-4" />
							{t.logout}
						</Button>
					</div>
				</motion.div>

				{/* Metrics */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					<Card>
						<CardContent className="p-5 flex items-start justify-between">
							<div>
								<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t.totalParticipants}</p>
								<p className="mt-2 text-2xl font-bold">{totalUsers}</p>
							</div>
							<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
								<Users className="w-5 h-5 text-blue-600" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-5 flex flex-col gap-3">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t.completedTraining}</p>
									<p className="mt-2 text-2xl font-bold">{totalCompleted}</p>
									<p className="text-xs text-slate-500 mt-1">
										{completionRate.toFixed(1)}% {t.completionRate}
									</p>
								</div>
								<div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
									<CheckCircle2 className="w-5 h-5 text-emerald-600" />
								</div>
							</div>
							<div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
								<motion.div
									className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-500"
									initial={{ width: 0 }}
									animate={{ width: `${Math.min(100, completionRate)}%` }}
									transition={{ duration: 0.8 }}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-5 flex items-start justify-between">
							<div>
								<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t.avgScoreLabel}</p>
								<p className="mt-2 text-2xl font-bold">{avgScore.toFixed(1)}</p>
								<p className="text-xs text-slate-500 mt-1">{t.avgScoreSubtitle}</p>
							</div>
							<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
								<ShieldCheck className="w-5 h-5 text-purple-600" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-5 flex items-start justify-between">
							<div>
								<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t.pendingTraining}</p>
								<p className="mt-2 text-2xl font-bold">{totalUsers - totalCompleted}</p>
								<p className="text-xs text-slate-500 mt-1">{t.pendingSubtitle}</p>
							</div>
							<div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
								<Clock className="w-5 h-5 text-amber-600" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filters & Export */}
				<Card className="mb-6">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{t.filtersTitle}</CardTitle>
						<CardDescription>{t.filtersDescription}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div>
								<p className="text-xs font-medium text-slate-500 mb-1">{t.searchLabel}</p>
								<Input
									placeholder="Name, NIK, KTP, department, facility..."
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
								/>
							</div>
							<div>
								<p className="text-xs font-medium text-slate-500 mb-1">{t.facilityLabel}</p>
								<select
									value={facilityFilter}
									onChange={(e) => setFacilityFilter(e.target.value)}
									className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
								>
									<option value="all">{t.allFacilities}</option>
									{facilities.map((f) => (
										<option key={f} value={f}>
											{f}
										</option>
									))}
								</select>
							</div>
							<div className="flex items-end gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setSearchInput("")
										setSearch("")
										setFacilityFilter("all")
									}}
								>
									{t.resetButton}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={exportCsv}
									className="flex items-center gap-2"
								>
									<Download className="w-4 h-4" />
									{t.exportCsvButton}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Tables: Unverified & Verified */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
					{/* Unverified */}
					<Card className="border-amber-200/70">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between gap-2">
								<div>
									<CardTitle className="text-base flex items-center gap-2">
										<Clock className="w-4 h-4 text-amber-600" />
										{t.pendingSectionTitle}
									</CardTitle>
									<CardDescription className="text-xs">{t.pendingSectionSubtitle}</CardDescription>
								</div>
								<span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
									{unverifiedUsers.length} users
								</span>
							</div>
						</CardHeader>
						<CardContent className="overflow-x-auto max-h-[420px]">
							<table className="w-full text-xs sm:text-sm">
								<thead className="bg-slate-50">
									<tr>
										<th className="p-2 text-left">{t.columnName}</th>
										<th className="p-2 text-left">{t.columnNik}</th>
										<th className="p-2 text-left">{t.columnDepartment}</th>
										<th className="p-2 text-left">{t.columnFacility}</th>
										<th className="p-2 text-left">{t.columnScore}</th>
										<th className="p-2 text-left">{t.columnLastVerified}</th>
									</tr>
								</thead>
								<tbody>
									{unverifiedUsers.length === 0 && (
										<tr>
											<td className="p-3 text-center text-slate-500" colSpan={6}>
												{t.pendingEmpty}
											</td>
										</tr>
									)}
									{(function(){
										const start = unverifiedPage * PAGE_SIZE
										const end = start + PAGE_SIZE
										return unverifiedUsers.slice(start, end).map((u) => (
										<tr key={u.id} className="border-b last:border-0">
											<td className="p-2 font-medium text-slate-800">{u.name || "-"}</td>
											<td className="p-2 font-mono text-xs">{u.nik || "-"}</td>
											<td className="p-2">{u.department || "-"}</td>
											<td className="p-2">{u.facility || "-"}</td>
											<td className="p-2">{u.score ?? "-"}</td>
											<td className="p-2 text-xs text-slate-500">
												{u.date_verified ? new Date(u.date_verified).toLocaleDateString() : "-"}
											</td>
												</tr>
										))
									})()}
								</tbody>
							</table>
							<div className="flex items-center justify-center mt-3">
								<div className="flex items-center gap-2">
									<button
										onClick={() => setUnverifiedPage(0)}
										disabled={unverifiedPage === 0}
										aria-label="First page"
										className="p-2 rounded-full border bg-white hover:shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronsLeft className="w-4 h-4 text-slate-700" />
									</button>
									<button
										onClick={() => setUnverifiedPage(p => Math.max(0, p - 1))}
										disabled={unverifiedPage === 0}
										aria-label="Previous page"
										className="p-2 rounded-full border bg-white hover:shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronLeft className="w-4 h-4 text-slate-700" />
									</button>

									<div className="px-3 py-1 bg-slate-50 rounded text-sm text-slate-600">
										{Math.min(unverifiedUsers.length, unverifiedPage * PAGE_SIZE + 1)} - {Math.min(unverifiedUsers.length, (unverifiedPage + 1) * PAGE_SIZE)} of {unverifiedUsers.length}
									</div>

									<button
										onClick={() => setUnverifiedPage(p => Math.min(Math.max(0, Math.ceil(unverifiedUsers.length / PAGE_SIZE) - 1), p + 1))}
										disabled={unverifiedPage >= Math.ceil(unverifiedUsers.length / PAGE_SIZE) - 1}
										aria-label="Next page"
										className="p-2 rounded-full border bg-white hover:shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronRight className="w-4 h-4 text-slate-700" />
									</button>
									<button
										onClick={() => setUnverifiedPage(Math.max(0, Math.ceil(unverifiedUsers.length / PAGE_SIZE) - 1))}
										disabled={unverifiedPage >= Math.ceil(unverifiedUsers.length / PAGE_SIZE) - 1}
										aria-label="Last page"
										className="p-2 rounded-full border bg-white hover:shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronsRight className="w-4 h-4 text-slate-700" />
									</button>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Verified */}
					<Card className="border-emerald-200/70">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between gap-2">
								<div>
									<CardTitle className="text-base flex items-center gap-2">
										<CheckCircle2 className="w-4 h-4 text-emerald-600" />
										{t.completedSectionTitle}
									</CardTitle>
									<CardDescription className="text-xs">{t.completedSectionSubtitle}</CardDescription>
								</div>
								<span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
									{verifiedUsers.length} users
								</span>
							</div>
						</CardHeader>
						<CardContent className="overflow-x-auto max-h-[420px]">
							<table className="w-full text-xs sm:text-sm">
								<thead className="bg-slate-50">
									<tr>
										<th className="p-2 text-left">{t.columnName}</th>
										<th className="p-2 text-left">{t.columnNik}</th>
										<th className="p-2 text-left">{t.columnDepartment}</th>
										<th className="p-2 text-left">{t.columnFacility}</th>
										<th className="p-2 text-left">{t.columnScore}</th>
										<th className="p-2 text-left">{t.columnVerifiedAt}</th>
										<th className="p-2 text-left">{t.columnActions}</th>
									</tr>
								</thead>
								<tbody>
									{verifiedUsers.length === 0 && (
										<tr>
											<td className="p-3 text-center text-slate-500" colSpan={6}>
												{t.completedEmpty}
											</td>
										</tr>
									)}
									{(function(){
										const start = verifiedPage * PAGE_SIZE
										const end = start + PAGE_SIZE
										return verifiedUsers.slice(start, end).map((u) => (
										<tr key={u.id} className="border-b last:border-0">
											<td className="p-2 font-medium text-slate-800">{u.name || "-"}</td>
											<td className="p-2 font-mono text-xs">{u.nik || "-"}</td>
											<td className="p-2">{u.department || "-"}</td>
											<td className="p-2">{u.facility || "-"}</td>
											<td className="p-2">{u.score ?? "-"}</td>
											<td className="p-2 text-xs text-slate-500">
												{u.date_verified ? new Date(u.date_verified).toLocaleDateString() : "-"}
											</td>
											<td className="p-2 text-right">
												<button
													onClick={() => openAnswersSheet(u)}
													className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200"
													aria-label="View Answers"
												>
													<Eye className="w-4 h-4" />
												</button>
											</td>
										</tr>
										))
									})()}
								</tbody>
							</table>
							<div className="flex items-center justify-center mt-3">
								<div className="flex items-center gap-2">
									<button
										onClick={() => setVerifiedPage(0)}
										disabled={verifiedPage === 0}
										aria-label="First page"
										className="p-2 rounded-full border bg-white hover:shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronsLeft className="w-4 h-4 text-slate-700" />
									</button>
									<button
										onClick={() => setVerifiedPage(p => Math.max(0, p - 1))}
										disabled={verifiedPage === 0}
										aria-label="Previous page"
										className="p-2 rounded-full border bg-white hover:shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronLeft className="w-4 h-4 text-slate-700" />
									</button>

									<div className="px-3 py-1 bg-slate-50 rounded text-sm text-slate-600">
										{Math.min(verifiedUsers.length, verifiedPage * PAGE_SIZE + 1)} - {Math.min(verifiedUsers.length, (verifiedPage + 1) * PAGE_SIZE)} of {verifiedUsers.length}
									</div>

									<button
										onClick={() => setVerifiedPage(p => Math.min(Math.max(0, Math.ceil(verifiedUsers.length / PAGE_SIZE) - 1), p + 1))}
										disabled={verifiedPage >= Math.ceil(verifiedUsers.length / PAGE_SIZE) - 1}
										aria-label="Next page"
										className="p-2 rounded-full border bg-white hover:shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronRight className="w-4 h-4 text-slate-700" />
									</button>
									<button
										onClick={() => setVerifiedPage(Math.max(0, Math.ceil(verifiedUsers.length / PAGE_SIZE) - 1))}
										disabled={verifiedPage >= Math.ceil(verifiedUsers.length / PAGE_SIZE) - 1}
										aria-label="Last page"
										className="p-2 rounded-full border bg-white hover:shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronsRight className="w-4 h-4 text-slate-700" />
									</button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{error && (
					<div className="mt-2 flex items-center gap-2 text-xs text-red-600">
						<AlertCircle className="w-3 h-3" />
						<span>{error}</span>
					</div>
				)}

				{/* Answers Slide-over Sheet */}
				{showAnswersSheet && sheetUser && (
					<div className="fixed inset-0 z-60 flex">
						<div className="absolute inset-0 bg-black/40" onClick={closeAnswersSheet} />
						<div className="ml-auto w-full sm:w-[520px] bg-white h-full shadow-2xl overflow-auto p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-bold">{t.answersTitle} — {sheetUser.name}</h3>
								<button onClick={closeAnswersSheet} className="p-2 rounded hover:bg-slate-100">
									<X className="w-5 h-5" />
								</button>
							</div>
							<div className="mb-4">
								<div className="text-sm text-slate-600 mb-2">{t.answersEmployee} <span className="font-medium">{sheetUser.nik || '-'}</span></div>
								<div className="text-sm text-slate-600">{t.answersDepartment} <span className="font-medium">{sheetUser.department || '-'}</span></div>
							</div>
							<div className="space-y-3">
								{/* Render answers; fall back to showing JSON if structure unknown */}
								{sheetUser.answer && typeof sheetUser.answer === 'object' ? (
									Object.keys(sheetUser.answer).map((k) => {
										const qid = Number(k)
										const selected = sheetUser.answer[k]
										const q = QUIZ_QUESTIONS.find(x => x.id === qid)
										return (
											<div key={k} className="p-3 border rounded">
												<div className="text-sm text-slate-500">{t.answersQuestion} {qid}{q ? ` — ${q.question}` : ''}</div>
												<div className="mt-2 font-medium">{t.answersAnswer} <span className="ml-2">{String(selected)}</span></div>
											</div>
										)
									})
								) : (
									<pre className="text-xs bg-slate-50 p-3 rounded">{JSON.stringify(sheetUser.answer || {}, null, 2)}</pre>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</DefaultBackground>
	)
}

