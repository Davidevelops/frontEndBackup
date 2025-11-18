import React from "react";
import LineChart from "./LineChart";
import { useRouter } from "next/navigation";
import {
	Blocks,
	SquareArrowOutUpRight,
	TrendingUp,
	AlertTriangle,
	Package,
	BarChart3,
	Users,
	Sparkles,
	Calendar,
} from "lucide-react";

export default function DashboardOverview() {
	const router = useRouter();

	const statsData = {
		lowStock: {
			value: 12,
			description: "Items need restocking",
		},
		totalProducts: {
			value: 89,
			description: "In your inventory",
		},
		activeSuppliers: {
			value: 8,
			description: "Partners available",
		},
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
					<div className="flex items-center gap-4 mb-4 lg:mb-0">
						<div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-purple-500/20">
							<BarChart3 className="h-8 w-8 text-white" />
						</div>
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
								Dashboard Overview
							</h1>
							<div className="text-gray-600 mt-2 flex items-center gap-2">
								<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
								Welcome to your inventory management dashboard
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm">
							<Calendar className="h-4 w-4" />
							{new Date().toLocaleDateString("en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-orange-100/80 hover:shadow-md transition-all duration-300 group">
						<div className="flex items-center gap-4">
							<div className="bg-orange-50 p-3 rounded-xl">
								<AlertTriangle className="h-6 w-6 text-orange-500" />
							</div>
							<div>
								<div className="text-3xl font-bold text-gray-800">
									{statsData.lowStock.value}
								</div>
								<div className="text-sm font-medium text-gray-600">
									Low Stock Items
								</div>
								<div className="text-xs text-orange-500 mt-1">
									{statsData.lowStock.description}
								</div>
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
							<AlertTriangle className="h-3 w-3" />
							Review and restock needed
						</div>
					</div>

					<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-blue-100/80 hover:shadow-md transition-all duration-300 group">
						<div className="flex items-center gap-4">
							<div className="bg-blue-50 p-3 rounded-xl">
								<Package className="h-6 w-6 text-blue-500" />
							</div>
							<div>
								<div className="text-3xl font-bold text-gray-800">
									{statsData.totalProducts.value}
								</div>
								<div className="text-sm font-medium text-gray-600">
									Total Products
								</div>
								<div className="text-xs text-blue-500 mt-1">
									{statsData.totalProducts.description}
								</div>
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
							<Package className="h-3 w-3" />
							All categories included
						</div>
					</div>

					<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-green-100/80 hover:shadow-md transition-all duration-300 group">
						<div className="flex items-center gap-4">
							<div className="bg-green-50 p-3 rounded-xl">
								<Users className="h-6 w-6 text-green-500" />
							</div>
							<div>
								<div className="text-3xl font-bold text-gray-800">
									{statsData.activeSuppliers.value}
								</div>
								<div className="text-sm font-medium text-gray-600">
									Active Suppliers
								</div>
								<div className="text-xs text-green-500 mt-1">
									{statsData.activeSuppliers.description}
								</div>
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
							<Users className="h-3 w-3" />
							Ready for orders
						</div>
					</div>
				</div>
				=
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
					<div
						className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer"
						onClick={() => router.push("/dashboard/sales")}
					>
						<div className="flex items-center gap-4">
							<div className="bg-white p-3 rounded-xl shadow-xs">
								<SquareArrowOutUpRight className="h-6 w-6 text-purple-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-800 text-lg group-hover:text-purple-600 transition-colors duration-200">
									Sales Management
								</h3>
								<p className="text-gray-600 text-sm mt-1">
									Record and track your product sales
								</p>
							</div>
							<div className="bg-white/80 p-2 rounded-lg group-hover:bg-white transition-colors duration-200">
								<SquareArrowOutUpRight className="h-4 w-4 text-purple-500" />
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 text-xs text-purple-600 font-medium">
							<TrendingUp className="h-3 w-3" />
							Track sales performance
						</div>
					</div>

					<div
						className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer"
						onClick={() => router.push("/dashboard/products")}
					>
						<div className="flex items-center gap-4">
							<div className="bg-white p-3 rounded-xl shadow-xs">
								<Blocks className="h-6 w-6 text-blue-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-800 text-lg group-hover:text-blue-600 transition-colors duration-200">
									Product Catalog
								</h3>
								<p className="text-gray-600 text-sm mt-1">
									Manage and organize your products
								</p>
							</div>
							<div className="bg-white/80 p-2 rounded-lg group-hover:bg-white transition-colors duration-200">
								<Blocks className="h-4 w-4 text-blue-500" />
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 text-xs text-blue-600 font-medium">
							<Package className="h-3 w-3" />
							{statsData.totalProducts.value} products
						</div>
					</div>

					<div
						className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer"
						onClick={() => router.push("/dashboard/suppliers")}
					>
						<div className="flex items-center gap-4">
							<div className="bg-white p-3 rounded-xl shadow-xs">
								<Users className="h-6 w-6 text-green-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-800 text-lg group-hover:text-green-600 transition-colors duration-200">
									Supplier Management
								</h3>
								<p className="text-gray-600 text-sm mt-1">
									Manage your supplier relationships
								</p>
							</div>
							<div className="bg-white/80 p-2 rounded-lg group-hover:bg-white transition-colors duration-200">
								<Users className="h-4 w-4 text-green-500" />
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium">
							<Users className="h-3 w-3" />
							{statsData.activeSuppliers.value} active suppliers
						</div>
					</div>
				</div>
				<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-100/80 overflow-hidden hover:shadow-md transition-shadow duration-300">
					<div className="p-6 border-b border-gray-100">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-3 mb-4 sm:mb-0">
								<div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
									<BarChart3 className="h-5 w-5 text-white" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-gray-800">
										Inventory Overview
									</h2>
									<p className="text-gray-600 text-sm">
										Product distribution and status
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
									<div className="w-2 h-2 bg-blue-400 rounded-full"></div>
									<span className="text-sm font-medium">Sample Data</span>
								</div>
							</div>
						</div>
					</div>
					<div className="p-6">
						<LineChart />
					</div>
					<div className="px-6 pb-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
						<div className="flex items-center gap-4">
							<span>Last updated: {new Date().toLocaleDateString()}</span>
							<span className="hidden md:inline">•</span>
							<span className="hidden md:inline">Static overview</span>
						</div>
						<button className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200">
							View Details
						</button>
					</div>
				</div>
				<div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100/60 shadow-xs">
					<div className="flex items-center gap-6 text-sm text-gray-600">
						<span className="flex items-center gap-2">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
							All systems operational
						</span>
						<span className="hidden md:inline">•</span>
						<span className="hidden md:inline">Ready for management tasks</span>
					</div>
					<div className="text-xs text-gray-500">
						Dashboard • {new Date().getFullYear()}
					</div>
				</div>
			</div>
		</div>
	);
}
