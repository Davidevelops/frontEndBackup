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

export default function SalesPage() {
	const [sales, setSales] = useState<Sale[] | null>(null)
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 10

	
	const [statusFilter, setStatusFilter] = useState<string>("all")
	const [dateRange, setDateRange] = useState({
		startDate: "",
		endDate: "",
	})

	const fetchSalesData = async () => {
		try {
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
							<h1 className="text-4xl font-bold text-[#1E293B]">
								Sales Dashboard
							</h1>
							<div className="flex items-center gap-4 mt-3">
								<p className="text-[#475569] flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
									<TrendingUp className="h-4 w-4 text-purple-600" />
									<span className="font-semibold text-[#1E293B]">
										{totalSales}
									</span>{" "}
									total sales
								</p>
								<p className="text-[#475569] flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
									<BarChart3 className="h-4 w-4 text-blue-600" />
									<span className="font-semibold text-[#1E293B]">
										{totalQuantity}
									</span>{" "}
									items sold
								</p>
							</div>
						</div>
					</div>
				</div>

				{sales && sales.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						{/* Total Sales Card */}
						<div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:shadow-sm transition-all duration-200 group">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-purple-600 mb-1">
										Total Sales
									</p>
									<p className="text-3xl font-bold text-[#1E293B]">
										{totalSales}
									</p>
								</div>
								<div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
									<ShoppingCart className="h-6 w-6 text-purple-600" />
								</div>
							</div>
						</div>

						{/* Items Sold Card */}
						<div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:shadow-sm transition-all duration-200 group">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-blue-600 mb-1">
										Items Sold
									</p>
									<p className="text-3xl font-bold text-[#1E293B]">
										{totalQuantity}
									</p>
								</div>
								<div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
									<BarChart3 className="h-6 w-6 text-blue-600" />
								</div>
							</div>
						</div>

						{/* Completed Sales Card */}
						<div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:shadow-sm transition-all duration-200 group">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-green-600 mb-1">
										Completed
									</p>
									<p className="text-3xl font-bold text-[#1E293B]">
										{completedSales}
									</p>
								</div>
								<div className="bg-green-50 p-3 rounded-xl border border-green-200">
									<CheckCircle className="h-6 w-6 text-green-600" />
								</div>
							</div>
						</div>

						{/* Pending Sales Card */}
						<div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:shadow-sm transition-all duration-200 group">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-yellow-600 mb-1">
										Pending
									</p>
									<p className="text-3xl font-bold text-[#1E293B]">
										{pendingSales}
									</p>
								</div>
								<div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
									<Clock className="h-6 w-6 text-yellow-600" />
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-8">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="bg-[#F1F5F9] p-3 rounded-xl border border-[#E2E8F0]">
								<TrendingUp className="h-6 w-6 text-[#475569]" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-[#1E293B] text-lg">
									Sales Management Dashboard
								</h3>
								<p className="text-[#475569] mt-1">
									Monitor your sales performance with{" "}
									<span className="font-semibold text-purple-600">
										{totalSales}
									</span>{" "}
									total sales and{" "}
									<span className="font-semibold text-blue-600">
										{totalQuantity}
									</span>{" "}
									items sold
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-[#64748B]" />
							<Select
								value={statusFilter}
								onValueChange={setStatusFilter}
							>
								<SelectTrigger className="w-32 bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]">
									<SelectValue placeholder="Filter status" />
								</SelectTrigger>
								<SelectContent className="bg-white border border-[#E2E8F0] rounded-xl">
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="mt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
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
									className="bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]"
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
									className="bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]"
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
										className="flex items-center gap-2 bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<X className="h-4 w-4" />
										Clear Filters
									</Button>
								</div>
							</div>
						</div>
					</div>

					{hasActiveFilters && (
						<div className="mt-3 flex flex-wrap gap-2">
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

				<div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-sm transition-shadow duration-200">
					{sales === null ? (
						<div className="text-center py-20">
							<div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 max-w-md mx-auto">
								<div className="bg-[#F1F5F9] p-4 rounded-2xl w-16 h-16 mx-auto mb-4">
									<AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
								</div>
								<h3 className="text-xl font-bold text-[#1E293B] mb-3">
									Failed to Load Sales
								</h3>
								<p className="text-[#475569] mb-6">
									There was an error fetching your sales data. Please check your
									connection and try again.
								</p>
								<button
									onClick={fetchSalesData}
									className="bg-[#1E293B] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-[#0F172A]"
								>
									Try Again
								</button>
							</div>
						</div>
					) : sales && sales.length === 0 ? (
						<div className="text-center py-20">
							<div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 max-w-md mx-auto">
								<div className="bg-[#F1F5F9] p-4 rounded-2xl w-20 h-20 mx-auto mb-6">
									<ShoppingCart className="h-10 w-10 text-purple-500 mx-auto" />
								</div>
								<h3 className="text-2xl font-bold text-[#1E293B] mb-3">
									No Sales Found
								</h3>
								<p className="text-[#475569] mb-8">
									Sales records will appear here once transactions are
									processed.
								</p>
							</div>
						</div>
					) : (
						<div className="p-6">
							
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
								<div>
									<h3 className="text-lg font-semibold text-[#1E293B]">
										Sales Records
									</h3>
									<p className="text-sm text-[#475569] mt-1">
										Showing {paginatedSales.length} of {filteredSales.length}{ " "}
										sales
										{hasActiveFilters && ` (filtered from ${sales.length} total)`}
									</p>
								</div>
							</div>

						
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
														className="text-sm font-mono text-[#1E293B]"
														title={sale.id}
													>
														{sale.id.slice(0, 8)}...
													</div>
												</td>
												<td className="py-4 px-4">
													<div
														className="text-sm text-[#1E293B]"
														title={sale.accountId}
													>
														{sale.accountId.slice(0, 8)}...
													</div>
												</td>
												<td className="py-4 px-4">
													<div
														className="text-sm text-[#1E293B]"
														title={sale.productId}
													>
														{sale.productId.slice(0, 8)}...
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="text-sm font-semibold text-[#1E293B]">
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
													<div className="text-sm text-[#1E293B]">
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

				
							{totalPages > 1 && (
								<div className="flex items-center justify-between border-t border-[#E2E8F0] pt-6 mt-6">
									<div className="text-sm text-[#475569]">
										Page {currentPage} of {totalPages}
										{hasActiveFilters && " (filtered)"}
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() =>
												setCurrentPage((prev) => Math.max(prev - 1, 1))
											}
											disabled={currentPage === 1}
											className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#1E293B] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											<ChevronLeft className="h-4 w-4" />
											Previous
										</button>
										<button
											onClick={() =>
												setCurrentPage((prev) => Math.min(prev + 1, totalPages))
											}
											disabled={currentPage === totalPages}
											className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#1E293B] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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