"use client"

import { useState, useEffect } from "react"
import { Category } from "@/lib/types"
import {
	Folder,
	TrendingUp,
	AlertCircle,
	BarChart3,
	Search,
	ChevronLeft,
	ChevronRight,
	Plus,
	Edit3,
	Trash2,
} from "lucide-react"
import {
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
} from "@/lib/data/routes/categories/categories"
import CategoryForm from "@/components/Category"
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog"
import toast from "react-hot-toast"

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[] | null>(null)
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [editingCategory, setEditingCategory] = useState<Category | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
		null,
	)
	const [isDeleting, setIsDeleting] = useState(false)

	const itemsPerPage = 10

	const fetchCategoriesData = async () => {
		try {
			console.log("🔄 Fetching categories data...")
			const categoriesData = await getCategories()
			if (categoriesData) {
				console.log("Categories data received:", categoriesData)
				setCategories(categoriesData)
			} else {
				console.warn("No categories data received")
				setCategories([])
				toast.error("Failed to load categories")
			}
		} catch (error) {
			console.error("Error in fetchCategoriesData:", error)
			setCategories([])
			toast.error("Failed to load categories")
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchCategoriesData()
	}, [])

	const filteredCategories =
		categories?.filter((category) =>
			category.name.toLowerCase().includes(searchTerm.toLowerCase()),
		) || []

	const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const paginatedCategories = filteredCategories.slice(
		startIndex,
		startIndex + itemsPerPage,
	)

	const handleCreateCategory = async (categoryData: { name: string }) => {
		console.log("Starting create category with:", categoryData)
		setIsSubmitting(true)
		try {
			const newCategory = await createCategory(categoryData)
			console.log("Create category result:", newCategory)

			if (newCategory) {
				console.log("Category created successfully, refreshing data...")
				await fetchCategoriesData()
				setIsFormOpen(false)
				toast.success("Category created successfully")
			} else {
				console.error("Failed to create category - null response")
				throw new Error("Failed to create category - server returned null")
			}
		} catch (error: any) {
			console.error("Error in handleCreateCategory:", error)

			if (error.message.includes("already exists")) {
				toast.error(error.message)
			} else {
				toast.error("Failed to create category")
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleUpdateCategory = async (categoryData: { name: string }) => {
		if (!editingCategory) return

		console.log("starting update category with:", categoryData)
		setIsSubmitting(true)
		try {
			const updatedCategory = await updateCategory(
				editingCategory.id,
				categoryData,
			)
			console.log("📝 Update category result:", updatedCategory)

			if (updatedCategory) {
				console.log("Category updated successfully, refreshing data...")
				await fetchCategoriesData()
				setEditingCategory(null)
				setIsFormOpen(false)
				toast.success("Category updated successfully")
			} else {
				console.error("Failed to update category - null response")
				throw new Error("Failed to update category - server returned null")
			}
		} catch (error: any) {
			console.error("Error in handleUpdateCategory:", error)

			if (error.message.includes("already exists")) {
				toast.error(error.message)
			} else {
				toast.error("Failed to update category")
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDeleteClick = (category: Category) => {
		setCategoryToDelete(category)
		setDeleteDialogOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (!categoryToDelete) return

		console.log("Starting delete category:", categoryToDelete.id)
		setIsDeleting(true)
		try {
			const success = await deleteCategory(categoryToDelete.id)
			console.log("Delete category result:", success)

			if (success) {
				console.log("Category deleted successfully, refreshing data...")
				await fetchCategoriesData()
				toast.success("Category deleted successfully")
			} else {
				console.error("Failed to delete category - false response")
				throw new Error("Failed to delete category - server returned false")
			}
		} catch (error) {
			console.error("Error in handleDeleteConfirm:", error)
			toast.error("Failed to delete category")
		} finally {
			setIsDeleting(false)
			setDeleteDialogOpen(false)
			setCategoryToDelete(null)
		}
	}

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false)
		setCategoryToDelete(null)
	}

	const handleEdit = (category: Category) => {
		setEditingCategory(category)
		setIsFormOpen(true)
	}

	const handleCloseForm = () => {
		setIsFormOpen(false)
		setEditingCategory(null)
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		})
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
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
								className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 animate-pulse"
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

					<div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 animate-pulse">
						<div className="h-10 w-48 bg-gray-200 rounded-lg mb-6"></div>
						<div className="space-y-4">
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className="flex items-center justify-between py-4 border-b border-slate-200"
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
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
					<div className="flex items-center gap-4 mb-4 lg:mb-0">
						<div className="relative">
							<div className="bg-slate-800 p-3 rounded-2xl shadow-lg">
								<Folder className="h-8 w-8 text-white" />
							</div>
							<div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
						</div>
						<div>
							<h1 className="text-4xl font-bold text-slate-800">
								Categories
							</h1>
							<div className="flex items-center gap-4 mt-3">
								<p className="text-slate-600 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
									<TrendingUp className="h-4 w-4 text-slate-600" />
									<span className="font-semibold text-slate-800">
										{categories?.length || 0}
									</span>{" "}
									total categories
								</p>
								<p className="text-slate-600 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
									<BarChart3 className="h-4 w-4 text-slate-600" />
									<span className="font-semibold text-slate-800">
										{categories?.filter((cat) => !cat.deletedAt).length || 0}
									</span>{" "}
									active categories
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<button
							onClick={() => setIsFormOpen(true)}
							className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-400 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:bg-slate-700 shadow-lg shadow-slate-500/25 hover:shadow-xl hover:shadow-slate-500/30"
						>
							<Plus className="h-4 w-4" />
							Add Category
						</button>
					</div>
				</div>

				{categories && categories.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-slate-700 mb-1">
										Total Categories
									</p>
									<p className="text-3xl font-bold text-slate-800">
										{categories.length}
									</p>
								</div>
								<div className="bg-slate-100 p-3 rounded-xl shadow-xs">
									<Folder className="h-6 w-6 text-slate-700" />
								</div>
							</div>
						</div>

						<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-slate-700 mb-1">
										Total Product Groups
									</p>
									<p className="text-3xl font-bold text-slate-800">
										{categories.reduce(
											(total, cat) => total + (cat.productGroups?.length || 0),
											0,
										)}
									</p>
								</div>
								<div className="bg-slate-100 p-3 rounded-xl shadow-xs">
									<BarChart3 className="h-6 w-6 text-slate-700" />
								</div>
							</div>
						</div>

						<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-slate-700 mb-1">
										System Status
									</p>
									<p className="text-lg font-semibold text-slate-800 flex items-center gap-2">
										<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
										Operational
									</p>
								</div>
								<div className="bg-slate-100 p-3 rounded-xl shadow-xs">
									<TrendingUp className="h-6 w-6 text-slate-700" />
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="bg-white p-3 rounded-xl shadow-xs">
								<TrendingUp className="h-6 w-6 text-slate-700" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-slate-800 text-lg">
									Category Management
								</h3>
								<p className="text-slate-600 mt-1">
									Manage your product categories. You have{" "}
									<span className="font-semibold text-slate-800">
										{categories?.length || 0}
									</span>{" "}
									categories containing{" "}
									<span className="font-semibold text-slate-800">
										{categories?.reduce(
											(total, cat) => total + (cat.productGroups?.length || 0),
											0,
										) || 0}
									</span>{" "}
									product groups
								</p>
							</div>
						</div>

						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
							<input
								type="text"
								placeholder="Search categories..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value)
									setCurrentPage(1)
								}}
								className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 w-full lg:w-64"
							/>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow duration-200">
					{categories === null ? (
						<div className="text-center py-20">
							<div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-md mx-auto shadow-xs">
								<div className="bg-white p-4 rounded-2xl w-16 h-16 mx-auto mb-4 shadow-xs">
									<AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
								</div>
								<h3 className="text-xl font-bold text-slate-800 mb-3">
									Failed to Load Categories
								</h3>
								<p className="text-slate-600 mb-6">
									There was an error fetching your categories data. Please check
									your connection and try again.
								</p>
								<button
									onClick={fetchCategoriesData}
									className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-slate-500/25 hover:shadow-xl hover:shadow-slate-500/30"
								>
									Try Again
								</button>
							</div>
						</div>
					) : categories && categories.length === 0 ? (
						<div className="text-center py-20">
							<div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 max-w-md mx-auto shadow-xs">
								<div className="bg-white p-4 rounded-2xl w-20 h-20 mx-auto mb-6 shadow-xs">
									<Folder className="h-10 w-10 text-slate-400 mx-auto" />
								</div>
								<h3 className="text-2xl font-bold text-slate-800 mb-3">
									No Categories Found
								</h3>
								<p className="text-slate-600 mb-8">
									Start by creating your first product category to organize your
									inventory.
								</p>
								<button
									onClick={() => setIsFormOpen(true)}
									className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-400 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-slate-700 shadow-lg shadow-slate-500/25 hover:shadow-xl hover:shadow-slate-500/30 mx-auto"
								>
									<Plus className="h-4 w-4" />
									Create First Category
								</button>
							</div>
						</div>
					) : (
						<div className="p-6">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
								<div>
									<h3 className="text-lg font-semibold text-slate-800">
										Category Records
									</h3>
									<p className="text-sm text-slate-600 mt-1">
										Showing {paginatedCategories.length} of{" "}
										{filteredCategories.length} categories
										{searchTerm &&
											` (filtered from ${categories.length} total)`}
									</p>
								</div>
							</div>

							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-slate-200">
											<th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
												Name
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
												Product Groups
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
												Created
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
												Updated
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
												Status
											</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
										{paginatedCategories.map((category) => (
											<tr
												key={category.id}
												className="hover:bg-slate-50/50 transition-colors duration-150"
											>
												<td className="py-4 px-4">
													<div className="text-sm font-semibold text-slate-900">
														{category.name}
													</div>
													<div className="text-xs text-slate-500 mt-1">
														ID: {category.id.slice(0, 8)}...
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="text-sm text-slate-600">
														{category.productGroups?.length || 0} groups
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="text-sm text-slate-500">
														{formatDate(category.createdAt)}
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="text-sm text-slate-500">
														{formatDate(category.updatedAt)}
													</div>
												</td>
												<td className="py-4 px-4">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															category.deletedAt
																? "bg-red-100 text-red-800"
																: "bg-green-100 text-green-800"
														}`}
													>
														{category.deletedAt ? "Inactive" : "Active"}
													</span>
												</td>
												<td className="py-4 px-4">
													<div className="flex items-center gap-2">
														<button
															onClick={() => handleEdit(category)}
															className="p-2 bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 rounded-lg transition-colors flex items-center gap-1"
															title="Edit category"
															disabled={category.deletedAt !== null}
														>
															<Edit3 className="h-4 w-4" /> Edit
														</button>
														<button
															onClick={() => handleDeleteClick(category)}
															className="p-2 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-lg transition-colors flex items-center gap-1"
															title="Delete category"
															disabled={category.deletedAt !== null}
														>
															<Trash2 className="h-4 w-4" /> Delete
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{totalPages > 1 && (
								<div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-6">
									<div className="text-sm text-slate-600">
										Page {currentPage} of {totalPages}
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() =>
												setCurrentPage((prev) => Math.max(prev - 1, 1))
											}
											disabled={currentPage === 1}
											className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											<ChevronLeft className="h-4 w-4" />
											Previous
										</button>
										<button
											onClick={() =>
												setCurrentPage((prev) => Math.min(prev + 1, totalPages))
											}
											disabled={currentPage === totalPages}
											className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

				<CategoryForm
					category={editingCategory}
					isOpen={isFormOpen}
					onClose={handleCloseForm}
					onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
					isSubmitting={isSubmitting}
					existingCategories={categories || []}
				/>

				<DeleteConfirmationDialog
					isOpen={deleteDialogOpen}
					onClose={handleDeleteCancel}
					onConfirm={handleDeleteConfirm}
					title="Delete Category"
					description={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
					isLoading={isDeleting}
				/>
			</div>
		</div>
	)
}