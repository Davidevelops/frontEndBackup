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
			<div className="min-h-screen bg-[#F1F5F9] p-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 bg-[#E2E8F0] rounded-xl animate-pulse"></div>
							<div className="space-y-3">
								<div className="h-9 w-56 bg-[#E2E8F0] rounded-lg animate-pulse"></div>
								<div className="flex gap-4">
									<div className="h-5 w-32 bg-[#E2E8F0] rounded animate-pulse"></div>
									<div className="h-5 w-28 bg-[#E2E8F0] rounded animate-pulse"></div>
								</div>
							</div>
						</div>
						<div className="flex gap-3">
							<div className="h-12 w-12 bg-[#E2E8F0] rounded-lg animate-pulse"></div>
							<div className="h-12 w-36 bg-[#E2E8F0] rounded-lg animate-pulse"></div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="bg-white rounded-xl p-6 border border-[#E2E8F0] animate-pulse"
							>
								<div className="flex items-center justify-between">
									<div className="space-y-2">
										<div className="h-6 w-20 bg-[#E2E8F0] rounded"></div>
										<div className="h-8 w-16 bg-[#CBD5E1] rounded-lg"></div>
									</div>
									<div className="w-12 h-12 bg-[#E2E8F0] rounded-lg"></div>
								</div>
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className="bg-white rounded-xl p-6 border border-[#E2E8F0] animate-pulse"
							>
								<div className="flex items-center justify-between mb-4">
									<div className="h-7 w-28 bg-[#E2E8F0] rounded-lg"></div>
									<div className="h-9 w-9 bg-[#E2E8F0] rounded-lg"></div>
								</div>
								<div className="space-y-3">
									<div className="h-4 w-full bg-[#E2E8F0] rounded"></div>
									<div className="h-4 w-3/4 bg-[#E2E8F0] rounded"></div>
									<div className="h-4 w-1/2 bg-[#E2E8F0] rounded"></div>
								</div>
								<div className="mt-4 pt-4 border-t border-[#F1F5F9]">
									<div className="h-6 w-20 bg-[#E2E8F0] rounded"></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-[#F1F5F9] p-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
					<div className="flex items-center gap-4 mb-4 lg:mb-0">
						<div className="relative">
							<div className="bg-[#1E293B] p-3 rounded-xl">
								<Package className="h-8 w-8 text-white" />
							</div>
							<div className="absolute -top-1 -right-1 w-5 h-5 bg-[#16A34A] border-2 border-white rounded-full animate-pulse"></div>
						</div>
						<div>
							<h1 className="text-4xl font-bold text-[#0F172A]">
								Product Groups
							</h1>
							<div className="flex items-center gap-4 mt-3">
								<p className="text-[#475569] flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
									<TrendingUp className="h-4 w-4 text-[#16A34A]" />
									<span className="font-semibold text-[#0F172A]">
										{totalProducts}
									</span>{" "}
									total products
								</p>
								<p className="text-[#475569] flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
									<BarChart3 className="h-4 w-4 text-[#334155]" />
									<span className="font-semibold text-[#0F172A]">
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
						<div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-[#334155] mb-1">
										Total Products
									</p>
									<p className="text-3xl font-bold text-[#0F172A]">
										{totalProducts}
									</p>
								</div>
								<div className="bg-white p-3 rounded-lg">
									<Package className="h-6 w-6 text-[#1E293B]" />
								</div>
							</div>
						</div>

						<div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-[#166534] mb-1">
										Categories
									</p>
									<p className="text-3xl font-bold text-[#0F172A]">
										{productGroups?.length || 0}
									</p>
								</div>
								<div className="bg-white p-3 rounded-lg">
									<BarChart3 className="h-6 w-6 text-[#16A34A]" />
								</div>
							</div>
						</div>

						<div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-[#334155] mb-1">
										System Status
									</p>
									<p className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
										<span className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></span>
										Operational
									</p>
								</div>
								<div className="bg-white p-3 rounded-lg">
									<TrendingUp className="h-6 w-6 text-[#334155]" />
								</div>
							</div>
						</div>
					</div>
				)}

				{productGroups && productGroups.length > 0 && (
					<div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6 mb-8">
						<div className="flex items-center gap-4">
							<div className="bg-white p-3 rounded-lg">
								<TrendingUp className="h-6 w-6 text-[#1E293B]" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-[#0F172A] text-lg">
									Product Management Dashboard
								</h3>
								<p className="text-[#64748B] mt-1">
									Manage your product inventory across{" "}
									<span className="font-semibold text-[#1E293B]">
										{productGroups.length}
									</span>{" "}
									product groups and{" "}
									<span className="font-semibold text-[#1E293B]">
										{totalProducts}
									</span>{" "}
									variants
								</p>
							</div>
							<div className="hidden md:block">
								<div className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></div>
							</div>
						</div>
					</div>
				)}

				<div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden hover:shadow-sm transition-shadow duration-200">
					{productGroups === null ? (
						<div className="text-center py-20">
							<div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-8 max-w-md mx-auto">
								<div className="bg-white p-4 rounded-xl w-16 h-16 mx-auto mb-4">
									<AlertCircle className="h-8 w-8 text-[#DC2626] mx-auto" />
								</div>
								<h3 className="text-xl font-bold text-[#0F172A] mb-3">
									Failed to Load Products
								</h3>
								<p className="text-[#64748B] mb-6">
									There was an error fetching your product data. Please check
									your connection and try again.
								</p>
								<button
									onClick={fetchProducts}
									disabled={refreshing}
									className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
								>
									{refreshing ? "Retrying..." : "Try Again"}
								</button>
							</div>
						</div>
					) : productGroups && productGroups.length === 0 ? (
						<div className="text-center py-20">
							<div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-10 max-w-md mx-auto">
								<div className="bg-white p-4 rounded-xl w-20 h-20 mx-auto mb-6">
									<Package className="h-10 w-10 text-[#64748B] mx-auto" />
								</div>
								<h3 className="text-2xl font-bold text-[#0F172A] mb-3">
									No Product Groups Found
								</h3>
								<p className="text-[#64748B] mb-8">
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