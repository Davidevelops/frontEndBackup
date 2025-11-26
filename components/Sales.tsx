"use client"

import { useState, useEffect } from "react"
import { Sale } from "@/lib/types"
import {
	ShoppingCart,
	TrendingUp,
	AlertCircle,
	BarChart3,
	ChevronLeft,
	ChevronRight,
	Filter,
	X,
	Calendar,
	CheckCircle,
	Clock,
	XCircle,
	Download,
	Upload,
} from "lucide-react"
import { getSales } from "@/lib/data/routes/sales/sales"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { exportSalesTemplate, importSales, downloadBlob } from "@/lib/data/routes/excel/excel"
import toast from "react-hot-toast"

export default function SalesPage() {
	const [sales, setSales] = useState<Sale[] | null>(null)
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [exporting, setExporting] = useState(false)
	const [importing, setImporting] = useState(false)
	const itemsPerPage = 10

	
	const [statusFilter, setStatusFilter] = useState<string>("all")
	const [dateRange, setDateRange] = useState({
		startDate: "",
		endDate: "",
	})

	const fetchSalesData = async () => {
		try {
			setLoading(true)
			const salesData = await getSales()
			setSales(salesData)
		} catch (error) {
			setSales(null)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchSalesData()
	}, [])

	const handleExportSales = async () => {
		setExporting(true)
		try {
			const blob = await exportSalesTemplate({ 
				includeArchived: false 
			})
			
			if (blob) {
				downloadBlob(blob, `sales_${new Date().toISOString().split('T')[0]}.xlsx`)
				toast.success("Sales exported successfully!")
			} else {
				toast.error("Failed to export sales data")
			}
		} catch (error) {
			console.error("Export error:", error)
			toast.error("Error exporting sales data")
		} finally {
			setExporting(false)
		}
	}

	const handleImportSales = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		// STRICT validation - only .xlsx files allowed
		if (!file.name.endsWith('.xlsx')) {
			toast.error("Please select an Excel file with .xlsx format only")
			return
		}

		// Additional validation for file type
		const validTypes = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
			'application/octet-stream'
		]
		
		if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx')) {
			toast.error("Invalid file type. Please select a valid .xlsx Excel file")
			return
		}

		// Validate file size
		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size too large. Please select a file smaller than 10MB.")
			return
		}

		if (file.size === 0) {
			toast.error("File is empty. Please select a valid file.")
			return
		}

		setImporting(true)
		try {
			console.log("Starting sales import with .xlsx file:", {
				name: file.name,
				type: file.type,
				size: file.size
			})

			// Use the importSales function from your excel utils
			const result = await importSales(file)

			// Handle the result based on your backend response structure
			// Use the properties from your ImportResult type
			const groupsCreated = result.groupsCreated || 0
			const groupsUpdated = result.groupsUpdated || 0
			const productsCreated = result.productsCreated || 0
			const productsUpdated = result.productsUpdated || 0
			const errors = result.errors || []
			
			const totalChanges = groupsCreated + groupsUpdated + productsCreated + productsUpdated
			
			if (errors.length > 0) {
				const errorDetails = errors.slice(0, 3).map((error: any) => 
					`Row ${error.row}: ${error.message || error.error}`
				).join('; ')
				
				if (totalChanges > 0) {
					toast.success(
						`Import partially successful! ` +
						`Groups: ${groupsCreated} created, ${groupsUpdated} updated. ` +
						`Products: ${productsCreated} created, ${productsUpdated} updated. ` +
						`But had ${errors.length} error(s)`
					)
					if (errorDetails) {
						toast.error(`Errors: ${errorDetails}${errors.length > 3 ? '...' : ''}`)
					}
				} else {
					toast.error(`Import failed with errors: ${errorDetails}${errors.length > 3 ? '...' : ''}`)
				}
			} else if (totalChanges > 0) {
				toast.success(
					`Import successful! ` +
					`Groups: ${groupsCreated} created, ${groupsUpdated} updated. ` +
					`Products: ${productsCreated} created, ${productsUpdated} updated.`
				)
			} else {
				toast.success("Import completed - no changes made")
			}
			
			// Auto-refresh after successful import
			await fetchSalesData()

		} catch (error: any) {
			console.error("Import error:", error)
			
			if (error.name === 'TypeError' && error.message.includes('fetch')) {
				toast.error("Network error - cannot connect to server")
			} else if (error.message) {
				toast.error(`Import failed: ${error.message}`)
			} else {
				toast.error("Import failed due to an unknown error")
			}
		} finally {
			setImporting(false)
			event.target.value = ''
		}
	}


	const filteredSales = sales?.filter(sale => {
		
		const statusMatch = statusFilter === "all" || sale.status.toLowerCase() === statusFilter.toLowerCase();
		
		
		const saleDate = new Date(sale.date);
		const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
		const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
		
		let dateMatch = true;
		if (startDate) {
			dateMatch = dateMatch && saleDate >= startDate;
		}
		if (endDate) {

			const endOfDay = new Date(endDate);
			endOfDay.setHours(23, 59, 59, 999);
			dateMatch = dateMatch && saleDate <= endOfDay;
		}
		
		return statusMatch && dateMatch;
	}) || []

	const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const paginatedSales = filteredSales.slice(
		startIndex,
		startIndex + itemsPerPage,
	)

	const totalSales = sales?.length || 0
	const totalQuantity =
		sales?.reduce((total, sale) => total + sale.quantity, 0) || 0
	const completedSales =
		sales?.filter((sale) => sale.status === "completed").length || 0
	const pendingSales =
		sales?.filter((sale) => sale.status === "pending").length || 0
	const cancelledSales =
		sales?.filter((sale) => sale.status === "cancelled").length || 0


	useEffect(() => {
		setCurrentPage(1)
	}, [statusFilter, dateRange.startDate, dateRange.endDate])

	
	const handleDateRangeChange = (field: string, value: string) => {
		setDateRange(prev => ({
			...prev,
			[field]: value
		}))
	}

	
	const clearAllFilters = () => {
		setStatusFilter("all")
		setDateRange({
			startDate: "",
			endDate: "",
		})
	}

	
	const hasActiveFilters = statusFilter !== "all" || dateRange.startDate || dateRange.endDate

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case "completed":
				return <CheckCircle className="h-3 w-3 text-green-600" />;
			case "pending":
				return <Clock className="h-3 w-3 text-yellow-600" />;
			case "cancelled":
				return <XCircle className="h-3 w-3 text-red-600" />;
			default:
				return <Clock className="h-3 w-3 text-gray-600" />;
		}
	}

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "completed":
				return "bg-green-50 text-green-800 border-green-200 hover:bg-green-100";
			case "pending":
				return "bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
			case "cancelled":
				return "bg-red-50 text-red-800 border-red-200 hover:bg-red-100";
			default:
				return "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0] hover:bg-[#E2E8F0]";
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen p-6">
				<div className="max-w-[95rem] mx-auto">
					<div className="bg-white rounded-xl p-12 border border-[#E2E8F0] text-center">
						<div className="animate-pulse flex flex-col items-center">
							<div className="bg-[#CBD5E1] rounded-full h-16 w-16 mb-4"></div>
							<div className="bg-[#E2E8F0] h-6 w-48 rounded mb-2"></div>
							<div className="bg-[#E2E8F0] h-4 w-32 rounded"></div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen p-6">
			<div className="max-w-[95rem] mx-auto">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
					<div className="flex items-center gap-4 mb-4 lg:mb-0">
						<div className="relative">
							<div className="bg-[#1E293B] p-3 rounded-2xl shadow-lg">
								<ShoppingCart className="h-8 w-8 text-white" />
							</div>
							<div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
						</div>
						<div>
							<h1 className="text-3xl font-bold text-[#0F172A] mb-2">
								Sales Management
							</h1>
							<p className="text-[#64748B] text-lg">
								Monitor and manage your sales transactions
							</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-3">
						{/* Export Button */}
						<button
							onClick={handleExportSales}
							disabled={exporting}
							className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
						>
							<Download className={`h-4 w-4 ${exporting ? 'animate-spin' : ''}`} />
							{exporting ? "Exporting..." : "Export Excel"}
						</button>

						{/* Import Button */}
						<label className="flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium cursor-pointer disabled:opacity-50">
							<Upload className={`h-4 w-4 ${importing ? 'animate-spin' : ''}`} />
							{importing ? "Importing..." : "Import Excel"}
							<input
								type="file"
								accept=".xlsx"
								onChange={handleImportSales}
								disabled={importing}
								className="hidden"
							/>
						</label>
					</div>
				</div>

				{/* Stats Overview */}
				{sales && sales.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-[#64748B] mb-2">TOTAL SALES</p>
									<p className="text-3xl font-bold text-[#0F172A]">
										{totalSales}
									</p>
									<p className="text-sm text-[#64748B] mt-1">Transactions</p>
								</div>
								<div className="bg-[#F1F5F9] p-3 rounded-lg">
									<ShoppingCart className="h-6 w-6 text-[#1E293B]" />
								</div>
							</div>
						</div>

						<div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-[#64748B] mb-2">ITEMS SOLD</p>
									<p className="text-3xl font-bold text-[#0F172A]">
										{totalQuantity}
									</p>
									<p className="text-sm text-[#64748B] mt-1">Total quantity</p>
								</div>
								<div className="bg-[#F0FDF4] p-3 rounded-lg">
									<BarChart3 className="h-6 w-6 text-[#16A34A]" />
								</div>
							</div>
						</div>

						<div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-[#64748B] mb-2">COMPLETED</p>
									<p className="text-3xl font-bold text-[#0F172A]">
										{completedSales}
									</p>
									<p className="text-sm text-[#64748B] mt-1">Successful sales</p>
								</div>
								<div className="bg-[#F0FDF4] p-3 rounded-lg">
									<CheckCircle className="h-6 w-6 text-[#16A34A]" />
								</div>
							</div>
						</div>

						<div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-[#64748B] mb-2">PENDING</p>
									<p className="text-3xl font-bold text-[#0F172A]">
										{pendingSales}
									</p>
									<p className="text-sm text-[#64748B] mt-1">Awaiting processing</p>
								</div>
								<div className="bg-[#FFFBEB] p-3 rounded-lg">
									<Clock className="h-6 w-6 text-[#D97706]" />
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Quick Actions Panel */}
				<div className="bg-white border border-[#E2E8F0] rounded-xl p-6 mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold text-[#0F172A] mb-2">
								Bulk Operations
							</h3>
							<p className="text-[#64748B]">
								Use Excel files for bulk import/export of sales data. 
								<span className="text-[#DC2626] font-medium ml-1">
									Only .xlsx format supported.
								</span>
							</p>
						</div>
						<div className="flex items-center gap-4">
							<div className="text-right">
								<p className="text-sm font-medium text-[#0F172A]">
									{totalSales} total sales
								</p>
								<p className="text-sm text-[#64748B]">
									{totalQuantity} items sold
								</p>
							</div>
							<div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
								<TrendingUp className="h-6 w-6 text-[#64748B]" />
							</div>
						</div>
					</div>
				</div>

				{/* Filters Section */}
				<div className="bg-white border border-[#E2E8F0] rounded-xl p-6 mb-8">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
						<div className="flex items-center gap-4">
							<div className="bg-[#F1F5F9] p-3 rounded-xl border border-[#E2E8F0]">
								<Filter className="h-6 w-6 text-[#475569]" />
							</div>
							<div>
								<h3 className="font-semibold text-[#0F172A] text-lg">
									Filter Sales
								</h3>
								<p className="text-[#64748B] text-sm mt-1">
									Refine your sales data by status and date range
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-[#64748B]" />
							<Select
								value={statusFilter}
								onValueChange={setStatusFilter}
							>
								<SelectTrigger className="w-32 bg-white border-[#E2E8F0] rounded-lg focus:border-[#CBD5E1]">
									<SelectValue placeholder="Filter status" />
								</SelectTrigger>
								<SelectContent className="bg-white border border-[#E2E8F0] rounded-lg">
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
						<div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="start-date" className="text-sm font-medium text-[#475569]">
									Start Date
								</Label>
								<Input
									id="start-date"
									type="date"
									value={dateRange.startDate}
									onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
									className="bg-white border-[#E2E8F0] rounded-lg focus:border-[#CBD5E1]"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="end-date" className="text-sm font-medium text-[#475569]">
									End Date
								</Label>
								<Input
									id="end-date"
									type="date"
									value={dateRange.endDate}
									onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
									className="bg-white border-[#E2E8F0] rounded-lg focus:border-[#CBD5E1]"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-[#475569] opacity-0">
									Actions
								</Label>
								<div className="flex gap-2">
									<Button
										variant="outline"
										onClick={clearAllFilters}
										disabled={!hasActiveFilters}
										className="flex items-center gap-2 bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<X className="h-4 w-4" />
										Clear Filters
									</Button>
								</div>
							</div>
						</div>
					</div>

					{hasActiveFilters && (
						<div className="mt-4 flex flex-wrap gap-2">
							{statusFilter !== "all" && (
								<div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-sm">
									Status: {statusFilter}
									<button
										onClick={() => setStatusFilter("all")}
										className="hover:text-purple-900"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							)}
							{dateRange.startDate && (
								<div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-sm">
									From: {formatDate(dateRange.startDate)}
									<button
										onClick={() => handleDateRangeChange("startDate", "")}
										className="hover:text-blue-900"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							)}
							{dateRange.endDate && (
								<div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm">
									To: {formatDate(dateRange.endDate)}
									<button
										onClick={() => handleDateRangeChange("endDate", "")}
										className="hover:text-green-900"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Main Content */}
				<div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
					{sales === null ? (
						<div className="text-center py-20">
							<div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-8 max-w-md mx-auto">
								<div className="bg-white p-4 rounded-xl w-16 h-16 mx-auto mb-4">
									<AlertCircle className="h-8 w-8 text-[#DC2626] mx-auto" />
								</div>
								<h3 className="text-xl font-bold text-[#0F172A] mb-3">
									Failed to Load Sales
								</h3>
								<p className="text-[#64748B] mb-6">
									There was an error fetching your sales data. Please check your
									connection and try again.
								</p>
								<button
									onClick={fetchSalesData}
									className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
								>
									Try Again
								</button>
							</div>
						</div>
					) : sales && sales.length === 0 ? (
						<div className="text-center py-20">
							<div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-10 max-w-md mx-auto">
								<div className="bg-white p-4 rounded-xl w-20 h-20 mx-auto mb-6">
									<ShoppingCart className="h-10 w-10 text-[#64748B] mx-auto" />
								</div>
								<h3 className="text-2xl font-bold text-[#0F172A] mb-3">
									No Sales Found
								</h3>
								<p className="text-[#64748B] mb-6">
									Sales records will appear here once transactions are processed.
									You can also import sales data from Excel.
								</p>
								<label className="flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium cursor-pointer">
									<Upload className="h-4 w-4" />
									Import from Excel (.xlsx)
									<input
										type="file"
										accept=".xlsx"
										onChange={handleImportSales}
										className="hidden"
									/>
								</label>
							</div>
						</div>
					) : (
						<div className="p-6">
							{/* Table Header */}
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
								<div>
									<h3 className="text-lg font-semibold text-[#0F172A]">
										Sales Records
									</h3>
									<p className="text-sm text-[#64748B] mt-1">
										Showing {paginatedSales.length} of {filteredSales.length}{ " "}
										sales
										{hasActiveFilters && ` (filtered from ${sales.length} total)`}
									</p>
								</div>
							</div>

							{/* Sales Table */}
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-[#E2E8F0]">
											<th className="text-left py-3 px-4 text-sm font-medium text-[#475569]">
												Sale ID
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-[#475569]">
												Account
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-[#475569]">
												Product
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-[#475569]">
												Quantity
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-[#475569]">
												Status
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-[#475569]">
												Sale Date
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-[#475569]">
												Created
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-[#E2E8F0]">
										{paginatedSales.map((sale) => (
											<tr
												key={sale.id}
												className="hover:bg-[#F8FAFC] transition-colors duration-150"
											>
												<td className="py-4 px-4">
													<div
														className="text-sm font-mono text-[#0F172A]"
														title={sale.id}
													>
														{sale.id.slice(0, 8)}...
													</div>
												</td>
												<td className="py-4 px-4">
													<div
														className="text-sm text-[#0F172A]"
														title={sale.accountId}
													>
														{sale.accountId.slice(0, 8)}...
													</div>
												</td>
												<td className="py-4 px-4">
													<div
														className="text-sm text-[#0F172A]"
														title={sale.productId}
													>
														{sale.productId.slice(0, 8)}...
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="text-sm font-semibold text-[#0F172A]">
														{sale.quantity}
													</div>
												</td>
												<td className="py-4 px-4">
													<div
														className={`flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${getStatusColor(
															sale.status
														)}`}
													>
														{getStatusIcon(sale.status)}
														{sale.status}
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="text-sm text-[#0F172A]">
														{formatDate(sale.date)}
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="text-sm text-[#64748B]">
														{formatDate(sale.createdAt)}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex items-center justify-between border-t border-[#E2E8F0] pt-6 mt-6">
									<div className="text-sm text-[#64748B]">
										Page {currentPage} of {totalPages}
										{hasActiveFilters && " (filtered)"}
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() =>
												setCurrentPage((prev) => Math.max(prev - 1, 1))
											}
											disabled={currentPage === 1}
											className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											<ChevronLeft className="h-4 w-4" />
											Previous
										</button>
										<button
											onClick={() =>
												setCurrentPage((prev) => Math.min(prev + 1, totalPages))
											}
											disabled={currentPage === totalPages}
											className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											Next
											<ChevronRight className="h-4 w-4" />
										</button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}