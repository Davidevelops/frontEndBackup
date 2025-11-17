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

	const getStatusBadge = (status: string) => {
		let colorClass = "bg-gray-100 text-gray-800"

		if (status === "completed") {
			colorClass = "bg-green-100 text-green-800"
		} else if (status === "pending") {
			colorClass = "bg-yellow-100 text-yellow-800"
		} else if (status === "cancelled") {
			colorClass = "bg-red-100 text-red-800"
		}

		return (
			<span
				className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
			>
				{status}
			</span>
		)
	}

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case "completed":
				return <CheckCircle className="h-3 w-3" />;
			case "pending":
				return <Clock className="h-3 w-3" />;
			case "cancelled":
				return <XCircle className="h-3 w-3" />;
			default:
				return <Clock className="h-3 w-3" />;
		}
	}

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "completed":
				return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
			case "pending":
				return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
			case "cancelled":
				return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
			default:
				return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse shadow-sm"></div>
							<div className="space-y-3">
								<div className="h-9 w-56 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
								<div className="flex gap-4">
									<div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
									<div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
								</div>
							</div>
						</div>
						<div className="flex gap-3">
							<div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
							<div className="h-12 w-36 bg-gray-200 rounded-xl animate-pulse"></div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-gray-100/80 animate-pulse"
							>
								<div className="flex items-center justify-between">
									<div className="space-y-2">
										<div className="h-6 w-20 bg-gray-200 rounded"></div>
										<div className="h-8 w-16 bg-gray-300 rounded-lg"></div>
									</div>
									<div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
								</div>
							</div>
						))}
					</div>

					<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-gray-100/80 animate-pulse">
						<div className="h-10 w-48 bg-gray-200 rounded-lg mb-6"></div>
						<div className="space-y-4">
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className="flex items-center justify-between py-4 border-b border-gray-100"
								>
									<div className="flex gap-4">
										<div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
										<div className="space-y-2">
											<div className="h-4 w-32 bg-gray-200 rounded"></div>
											<div className="h-3 w-24 bg-gray-200 rounded"></div>
										</div>
									</div>
									<div className="h-6 w-20 bg-gray-200 rounded"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
					<div className="flex items-center gap-4 mb-4 lg:mb-0">
						<div className="relative">
							<div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-purple-500/20">
								<ShoppingCart className="h-8 w-8 text-white" />
							</div>
							<div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
						</div>
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
								Sales Dashboard
							</h1>
							<div className="flex items-center gap-4 mt-3">
								<p className="text-gray-600 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
									<TrendingUp className="h-4 w-4 text-purple-500" />
									<span className="font-semibold text-gray-800">
										{totalSales}
									</span>{" "}
									total sales
								</p>
								<p className="text-gray-600 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
									<BarChart3 className="h-4 w-4 text-blue-500" />
									<span className="font-semibold text-gray-800">
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
						<div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-purple-700 mb-1">
										Total Sales
									</p>
									<p className="text-3xl font-bold text-gray-800">
										{totalSales}
									</p>
								</div>
								<div className="bg-white p-3 rounded-xl shadow-xs">
									<ShoppingCart className="h-6 w-6 text-purple-600" />
								</div>
							</div>
						</div>

						<div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-blue-700 mb-1">
										Items Sold
									</p>
									<p className="text-3xl font-bold text-gray-800">
										{totalQuantity}
									</p>
								</div>
								<div className="bg-white p-3 rounded-xl shadow-xs">
									<BarChart3 className="h-6 w-6 text-blue-600" />
								</div>
							</div>
						</div>

						<div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-green-700 mb-1">
										Completed
									</p>
									<p className="text-3xl font-bold text-gray-800">
										{completedSales}
									</p>
								</div>
								<div className="bg-white p-3 rounded-xl shadow-xs">
									<CheckCircle className="h-6 w-6 text-green-600" />
								</div>
							</div>
						</div>

						<div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-yellow-700 mb-1">
										Pending
									</p>
									<p className="text-3xl font-bold text-gray-800">
										{pendingSales}
									</p>
								</div>
								<div className="bg-white p-3 rounded-xl shadow-xs">
									<Clock className="h-6 w-6 text-yellow-600" />
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm border border-purple-200/60 rounded-2xl p-6 mb-8 shadow-xs">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="bg-white p-3 rounded-xl shadow-xs">
								<TrendingUp className="h-6 w-6 text-purple-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-800 text-lg">
									Sales Management Dashboard
								</h3>
								<p className="text-gray-600 mt-1">
									Monitor your sales performance with{" "}
									<span className="font-semibold text-purple-600">
										{totalSales}
									</span>{" "}
									total sales and{" "}
									<span className="font-semibold text-purple-600">
										{totalQuantity}
									</span>{" "}
									items sold
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-gray-500" />
							<Select
								value={statusFilter}
								onValueChange={setStatusFilter}
							>
								<SelectTrigger className="w-32 bg-white/80 border-gray-200 rounded-xl focus:border-purple-300 focus:ring-purple-200">
									<SelectValue placeholder="Filter status" />
								</SelectTrigger>
								<SelectContent className="bg-white/95 backdrop-blur-sm border border-purple-100/50 rounded-xl">
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
								<Label htmlFor="start-date" className="text-sm font-medium text-gray-700">
									Start Date
								</Label>
								<Input
									id="start-date"
									type="date"
									value={dateRange.startDate}
									onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
									className="bg-white/80 border-gray-200 rounded-xl focus:border-purple-300 focus:ring-purple-200"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="end-date" className="text-sm font-medium text-gray-700">
									End Date
								</Label>
								<Input
									id="end-date"
									type="date"
									value={dateRange.endDate}
									onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
									className="bg-white/80 border-gray-200 rounded-xl focus:border-purple-300 focus:ring-purple-200"
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-sm font-medium text-gray-700 opacity-0">
									Actions
								</Label>
								<div className="flex gap-2">
									<Button
										variant="outline"
										onClick={clearAllFilters}
										disabled={!hasActiveFilters}
										className="flex items-center gap-2 bg-white/80 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

				<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-100/80 overflow-hidden hover:shadow-sm transition-shadow duration-200">
					{sales === null ? (
						<div className="text-center py-20">
							<div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-xs">
								<div className="bg-white p-4 rounded-2xl w-16 h-16 mx-auto mb-4 shadow-xs">
									<AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
								</div>
								<h3 className="text-xl font-bold text-gray-800 mb-3">
									Failed to Load Sales
								</h3>
								<p className="text-gray-600 mb-6">
									There was an error fetching your sales data. Please check your
									connection and try again.
								</p>
								<button
									onClick={fetchSalesData}
									className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
								>
									Try Again
								</button>
							</div>
						</div>
					) : sales && sales.length === 0 ? (
						<div className="text-center py-20">
							<div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-10 max-w-md mx-auto shadow-xs">
								<div className="bg-white p-4 rounded-2xl w-20 h-20 mx-auto mb-6 shadow-xs">
									<ShoppingCart className="h-10 w-10 text-purple-400 mx-auto" />
								</div>
								<h3 className="text-2xl font-bold text-gray-800 mb-3">
									No Sales Found
								</h3>
								<p className="text-gray-600 mb-8">
									Sales records will appear here once transactions are
									processed.
								</p>
							</div>
						</div>
					) : (
						<div className="p-6">
							
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
								<div>
									<h3 className="text-lg font-semibold text-gray-800">
										Sales Records
									</h3>
									<p className="text-sm text-gray-600 mt-1">
										Showing {paginatedSales.length} of {filteredSales.length}{" "}
										sales
										{hasActiveFilters && ` (filtered from ${sales.length} total)`}
									</p>
								</div>
							</div>

						
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-gray-200">
											<th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
												Sale ID
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
												Account
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
												Product
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
												Quantity
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
												Status
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
												Sale Date
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
												Created
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{paginatedSales.map((sale) => (
											<tr
												key={sale.id}
												className="hover:bg-gray-50/50 transition-colors duration-150"
											>
												<td className="py-4 px-4">
													<div
														className="text-sm font-mono text-gray-900"
														title={sale.id}
													>
														{sale.id.slice(0, 8)}...
													</div>
												</td>
												<td className="py-4 px-4">
													<div
														className="text-sm text-gray-900"
														title={sale.accountId}
													>
														{sale.accountId.slice(0, 8)}...
													</div>
												</td>
												<td className="py-4 px-4">
													<div
														className="text-sm text-gray-900"
														title={sale.productId}
													>
														{sale.productId.slice(0, 8)}...
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="text-sm font-semibold text-gray-900">
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
													<div className="text-sm text-gray-900">
														{formatDate(sale.date)}
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="text-sm text-gray-500">
														{formatDate(sale.createdAt)}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

				
							{totalPages > 1 && (
								<div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-6">
									<div className="text-sm text-gray-600">
										Page {currentPage} of {totalPages}
										{hasActiveFilters && " (filtered)"}
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() =>
												setCurrentPage((prev) => Math.max(prev - 1, 1))
											}
											disabled={currentPage === 1}
											className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											<ChevronLeft className="h-4 w-4" />
											Previous
										</button>
										<button
											onClick={() =>
												setCurrentPage((prev) => Math.min(prev + 1, totalPages))
											}
											disabled={currentPage === totalPages}
											className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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