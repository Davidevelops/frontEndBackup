"use client"

import { useState, useEffect } from "react"
import { ProductGroup } from "@/lib/types"
import ProductList from "@/components/productList"
import AddProduct from "@/components/addProduct"
import {
	Package,
	TrendingUp,
	AlertCircle,
	RefreshCw,
	BarChart3,
} from "lucide-react"
import { apiEndpoints } from "@/lib/apiEndpoints"

export default function ProductsPage() {
	const [productGroups, setProductGroups] = useState<ProductGroup[] | null>(
		null,
	)
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)

	const fetchProducts = async () => {
		try {
			setRefreshing(true)
			const response = await fetch(apiEndpoints.productGroup())
			const data = await response.json()
			setProductGroups(data.data)
		} catch (error) {
			setProductGroups(null)
		} finally {
			setLoading(false)
			setRefreshing(false)
		}
	}

	useEffect(() => {
		fetchProducts()
	}, [])

	const totalProducts =
		productGroups?.reduce(
			(total, group) => total + (group.products?.length || 0),
			0,
		) || 0

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

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-gray-100/80 animate-pulse"
							>
								<div className="flex items-center justify-between mb-4">
									<div className="h-7 w-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
									<div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
								</div>
								<div className="space-y-3">
									<div className="h-4 w-full bg-gray-200 rounded"></div>
									<div className="h-4 w-3/4 bg-gray-200 rounded"></div>
									<div className="h-4 w-1/2 bg-gray-200 rounded"></div>
								</div>
								<div className="mt-4 pt-4 border-t border-gray-100">
									<div className="h-6 w-20 bg-gray-200 rounded"></div>
								</div>
							</div>
						))}
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
								<Package className="h-8 w-8 text-white" />
							</div>
							<div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
						</div>
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
								Product Groups
							</h1>
							<div className="flex items-center gap-4 mt-3">
								<p className="text-gray-600 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
									<TrendingUp className="h-4 w-4 text-green-500" />
									<span className="font-semibold text-gray-800">
										{totalProducts}
									</span>{" "}
									total products
								</p>
								<p className="text-gray-600 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
									<BarChart3 className="h-4 w-4 text-blue-500" />
									<span className="font-semibold text-gray-800">
										{productGroups?.length || 0}
									</span>{" "}
									categories
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<AddProduct refreshProducts={fetchProducts} />
					</div>
				</div>

				{productGroups && productGroups.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-purple-700 mb-1">
										Total Products
									</p>
									<p className="text-3xl font-bold text-gray-800">
										{totalProducts}
									</p>
								</div>
								<div className="bg-white p-3 rounded-xl shadow-xs">
									<Package className="h-6 w-6 text-purple-600" />
								</div>
							</div>
						</div>

						<div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-green-700 mb-1">
										Categories
									</p>
									<p className="text-3xl font-bold text-gray-800">
										{productGroups?.length || 0}
									</p>
								</div>
								<div className="bg-white p-3 rounded-xl shadow-xs">
									<BarChart3 className="h-6 w-6 text-green-600" />
								</div>
							</div>
						</div>

						<div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-blue-700 mb-1">
										System Status
									</p>
									<p className="text-lg font-semibold text-gray-800 flex items-center gap-2">
										<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
										Operational
									</p>
								</div>
								<div className="bg-white p-3 rounded-xl shadow-xs">
									<TrendingUp className="h-6 w-6 text-blue-600" />
								</div>
							</div>
						</div>
					</div>
				)}

				{productGroups && productGroups.length > 0 && (
					<div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm border border-purple-200/60 rounded-2xl p-6 mb-8 shadow-xs">
						<div className="flex items-center gap-4">
							<div className="bg-white p-3 rounded-xl shadow-xs">
								<TrendingUp className="h-6 w-6 text-purple-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-800 text-lg">
									Product Management Dashboard
								</h3>
								<p className="text-gray-600 mt-1">
									Manage your product inventory across{" "}
									<span className="font-semibold text-purple-600">
										{productGroups.length}
									</span>{" "}
									product groups and{" "}
									<span className="font-semibold text-purple-600">
										{totalProducts}
									</span>{" "}
									variants
								</p>
							</div>
							<div className="hidden md:block">
								<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
							</div>
						</div>
					</div>
				)}

				<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-100/80 overflow-hidden hover:shadow-sm transition-shadow duration-200">
					{productGroups === null ? (
						<div className="text-center py-20">
							<div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-xs">
								<div className="bg-white p-4 rounded-2xl w-16 h-16 mx-auto mb-4 shadow-xs">
									<AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
								</div>
								<h3 className="text-xl font-bold text-gray-800 mb-3">
									Failed to Load Products
								</h3>
								<p className="text-gray-600 mb-6">
									There was an error fetching your product data. Please check
									your connection and try again.
								</p>
								<button
									onClick={fetchProducts}
									disabled={refreshing}
									className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50"
								>
									{refreshing ? "Retrying..." : "Try Again"}
								</button>
							</div>
						</div>
					) : productGroups && productGroups.length === 0 ? (
						<div className="text-center py-20">
							<div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-10 max-w-md mx-auto shadow-xs">
								<div className="bg-white p-4 rounded-2xl w-20 h-20 mx-auto mb-6 shadow-xs">
									<Package className="h-10 w-10 text-purple-400 mx-auto" />
								</div>
								<h3 className="text-2xl font-bold text-gray-800 mb-3">
									No Product Groups Found
								</h3>
								<p className="text-gray-600 mb-8">
									Start building your inventory by adding your first product
									group.
								</p>
								<AddProduct refreshProducts={fetchProducts} />
							</div>
						</div>
					) : (
						<div className="p-1">
							<ProductList
								productGroups={productGroups}
								refreshProducts={fetchProducts}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
