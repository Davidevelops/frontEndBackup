"use client"

import { ProductGroup, CreateVariantInput, VariantSetting } from "@/lib/types"
import {
	Archive,
	NotebookPen,
	BarChart3,
	TrendingUp,
	Package,
	Shield,
	Calendar,
	Edit3,
	Trash2,
	Plus,
	Eye,
	Copy,
	Check,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Search,
} from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { apiEndpoints } from "@/lib/apiEndpoints"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"

interface Props {
	productGroups: ProductGroup[]
	refreshProducts: () => Promise<void>
}

const ITEMS_PER_PAGE = 10

export default function ProductList({ productGroups, refreshProducts }: Props) {
	const [productName, setProductName] = useState<string>("")
	const [error, setError] = useState<string>("")
	const [loading, setIsLoading] = useState<boolean>(false)
	const [open, setIsOpen] = useState<boolean>(false)
	const [addVariantOpen, setAddVariantOpen] = useState<boolean>(false)
	const [currentGroupId, setCurrentGroupId] = useState<string>("")
	const [variantData, setVariantData] = useState<CreateVariantInput>({
		name: "",
		setting: undefined,
	})
	const [addMode, setAddMode] = useState<"partial" | "full">("partial")
	const [copiedId, setCopiedId] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)

	useEffect(() => {
		setCurrentPage(1)
	}, [searchTerm])

	const handleCopyId = async (id: string) => {
		try {
			await navigator.clipboard.writeText(id)
			setCopiedId(id)
			toast.success("ID copied to clipboard!")
			setTimeout(() => setCopiedId(null), 2000)
		} catch (err) {
			toast.error("Failed to copy ID")
		}
	}

	const handleArchiveProduct = async (id: string) => {
		setIsLoading(true)
		setError("")
		try {
			await axios.delete(apiEndpoints.productGroup(id))
			setError("")
			await refreshProducts()
			toast.success("Product group archived successfully!")
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.error || "An unknown error occurred")
				toast.error(
					err.response?.data?.error || "Failed to archive product group",
				)
			} else {
				setError("An unexpected error occurred")
				toast.error("Failed to archive product group")
			}
		} finally {
			setIsLoading(false)
		}
	}

	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)))
	}

	const handleUpdateDetails = async (groupId: string) => {
		if (!productName.trim()) {
			setError("Please provide a name.")
			return
		}

		setIsLoading(true)
		setError("")

		try {
			await axios.patch(apiEndpoints.productGroup(groupId), {
				name: productName,
			})

			setError("")
			setIsOpen(false)
			setProductName("")
			await refreshProducts()
			toast.success("Product group updated successfully!")
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.error || "An unknown error occurred")
				toast.error(
					err.response?.data?.error || "Failed to update product group",
				)
			} else {
				setError("An unexpected error occurred")
				toast.error("Failed to update product group")
			}
		} finally {
			setIsLoading(false)
		}
	}

	const handleAddVariant = async (groupId: string) => {
		if (!variantData.name.trim()) {
			setError("Variant name is required")
			return
		}

		if (addMode === "full") {
			const {
				classification,
				serviceLevel,
				fillRate,
				safetyStockCalculationMethod,
			} = variantData.setting || {}

			if (
				!classification ||
				serviceLevel === undefined ||
				serviceLevel === null ||
				fillRate === undefined ||
				fillRate === null ||
				!safetyStockCalculationMethod
			) {
				setError("All fields are required in Full mode")
				return
			}

			if (
				serviceLevel < 0 ||
				serviceLevel > 100 ||
				fillRate < 0 ||
				fillRate > 100
			) {
				setError("Service Level and Fill Rate must be between 0 and 100")
				return
			}
		}

		setIsLoading(true)
		setError("")

		try {
			const requestData: any = {
				name: variantData.name.trim(),
			}

			if (addMode === "full" && variantData.setting) {
				requestData.setting = {
					classification: variantData.setting.classification?.trim(),
					serviceLevel: Number(variantData.setting.serviceLevel),
					fillRate: Number(variantData.setting.fillRate),
					safetyStockCalculationMethod:
						variantData.setting.safetyStockCalculationMethod?.trim(),
				}
			}

			const variantApiUrl = apiEndpoints.product(groupId, undefined)
			await axios.post(variantApiUrl, requestData, {
				headers: {
					"Content-Type": "application/json",
				},
			})

			setError("")
			setAddVariantOpen(false)
			resetVariantForm()
			await refreshProducts()
			toast.success("Variant added successfully!")
		} catch (error: any) {
			let errorMessage = "An error occurred while trying to add variant"
			if (error.response?.data?.message) {
				errorMessage = error.response.data.message
			} else if (error.response?.status === 400) {
				errorMessage =
					"Invalid data format. Please check all fields and try again."
			} else if (error.response?.status === 404) {
				errorMessage =
					"API endpoint not found. Please check the URL configuration."
			}
			setError(errorMessage)
			toast.error(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	const resetVariantForm = () => {
		setVariantData({
			name: "",
			setting: {
				classification: "",
				serviceLevel: 90,
				fillRate: 90,
				safetyStockCalculationMethod: "dynamic",
			},
		})
		setAddMode("partial")
		setError("")
	}

	const openAddVariantDialog = (groupId: string) => {
		setCurrentGroupId(groupId)
		setAddVariantOpen(true)
		resetVariantForm()
	}

	const openEditDialog = (groupId: string, currentName: string) => {
		setCurrentGroupId(groupId)
		setProductName(currentName)
		setIsOpen(true)
	}

	const handleVariantFieldChange = (field: string, value: any) => {
		setVariantData((prev) => ({
			...prev,
			[field]: value,
		}))
	}

	const handleSettingFieldChange = (
		field: keyof VariantSetting,
		value: any,
	) => {
		setVariantData((prev) => ({
			...prev,
			setting: {
				...prev.setting,
				[field]:
					field === "serviceLevel" || field === "fillRate"
						? Number(value)
						: value,
			} as VariantSetting,
		}))
	}

	const isFormValid = () => {
		if (!variantData.name.trim()) return false
		if (addMode === "full") {
			const {
				classification,
				serviceLevel,
				fillRate,
				safetyStockCalculationMethod,
			} = variantData.setting || {}
			return !!(
				classification?.trim() &&
				serviceLevel !== undefined &&
				serviceLevel !== null &&
				fillRate !== undefined &&
				fillRate !== null &&
				safetyStockCalculationMethod?.trim()
			)
		}
		return true
	}

	const filteredProductGroups = productGroups.filter((group) =>
		group.name.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	const totalItems = filteredProductGroups.length
	const totalPages = Math.ceil(totalItems / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage
	const currentProductGroups = filteredProductGroups.slice(startIndex, endIndex)
	const goToFirstPage = () => goToPage(1)
	const goToLastPage = () => goToPage(totalPages)
	const goToNextPage = () => goToPage(currentPage + 1)
	const goToPrevPage = () => goToPage(currentPage - 1)

	if (!productGroups || productGroups.length === 0) {
		return (
			<div className="text-center py-12">
				<Package className="mx-auto h-16 w-16 text-purple-300 mb-4" />
				<h3 className="text-lg font-semibold text-gray-600">
					No products found
				</h3>
				<p className="text-gray-500">
					Start by adding your first product group
				</p>
			</div>
		)
	}

	return (
		<TooltipProvider>
			<div className="space-y-6">
				
				<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-purple-100/80">
					<div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
						<div className="flex-1 relative">
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Search product groups by name..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-12 pr-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
							/>
						</div>
					</div>
				</div>

			
				<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-purple-100/80 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-purple-100/80 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
									<th className="text-left py-4 px-6 font-semibold text-gray-700">
										<div className="flex items-center gap-2">
											<BarChart3 className="h-4 w-4 text-purple-600" />
											Product Group
										</div>
									</th>
									<th className="text-center py-4 px-6 font-semibold text-gray-700">
										<div className="flex items-center justify-center gap-2">
											<Package className="h-4 w-4 text-green-600" />
											Variants Count
										</div>
									</th>
									<th className="text-left py-4 px-6 font-semibold text-gray-700">
										<div className="flex items-center gap-2">
											<Package className="h-4 w-4 text-blue-600" />
											Variant Names
										</div>
									</th>
									<th className="text-center py-4 px-6 font-semibold text-gray-700">
										<div className="flex items-center justify-center gap-2">
											<TrendingUp className="h-4 w-4 text-orange-600" />
											Status
										</div>
									</th>
									<th className="text-center py-4 px-6 font-semibold text-gray-700">
										<div className="flex items-center justify-center gap-2">
											<Calendar className="h-4 w-4 text-gray-600" />
											Last Updated
										</div>
									</th>
									<th className="text-center py-4 px-6 font-semibold text-gray-700">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-purple-100/80">
								{currentProductGroups.map((group) => {
									const products = group.products || []
									const productCount = products.length
									const lastUpdated = new Date(group.updatedAt).toLocaleDateString()
									const variantNames = products.map(p => p.name).join(', ') || 'No variants'

									return (
										<tr key={group.id} className="hover:bg-purple-50/30 transition-colors duration-200 group">
											<td className="py-4 px-6">
												<div className="flex items-center gap-3">
													<div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl">
														<BarChart3 className="h-5 w-5 text-white" />
													</div>
													<div>
														<div className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
															{group.name}
														</div>
														<button
															onClick={() => handleCopyId(group.id)}
															className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors duration-200 group/copy mt-1"
														>
															<span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border">
																ID: {group.id.slice(0, 8)}...
															</span>
															{copiedId === group.id ? (
																<Check className="h-3 w-3 text-green-500" />
															) : (
																<Copy className="h-3 w-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
															)}
														</button>
													</div>
												</div>
											</td>
											<td className="py-4 px-6">
												<div className="flex flex-col items-center gap-1">
													<span className="font-semibold text-gray-800 text-lg">
														{productCount}
													</span>
													<span className="text-sm text-gray-500">
														variant{productCount !== 1 ? 's' : ''}
													</span>
												</div>
											</td>
											<td className="py-4 px-6">
												<div className="max-w-xs">
													{products.length > 0 ? (
														<div className="space-y-2">
															{products.slice(0, 3).map((product, index) => (
																<div key={product.id} className="flex items-center gap-2">
																	<div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/60 rounded-lg text-center px-3 py-1.5 flex-1">
																		<span className="text-sm font-medium text-blue-700 text-center">
																			{product.name}
																		</span>
																	</div>
																	{index === 2 && products.length > 3 && (
																		<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
																			+{products.length - 3} more
																		</span>
																	)}
																</div>
															))}
														</div>
													) : (
														<div className="text-center py-2">
															<span className="text-sm text-gray-400 italic">No variants</span>
														</div>
													)}
												</div>
											</td>
											<td className="py-4 px-6">
												<div className="flex justify-center">
													<span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200 flex items-center gap-2">
														<TrendingUp className="h-4 w-4" />
														Forecast Ready
													</span>
												</div>
											</td>
											<td className="py-4 px-6">
												<div className="flex justify-center">
													<span className="text-sm text-gray-600">
														{lastUpdated}
													</span>
												</div>
											</td>
											<td className="py-4 px-6">
												<div className="flex items-center justify-center gap-2">
												
													<Tooltip>
														<TooltipTrigger asChild>
															<button
																className="p-2.5 bg-green-50/80 backdrop-blur-sm border border-green-200/60 text-green-600 rounded-xl hover:bg-green-100/80 hover:border-green-300/80 hover:shadow-green-200/30 hover:shadow-sm transition-all duration-200"
																onClick={() => openAddVariantDialog(group.id)}
															>
																<Plus className="h-4 w-4" />
															</button>
														</TooltipTrigger>
														<TooltipContent>
															<p>Add Variant</p>
														</TooltipContent>
													</Tooltip>

													
													<Tooltip>
														<TooltipTrigger asChild>
															<button
																className="p-2.5 bg-purple-50/80 backdrop-blur-sm border border-purple-200/60 text-purple-600 rounded-xl hover:bg-purple-100/80 hover:border-purple-300/80 hover:shadow-purple-200/30 hover:shadow-sm transition-all duration-200"
																onClick={() => openEditDialog(group.id, group.name)}
															>
																<Edit3 className="h-4 w-4" />
															</button>
														</TooltipTrigger>
														<TooltipContent>
															<p>Edit Group</p>
														</TooltipContent>
													</Tooltip>

												
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<button
																className="p-2.5 bg-red-50/80 backdrop-blur-sm border border-red-200/60 text-red-600 rounded-xl hover:bg-red-100/80 hover:border-red-300/80 hover:shadow-red-200/30 hover:shadow-sm transition-all duration-200"
															>
																<Trash2 className="h-4 w-4" />
															</button>
														</AlertDialogTrigger>
														<AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/60">
															<AlertDialogHeader>
																<div className="flex items-center gap-3 mb-2">
																	<div className="bg-red-100 p-2 rounded-xl">
																		<Archive className="h-6 w-6 text-red-600" />
																	</div>
																	<AlertDialogTitle className="text-gray-900">
																		Archive Product Group?
																	</AlertDialogTitle>
																</div>
																<AlertDialogDescription className="text-gray-600">
																	This will archive the entire "
																	<strong>{group.name}</strong>" group including all{" "}
																	{productCount} variant/s. Archived data is preserved for
																	analytics and can be restored later.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel className="bg-gray-100/80 backdrop-blur-sm border border-gray-200/60 hover:bg-gray-200/80">
																	Cancel
																</AlertDialogCancel>
																<AlertDialogAction
																	className="bg-red-500/90 backdrop-blur-sm text-white hover:bg-red-600/90 border border-red-400/30"
																	onClick={() => handleArchiveProduct(group.id)}
																	disabled={loading}
																>
																	{loading ? "Archiving..." : "Confirm Archive"}
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>

				
					{filteredProductGroups.length === 0 && (
						<div className="text-center py-16">
							<div className="max-w-2xl mx-auto">
								<div className="border p-6 rounded-2xl bg-purple-50 border-purple-200 inline-block">
									<div className="bg-white p-4 rounded-2xl w-20 h-20 mx-auto mb-6">
										<Package className="h-10 w-10 text-purple-600 mx-auto" />
									</div>
									<h3 className="text-2xl font-bold text-gray-800 mb-3">
										No product groups found
									</h3>
									<p className="text-gray-500 text-lg max-w-md mx-auto">
										{searchTerm
											? "Try adjusting your search terms"
											: "Get started by creating your first product group"}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

			
				{totalPages > 1 && (
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-purple-100/80">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="text-sm text-gray-600">
								Showing{" "}
								<span className="font-semibold text-gray-800">
									{startIndex + 1}-{Math.min(endIndex, totalItems)}
								</span>{" "}
								of{" "}
								<span className="font-semibold text-gray-800">{totalItems}</span>{" "}
								product group{totalItems !== 1 ? "s" : ""}
							</div>

							<div className="flex items-center gap-2">
								<button
									onClick={goToFirstPage}
									disabled={currentPage === 1}
									className="p-2 rounded-lg border border-purple-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
								>
									<ChevronsLeft className="h-4 w-4 text-purple-600" />
								</button>

								<button
									onClick={goToPrevPage}
									disabled={currentPage === 1}
									className="p-2 rounded-lg border border-purple-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
								>
									<ChevronLeft className="h-4 w-4 text-purple-600" />
								</button>

								<div className="flex items-center gap-1">
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
											<button
												key={pageNum}
												onClick={() => goToPage(pageNum)}
												className={`min-w-[40px] h-10 rounded-lg border transition-all duration-200 font-medium ${
													currentPage === pageNum
														? "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/25"
														: "border-purple-200 text-gray-700 hover:bg-purple-50"
												}`}
											>
												{pageNum}
											</button>
										)
									})}
								</div>

								<button
									onClick={goToNextPage}
									disabled={currentPage === totalPages}
									className="p-2 rounded-lg border border-purple-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
								>
									<ChevronRight className="h-4 w-4 text-purple-600" />
								</button>

								<button
									onClick={goToLastPage}
									disabled={currentPage === totalPages}
									className="p-2 rounded-lg border border-purple-200 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
								>
									<ChevronsRight className="h-4 w-4 text-purple-600" />
								</button>
							</div>

							<div className="flex items-center gap-2 text-sm">
								<span className="text-gray-600">Show:</span>
								<select
									value={itemsPerPage}
									onChange={(e) => {
										setItemsPerPage(Number(e.target.value))
										setCurrentPage(1)
									}}
									className="border border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
								>
									<option value={10}>10</option>
									<option value={25}>25</option>
									<option value={50}>50</option>
									<option value={100}>100</option>
								</select>
								<span className="text-gray-600">per page</span>
							</div>
						</div>
					</div>
				)}

			
				<Dialog open={open} onOpenChange={setIsOpen}>
					<DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/60 max-w-md">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2 text-purple-900">
								<NotebookPen className="h-5 w-5" />
								Update Product Group
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label className="text-gray-700">Group Name</Label>
								<Input
									value={productName}
									onChange={(e) => setProductName(e.target.value)}
									className="mt-1 border-purple-200 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
									placeholder="Enter new group name..."
								/>
							</div>
							{error && (
								<div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">
									{error}
								</div>
							)}
							<Button
								className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
								onClick={() => handleUpdateDetails(currentGroupId)}
								disabled={loading}
							>
								{loading ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>

				<Dialog open={addVariantOpen} onOpenChange={setAddVariantOpen}>
					<DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/60 max-w-md">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2 text-purple-900">
								<Plus className="h-5 w-5" />
								Add Product Variant
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="flex gap-2 mb-4">
								<Button
									type="button"
									variant={addMode === "partial" ? "default" : "outline"}
									className={`flex-1 ${
										addMode === "partial"
											? "bg-purple-500 hover:bg-purple-600 text-white"
											: "border-purple-200 bg-white/80 backdrop-blur-sm"
									}`}
									onClick={() => setAddMode("partial")}
								>
									Partial
								</Button>
								<Button
									type="button"
									variant={addMode === "full" ? "default" : "outline"}
									className={`flex-1 ${
										addMode === "full"
											? "bg-purple-500 hover:bg-purple-600 text-white"
											: "border-purple-200 bg-white/80 backdrop-blur-sm"
									}`}
									onClick={() => setAddMode("full")}
								>
									Full
								</Button>
							</div>

							<div>
								<Label className="text-gray-700">Variant Name *</Label>
								<Input
									value={variantData.name}
									onChange={(e) =>
										handleVariantFieldChange("name", e.target.value)
									}
									className="mt-1 border-purple-200 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
									placeholder="Enter variant name..."
								/>
							</div>

							{addMode === "full" && (
								<div className="space-y-3 border-t pt-3">
									<Label className="text-gray-700 font-semibold">
										Settings *
									</Label>
									<div>
										<Label className="text-gray-600 text-sm">
											Classification *
										</Label>
										<Input
											value={variantData.setting?.classification || ""}
											onChange={(e) =>
												handleSettingFieldChange(
													"classification",
													e.target.value,
												)
											}
											className="mt-1 border-purple-200 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
											placeholder="e.g., fast"
										/>
									</div>
									<div>
										<Label className="text-gray-600 text-sm">
											Service Level (%) *
										</Label>
										<Input
											type="number"
											min="0"
											max="100"
											value={variantData.setting?.serviceLevel ?? ""}
											onChange={(e) =>
												handleSettingFieldChange(
													"serviceLevel",
													e.target.value,
												)
											}
											className="mt-1 border-purple-200 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
											placeholder="90"
										/>
									</div>
									<div>
										<Label className="text-gray-600 text-sm">
											Fill Rate (%) *
										</Label>
										<Input
											type="number"
											min="0"
											max="100"
											value={variantData.setting?.fillRate ?? ""}
											onChange={(e) =>
												handleSettingFieldChange("fillRate", e.target.value)
											}
											className="mt-1 border-purple-200 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
											placeholder="90"
										/>
									</div>
									<div>
										<Label className="text-gray-600 text-sm">
											Safety Stock Method *
										</Label>
										<Input
											value={
												variantData.setting?.safetyStockCalculationMethod || ""
											}
											onChange={(e) =>
												handleSettingFieldChange(
													"safetyStockCalculationMethod",
													e.target.value,
												)
											}
											className="mt-1 border-purple-200 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
											placeholder="e.g., dynamic"
										/>
									</div>
								</div>
							)}

							{error && (
								<div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">
									{error}
								</div>
							)}

							<Button
								className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
								onClick={() => handleAddVariant(currentGroupId)}
								disabled={loading || !isFormValid()}
							>
								{loading ? "Adding..." : "Add Variant"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</TooltipProvider>
	)
}