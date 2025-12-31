"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@app/components/ui/card"
import { Button } from "@app/components/ui/button"
import { Input } from "@app/components/ui/input"
import DefaultBackground from "@app/components/layout/default-background"
import { Users, Utensils, Download, ArrowLeft, Table, Flower, ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import DashboardAccess from '@app/components/survey/dashboard-access'
import { supabase } from "@app/lib/supabase"

interface SurveyData {
	id?: number
	nik: string
	ktp: string
	name: string
	department: string
	sex: string
	option_a: boolean
	option_b: boolean
	date_verified: string | null
}

export default function Dashboard() {
	const [surveyData, setSurveyData] = useState<SurveyData[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [totalRecords, setTotalRecords] = useState(0)
	const [searchTerm, setSearchTerm] = useState('')
	const [inputValue, setInputValue] = useState('')
	const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all')
	const [departmentFilter, setDepartmentFilter] = useState<string>('all')
	const [totalVoted, setTotalVoted] = useState(0)
	const [totalNotVoted, setTotalNotVoted] = useState(0)
	const [optionA, setOptionA] = useState(0)
	const [optionB, setOptionB] = useState(0)
	const [totalEmployees, setTotalEmployees] = useState(0)
	const [departments, setDepartments] = useState<string[]>([])

	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage] = useState(10)

	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [passkey, setPasskey] = useState('')
	const [dashboardError, setDashboardError] = useState('')

	const isFirstLoad = useRef(true)

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearchTerm(inputValue)
		}, 500)
		return () => clearTimeout(timer)
	}, [inputValue])

	useEffect(() => {
		const authStatus = document.cookie.split('; ').find(row => row.startsWith('dashboardAuthenticated='))?.split('=')[1]
		if (authStatus === 'true') {
			setIsAuthenticated(true)
		}
	}, [])

	useEffect(() => {
		const fetchDepartments = async () => {
			try {
				const { data, error } = await supabase
					.from('survey_kantin_yongjinone')
					.select('department')
					.order('department')

				if (error) throw error

				const uniqueDepartments = Array.from(new Set(data?.map(d => d.department) || [])).sort()
				setDepartments(uniqueDepartments)
			} catch (error) {
				console.error('Error fetching departments:', error)
			}
		}

		fetchDepartments()
	}, [])

	useEffect(() => {
		const fetchSurveyData = async (page: number = 1, search: string = '', verified: 'all' | 'verified' | 'unverified' = 'all', department: string = 'all') => {
			try {
				if (isFirstLoad.current) setIsLoading(true)
				let query = supabase
					.from('survey_kantin_yongjinone')
					.select('id, nik, ktp, name, department, sex, option_a, option_b, date_verified', { count: 'exact' })

				// Apply filters
				if (search) {
					query = query.or(`name.ilike.%${search}%,nik.ilike.%${search}%,ktp.ilike.%${search}%`)
				}

				if (verified === 'verified') {
					query = query.not('date_verified', 'is', null)
				} else if (verified === 'unverified') {
					query = query.is('date_verified', null)
				}

				if (department !== 'all') {
					query = query.eq('department', department)
				}

				// Apply pagination
				const from = (page - 1) * itemsPerPage
				const to = from + itemsPerPage - 1
				query = query.range(from, to).order('id', { ascending: true })

				const { data, error, count } = await query

				if (error) throw error
				console.log(`Page ${page}: Fetched ${data?.length || 0} records from database`)
				setSurveyData(data || [])
				setTotalRecords(count || 0)
			} catch (error) {
				console.error('Error fetching survey data:', error)
			} finally {
				setIsLoading(false)
				isFirstLoad.current = false
			}
		}

		fetchSurveyData(currentPage, searchTerm, verifiedFilter, departmentFilter)
	}, [currentPage, searchTerm, verifiedFilter, departmentFilter, itemsPerPage])

	useEffect(() => {
		const fetchStatistics = async () => {
			try {
				// Count total employees
				const { count: totalEmployeesCount } = await supabase
					.from('survey_kantin_yongjinone')
					.select('*', { count: 'exact', head: true })
				setTotalEmployees(totalEmployeesCount || 0)

				// Count total voted (date_verified is not null)
				const { count: votedCount } = await supabase
					.from('survey_kantin_yongjinone')
					.select('*', { count: 'exact', head: true })
					.not('date_verified', 'is', null)
				setTotalVoted(votedCount || 0)

				// Count total not voted (date_verified is null)
				const { count: notVotedCount } = await supabase
					.from('survey_kantin_yongjinone')
					.select('*', { count: 'exact', head: true })
					.is('date_verified', null)
				setTotalNotVoted(notVotedCount || 0)

				// Count option A (meja makan)
				const { count: optionACount } = await supabase
					.from('survey_kantin_yongjinone')
					.select('*', { count: 'exact', head: true })
					.eq('option_a', true)
				setOptionA(optionACount || 0)

				// Count option B (istirahat di taman)
				const { count: optionBCount } = await supabase
					.from('survey_kantin_yongjinone')
					.select('*', { count: 'exact', head: true })
					.eq('option_b', true)
				setOptionB(optionBCount || 0)
			} catch (error) {
				console.error('Error fetching statistics:', error)
			}
		}

		fetchStatistics()
	}, [])

	const handleExport = () => {
		// For export, we need to fetch all filtered data
		const exportData = async () => {
			try {
				let query = supabase
					.from('survey_kantin_yongjinone')
					.select('id, nik, ktp, name, department, sex, option_a, option_b, date_verified')

				// Apply same filters as current view
				if (searchTerm) {
					query = query.or(`name.ilike.%${searchTerm}%,nik.ilike.%${searchTerm}%,ktp.ilike.%${searchTerm}%`)
				}

				if (verifiedFilter === 'verified') {
					query = query.not('date_verified', 'is', null)
				} else if (verifiedFilter === 'unverified') {
					query = query.is('date_verified', null)
				}

				if (departmentFilter !== 'all') {
					query = query.eq('department', departmentFilter)
				}

				const { data, error } = await query.order('id', { ascending: true })

				if (error) throw error

				const rows = [
					["NIK", "KTP", "Nama", "Department", "Pilihan", "Tanggal Verifikasi"],
					...(data || []).map((d) => [
						d.nik,
						d.ktp,
						d.name,
						d.department,
						d.option_a ? "Meja Makan" : "Istirahat di Taman",
						d.date_verified ? new Date(d.date_verified).toLocaleString() : 'Unverified',
					]),
				]
				const csv = rows.map((r) => r.join(",")).join("\n")
				const blob = new Blob([csv], { type: "text/csv" })
				const url = URL.createObjectURL(blob)
				const a = document.createElement("a")
				a.href = url
				a.download = `survey_filtered_${new Date().toISOString().split("T")[0]}.csv`
				a.click()
				URL.revokeObjectURL(url)
			} catch (error) {
				console.error('Error exporting data:', error)
			}
		}
		exportData()
	}

	const handleBack = () => {
		setIsAuthenticated(false)
		document.cookie = 'dashboardAuthenticated=; path=/; max-age=0'
		setPasskey('')
		setDashboardError('')
		window.location.href = '/yongjinone/survey/canteen'
	}

	const handleAccess = () => {
		if (passkey === '0000') {
			setIsAuthenticated(true)
			document.cookie = 'dashboardAuthenticated=true; path=/; max-age=3600'
			setDashboardError('')
		} else {
			setDashboardError('Passkey salah.')
		}
	}

	const total = totalEmployees
	const percentageA = total > 0 ? (optionA / total) * 100 : 0
	const percentageB = total > 0 ? (optionB / total) * 100 : 0
	const percentageVoted = total > 0 ? (totalVoted / total) * 100 : 0

	// Pagination logic - now server-side
	const totalPages = Math.ceil(totalRecords / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1)
	}, [searchTerm, verifiedFilter, departmentFilter])

	// Loading state
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
								<div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
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
							<h1 className="text-2xl font-bold">Dashboard Survey Kantin</h1>
							<p className="text-sm text-slate-600">Hasil voting fasilitas kantin</p>
						</div>
						<div className="flex gap-2">
							<Button variant="outline" onClick={handleBack} className="flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</Button>
						</div>
					</div>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-slate-600">Total Employees</p>
									<p className="text-2xl font-bold">{total}</p>
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
									<p className="text-sm text-slate-600">Total Votes</p>
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
									<p className="text-xs text-slate-500 mt-1">{totalVoted} voted • {totalNotVoted} not voted</p>
								</div>
								<div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
									<Utensils className="w-6 h-6 text-green-600" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-slate-600">Meja Makan</p>
									<p className="text-2xl font-bold">{optionA}</p>
									<p className="text-sm text-slate-500">{percentageA.toFixed(1)}%</p>
									<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
										<motion.div 
											className="bg-blue-600 h-2 rounded-full" 
											initial={{ width: 0 }} 
											animate={{ width: `${percentageA}%` }} 
											transition={{ duration: 1 }} 
										/>
									</div>
								</div>
								<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
									<Table className="w-6 h-6 text-blue-600" />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-slate-600">Istirahat di Taman</p>
									<p className="text-2xl font-bold">{optionB}</p>
									<p className="text-sm text-slate-500">{percentageB.toFixed(1)}%</p>
									<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
										<motion.div 
											className="bg-red-600 h-2 rounded-full" 
											initial={{ width: 0 }} 
											animate={{ width: `${percentageB}%` }} 
											transition={{ duration: 1 }} 
										/>
									</div>
								</div>
								<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
									<Flower className="w-6 h-6 text-red-600" />
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Data Peserta</CardTitle>
						<CardDescription>Detail voting setiap peserta - Server-side pagination with database-level filtering</CardDescription>
					</CardHeader>

					{/* Filters */}
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
									onChange={(e) => setVerifiedFilter(e.target.value as 'all' | 'verified' | 'unverified')}
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
										<option key={dept} value={dept}>{dept}</option>
									))}
								</select>
							</div>
							<div className="flex items-end gap-2">
								<Button variant="outline" onClick={() => {
									setInputValue('')
									setSearchTerm('')
									setVerifiedFilter('all')
									setDepartmentFilter('all')
								}}>
									Clear Filters
								</Button>
								<Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
									<Download className="w-4 h-4" />Export
								</Button>
							</div>
						</div>
					</div>

					<CardContent className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b">
									<th className="p-2 text-left">No.</th>
									<th className="p-2 text-left">NIK</th>
									<th className="p-2 text-left">Name</th>
									<th className="p-2 text-left">Department</th>
									<th className="p-2 text-left">Pilihan</th>
									<th className="p-2 text-left">Tanggal Verifikasi</th>
								</tr>
							</thead>
							<tbody>
								{surveyData.map((d, index) => (
									<tr key={d.id || d.nik} className="border-b">
										<td className="p-2">{startIndex + index + 1}</td>
										<td className="p-2">{d.nik}</td>
										<td className="p-2">{d.name}</td>
										<td className="p-2">{d.department}</td>
										<td className="p-2">
											{!d.option_a && !d.option_b ? "Belum Voting" : 
											 d.option_a ? "Meja Makan" : "Istirahat di Taman"}
										</td>
										<td className="p-2">
											{d.date_verified ? new Date(d.date_verified).toLocaleString() : "-"}
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex items-center justify-between mt-4 px-2">
								<div className="text-sm text-gray-700">
									Showing page {currentPage} of {totalPages} ({totalRecords} total filtered records)
								</div>
								<div className="flex items-center space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
										disabled={currentPage === 1}
									>
										<ChevronLeft className="w-4 h-4" />
									</Button>
									
									{/* Page numbers */}
									<div className="flex space-x-1">
										{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
											let pageNum
											if (totalPages <= 5) {
												pageNum = i + 1
											} else if (currentPage <= 3) {
												pageNum = i + 1
											} else if (currentPage >= totalPages - 2) {
												pageNum = totalPages - 4 + i
											} else {
												pageNum = currentPage - 2 + i
											}
											
											return (
												<Button
													key={pageNum}
													variant={currentPage === pageNum ? "default" : "outline"}
													size="sm"
													onClick={() => setCurrentPage(pageNum)}
													className="w-8 h-8 p-0"
												>
													{pageNum}
												</Button>
											)
										})}
									</div>

									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

