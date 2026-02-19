"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import DefaultBackground from "@app/components/layout/default-background"
import DashboardAccess from "@app/components/survey/dashboard-access"
import { Button } from "@app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/components/ui/card"
import { Input } from "@app/components/ui/input"
import { supabase } from "@app/lib/supabase"
import {
	ChevronLeft,
	ChevronRight,
	Download,
	LogOut,
	Toilet,
	Users,
	MapPin,
	Check,
	X,
} from "lucide-react"

interface SurveyData {
	id?: number
	nik: string
	ktp: string
	name: string
	department: string
	sex: string
	preferred_toilet?: string
	reason_preference?: string
	nearest_toilet?: string
	suggestion_improvement?: string
	date_verified: string | null
}

export default function Dashboard() {
	const [surveyData, setSurveyData] = useState<SurveyData[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [totalRecords, setTotalRecords] = useState(0)
	const [searchTerm, setSearchTerm] = useState("")
	const [inputValue, setInputValue] = useState("")
	const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all")
	const [departmentFilter, setDepartmentFilter] = useState<string>("all")
	const [totalVoted, setTotalVoted] = useState(0)
	const [totalNotVoted, setTotalNotVoted] = useState(0)
	const [totalEmployees, setTotalEmployees] = useState(0)
	const [percentageVoted, setPercentageVoted] = useState(0)

	const [departments, setDepartments] = useState<string[]>([])

	// Stats for Preferred Toilet
	const [statsPreferred, setStatsPreferred] = useState<{ [key: string]: number }>({})

	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage] = useState(10)

	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [passkey, setPasskey] = useState("")
	const [dashboardError, setDashboardError] = useState("")

	const isFirstLoad = useRef(true)

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearchTerm(inputValue)
		}, 500)
		return () => clearTimeout(timer)
	}, [inputValue])

	useEffect(() => {
		const authStatus = document.cookie
			.split("; ")
			.find((row) => row.startsWith("dashboardAuthenticated="))
			?.split("=")[1]
		if (authStatus === "true") {
			setIsAuthenticated(true)
		}
	}, [])

	useEffect(() => {
		if (!isAuthenticated) return

		const fetchDepartments = async () => {
			try {
				const { data, error } = await supabase
					.from("survey_warehousetoilet_yongjinone")
					.select("department")
					.order("department")

				if (error) throw error

				const uniqueDepartments = Array.from(new Set(data?.map((d) => d.department) || [])).sort()
				setDepartments(uniqueDepartments)
			} catch (error) {
				console.error("Error fetching departments:", error)
			}
		}

		fetchDepartments()
	}, [isAuthenticated])

	useEffect(() => {
		if (!isAuthenticated) return

		const fetchSurveyData = async (
			page: number = 1,
			search: string = "",
			verified: "all" | "verified" | "unverified" = "all",
			department: string = "all",
		) => {
			try {
				if (isFirstLoad.current) setIsLoading(true)
				let query = supabase
					.from("survey_warehousetoilet_yongjinone")
					.select("id, nik, ktp, name, department, sex, preferred_toilet, reason_preference, nearest_toilet, suggestion_improvement, date_verified", { count: "exact" })

				if (search) {
					query = query.or(`name.ilike.%${search}%,nik.ilike.%${search}%,ktp.ilike.%${search}%`)
				}

				if (verified === "verified") {
					query = query.not("date_verified", "is", null)
				} else if (verified === "unverified") {
					query = query.is("date_verified", null)
				}

				if (department !== "all") {
					query = query.eq("department", department)
				}

				const from = (page - 1) * itemsPerPage
				const to = from + itemsPerPage - 1
				query = query.range(from, to).order("id", { ascending: true })

				const { data, error, count } = await query

				if (error) throw error
				setSurveyData(data || [])
				setTotalRecords(count || 0)
			} catch (error) {
				console.error("Error fetching survey data:", error)
			} finally {
				setIsLoading(false)
				isFirstLoad.current = false
			}
		}

		fetchSurveyData(currentPage, searchTerm, verifiedFilter, departmentFilter)
	}, [isAuthenticated, currentPage, searchTerm, verifiedFilter, departmentFilter, itemsPerPage])

	useEffect(() => {
		if (!isAuthenticated) return

		const fetchStatistics = async () => {
			try {
				const { count: totalEmployeesCount } = await supabase
					.from("survey_warehousetoilet_yongjinone")
					.select("*", { count: "exact", head: true })
				setTotalEmployees(totalEmployeesCount || 0)

				const { count: votedCount, data: votedData } = await supabase
					.from("survey_warehousetoilet_yongjinone")
					.select("preferred_toilet", { count: "exact" })
					.not("date_verified", "is", null)

				setTotalVoted(votedCount || 0)
				setPercentageVoted((totalEmployeesCount || 0) > 0 ? ((votedCount || 0) / (totalEmployeesCount || 0)) * 100 : 0)

				const { count: notVotedCount } = await supabase
					.from("survey_warehousetoilet_yongjinone")
					.select("*", { count: "exact", head: true })
					.is("date_verified", null)
				setTotalNotVoted(notVotedCount || 0)

				// Calculate stats 
				const stats: { [key: string]: number } = {}

				if (votedData) {
					votedData.forEach((item: any) => {
						if (item.preferred_toilet) {
							const toilet = item.preferred_toilet
							stats[toilet] = (stats[toilet] || 0) + 1
						}
					})
				}
				setStatsPreferred(stats)

			} catch (error) {
				console.error("Error fetching statistics:", error)
			}
		}

		fetchStatistics()
	}, [isAuthenticated])

	const handleExport = () => {
		const exportData = async () => {
			try {
				let query = supabase
					.from("survey_warehousetoilet_yongjinone")
					.select("id, nik, ktp, name, department, sex, preferred_toilet, reason_preference, nearest_toilet, suggestion_improvement, date_verified")

				if (searchTerm) {
					query = query.or(`name.ilike.%${searchTerm}%,nik.ilike.%${searchTerm}%,ktp.ilike.%${searchTerm}%`)
				}

				if (verifiedFilter === "verified") {
					query = query.not("date_verified", "is", null)
				} else if (verifiedFilter === "unverified") {
					query = query.is("date_verified", null)
				}

				if (departmentFilter !== "all") {
					query = query.eq("department", departmentFilter)
				}

				const { data, error } = await query.order("id", { ascending: true })
				if (error) throw error

				const rows = [
					["NIK", "KTP", "Nama", "Department", "Toilet Pilihan", "Alasan", "Toilet Terdekat (Persepsi)", "Saran", "Tanggal Verifikasi"],
					...(data || []).map((d) => {
						return [
							d.nik,
							d.ktp,
							d.name,
							d.department,
							d.preferred_toilet || "-",
							`"${(d.reason_preference || "").replace(/"/g, '""')}"`, // Escape quotes for CSV
							`"${(d.nearest_toilet || "").replace(/"/g, '""')}"`,
							`"${(d.suggestion_improvement || "").replace(/"/g, '""')}"`,
							d.date_verified ? new Date(d.date_verified).toLocaleString() : "Unverified",
						]
					}),
				]

				const csv = rows.map((r) => r.join(",")).join("\n")
				const blob = new Blob([csv], { type: "text/csv" })
				const url = URL.createObjectURL(blob)
				const a = document.createElement("a")
				a.href = url
				a.download = `survey_warehouse_toilet_${new Date().toISOString().split("T")[0]}.csv`
				a.click()
				URL.revokeObjectURL(url)
			} catch (error) {
				console.error("Error exporting data:", error)
			}
		}
		exportData()
	}

	const handleBack = () => {
		setIsAuthenticated(false)
		document.cookie = "dashboardAuthenticated=; path=/; max-age=0"
		setPasskey("")
		setDashboardError("")
		window.location.href = "/yongjinone/survey/warehouse-toilet"
	}

	const handleAccess = () => {
		if (passkey === "0000") {
			setIsAuthenticated(true)
			document.cookie = "dashboardAuthenticated=true; path=/; max-age=3600"
			setDashboardError("")
		} else {
			setDashboardError("Passkey salah.")
		}
	}

	const total = totalEmployees

	const totalPages = Math.ceil(totalRecords / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage

	useEffect(() => {
		setCurrentPage(1)
	}, [searchTerm, verifiedFilter, departmentFilter])

	if (!isAuthenticated) {
		return (
			<DefaultBackground showFooter={true}>
				<div className="min-h-[70vh] flex items-center justify-center px-4">
					<DashboardAccess
						passkey={passkey}
						setPasskey={setPasskey}
						dashboardError={dashboardError}
						onAccess={handleAccess}
						onBack={handleBack}
					/>
				</div>
			</DefaultBackground>
		)
	}

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
							<h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
								Loading Survey Data
							</h1>
							<p className="text-muted-foreground">Preparing your dashboard...</p>
						</div>
						<div className="w-64 space-y-2">
							<div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
								<div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "65%" }}></div>
							</div>
							<p className="text-xs text-muted-foreground text-center">Fetching results</p>
						</div>
					</div>
				</div>
			</DefaultBackground>
		)
	}

	return (
		<DefaultBackground showFooter={true}>
			<div className="p-4 max-w-7xl mx-auto">
				<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold">Dashboard Survey Toilet Warehouse</h1>
							<p className="text-sm text-slate-600">Hasil voting & aspirasi karyawan</p>
						</div>
						<div className="flex gap-2">
							<Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
								<LogOut className="w-4 h-4" />Logout
							</Button>
						</div>
					</div>
				</motion.div>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
					{/* General Stats */}
					<Card>
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-slate-600">Total Employees</p>
									<p className="text-2xl font-bold">{totalEmployees}</p>
								</div>
								<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
									<Users className="w-6 h-6 text-blue-600" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-slate-600">Total Response</p>
									<p className="text-2xl font-bold">{totalVoted}</p>
									<p className="text-sm text-slate-500">{percentageVoted.toFixed(1)}% voted</p>
									<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
										<motion.div
											className="bg-green-600 h-2 rounded-full"
											initial={{ width: 0 }}
											animate={{ width: `${percentageVoted}%` }}
											transition={{ duration: 1 }}
										/>
									</div>
								</div>
								<div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
									<Toilet className="w-6 h-6 text-purple-600" />
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Preferred Toilet Stats */}
					{['Toilet Cutting', 'Toilet Samping Downroom', 'Toilet Luar'].map(option => {
						const count = statsPreferred[option] || 0
						const pct = totalVoted > 0 ? (count / totalVoted) * 100 : 0
						return (
							<Card key={option}>
								<CardContent className="p-6">
									<div className="flex items-start justify-between">
										<div>
											<p className="text-sm text-slate-600 line-clamp-1" title={option}>{option}</p>
											<p className="text-2xl font-bold">{count}</p>
											<p className="text-sm text-slate-500">{pct.toFixed(1)}%</p>
											<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
												<motion.div
													className="bg-indigo-600 h-2 rounded-full"
													initial={{ width: 0 }}
													animate={{ width: `${pct}%` }}
													transition={{ duration: 1 }}
												/>
											</div>
										</div>
										<div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
											<MapPin className="w-6 h-6 text-indigo-600" />
										</div>
									</div>
								</CardContent>
							</Card>
						)
					})}
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Data Karyawan</CardTitle>
						<CardDescription>Detail jawaban setiap karyawan</CardDescription>
					</CardHeader>

					<div className="px-6 pb-4">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
							<div>
								<label className="block text-sm font-medium mb-2">Search</label>
								<Input
									placeholder="Search by name, NIK, or KTP..."
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2">Status</label>
								<select
									value={verifiedFilter}
									onChange={(e) => setVerifiedFilter(e.target.value as "all" | "verified" | "unverified")}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="all">All</option>
									<option value="verified">Verified</option>
									<option value="unverified">Unverified</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2">Department</label>
								<select
									value={departmentFilter}
									onChange={(e) => setDepartmentFilter(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="all">All Departments</option>
									{departments.map((dept) => (
										<option key={dept} value={dept}>
											{dept}
										</option>
									))}
								</select>
							</div>
							<div className="flex items-end gap-2">
								<Button
									variant="outline"
									onClick={() => {
										setInputValue("")
										setSearchTerm("")
										setVerifiedFilter("all")
										setDepartmentFilter("all")
									}}
								>
									Clear Filters
								</Button>
								<Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
									<Download className="w-4 h-4" />Export CSV
								</Button>
							</div>
						</div>
					</div>

					<CardContent className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b bg-slate-50 dark:bg-slate-900/50">
									<th className="p-3 text-left font-medium">No</th>
									<th className="p-3 text-left font-medium">NIK/Nama</th>
									<th className="p-3 text-left font-medium">Department</th>
									<th className="p-3 text-left font-medium">Toilet Pilihan</th>
									<th className="p-3 text-left font-medium md:table-cell hidden">Alasan</th>
									<th className="p-3 text-left font-medium md:table-cell hidden">Toilet Terdekat</th>
									<th className="p-3 text-left font-medium md:table-cell hidden">Saran</th>
									<th className="p-3 text-left font-medium">Tgl Verifikasi</th>
								</tr>
							</thead>
							<tbody>
								{surveyData.map((d, index) => (
									<tr key={d.id || d.nik} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
										<td className="p-3 align-top text-slate-500">{startIndex + index + 1}</td>
										<td className="p-3 align-top">
											<div className="font-medium text-slate-900 dark:text-slate-100">{d.name}</div>
											<div className="text-xs text-slate-500">{d.nik}</div>
										</td>
										<td className="p-3 align-top">{d.department}</td>
										<td className="p-3 align-top">
											{d.preferred_toilet ? (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
													{d.preferred_toilet}
												</span>
											) : (
												<span className="text-slate-400 italic text-xs">-</span>
											)}
										</td>
										<td className="p-3 align-top max-w-[200px] md:table-cell hidden text-slate-600 dark:text-slate-300 truncate" title={d.reason_preference}>
											{d.reason_preference}
										</td>
										<td className="p-3 align-top max-w-[150px] md:table-cell hidden text-slate-600 dark:text-slate-300 truncate" title={d.nearest_toilet}>
											{d.nearest_toilet}
										</td>
										<td className="p-3 align-top max-w-[200px] md:table-cell hidden text-slate-600 dark:text-slate-300 truncate" title={d.suggestion_improvement}>
											{d.suggestion_improvement}
										</td>
										<td className="p-3 align-top text-slate-500 text-xs">
											{d.date_verified ? new Date(d.date_verified).toLocaleString('id-ID', { year: '2-digit', month: '2-digit', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
										</td>
									</tr>
								))}
								{surveyData.length === 0 && !isLoading && (
									<tr>
										<td colSpan={8} className="p-8 text-center text-slate-500">
											Tidak ada data ditemukan.
										</td>
									</tr>
								)}
							</tbody>
						</table>

						{totalPages > 1 && (
							<div className="flex items-center justify-between mt-4 px-2">
								<div className="text-sm text-gray-700 dark:text-gray-400">
									Page {currentPage} of {totalPages}
								</div>
								<div className="flex items-center space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
										disabled={currentPage === 1}
									>
										<ChevronLeft className="w-4 h-4" />
									</Button>

									<span className="text-xs text-slate-500">...</span>

									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
										disabled={currentPage === totalPages}
									>
										<ChevronRight className="w-4 h-4" />
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</DefaultBackground>
	)
}
