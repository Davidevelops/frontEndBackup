"use client"

import React,{ useState, useEffect } from "react"
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
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/data/routes/categories/categories"
import {
  assignProductGroupToCategory,
  removeProductGroupFromCategory,
} from "@/lib/data/routes/categories/productGroups"
import CategoryForm from "@/components/Category"
import ManageGroupsModal from "@/components/ManageGroupModals"
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
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // New states for product group management
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isManagingGroups, setIsManagingGroups] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  
  // State for expanded rows to show product groups
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

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

  // Product group management functions
  const handleAssignProductGroup = async (categoryId: string, groupId: string) => {
    setIsAssigning(true)
    try {
      await assignProductGroupToCategory(categoryId, groupId)
      toast.success("Product group assigned successfully")
      
      // Refresh categories data to update counts
      await fetchCategoriesData()
      
      // Update the selected category in the modal if it's open
      if (selectedCategory && selectedCategory.id === categoryId) {
        // Find the updated category in the refreshed data
        const updatedCategories = await getCategories()
        if (updatedCategories) {
          const updatedCategory = updatedCategories.find(cat => cat.id === categoryId)
          if (updatedCategory) {
            setSelectedCategory(updatedCategory)
          }
        }
      }
    } catch (error: any) {
      console.error("Error assigning product group:", error)
      toast.error(error.message || "Failed to assign product group")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveProductGroup = async (categoryId: string, groupId: string) => {
    setIsRemoving(true)
    try {
      await removeProductGroupFromCategory(categoryId, groupId)
      toast.success("Product group removed successfully")
      
      // Refresh categories data to update counts
      await fetchCategoriesData()
      
      // Update the selected category in the modal if it's open
      if (selectedCategory && selectedCategory.id === categoryId) {
        const updatedCategories = await getCategories()
        if (updatedCategories) {
          const updatedCategory = updatedCategories.find(cat => cat.id === categoryId)
          if (updatedCategory) {
            setSelectedCategory(updatedCategory)
          }
        }
      }
    } catch (error: any) {
      console.error("Error removing product group:", error)
      toast.error(error.message || "Failed to remove product group")
    } finally {
      setIsRemoving(false)
    }
  }

  const handleManageGroups = (category: Category) => {
    setSelectedCategory(category)
    setIsManagingGroups(true)
  }

  const handleCloseManageGroups = () => {
    setIsManagingGroups(false)
    setSelectedCategory(null)
  }

  // Function to toggle expanded row
  const toggleRowExpand = (categoryId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(categoryId)) {
      newExpandedRows.delete(categoryId)
    } else {
      newExpandedRows.add(categoryId)
    }
    setExpandedRows(newExpandedRows)
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
        {/* Keep your existing loading UI */}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
              className="flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-slate-500/25 hover:shadow-xl hover:shadow-slate-500/30"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Stats Cards */}
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
                  <Package className="h-6 w-6 text-slate-700" />
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

        {/* Search and Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 p-3 rounded-xl shadow-xs">
                <Package className="h-6 w-6 text-slate-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-lg">
                  Product Group Management
                </h3>
                <p className="text-slate-600 mt-1">
                  Click the "Groups" button to assign product groups. Click on a category row to expand and see assigned groups.
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

       {/* Categories Table */}
<div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow duration-200">
  {categories === null ? (
    <div className="text-center py-20">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-md mx-auto shadow-xs">
        {/* Error UI */}
      </div>
    </div>
  ) : categories && categories.length === 0 ? (
    <div className="text-center py-20">
      {/* Empty State UI */}
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
                Category
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
            {paginatedCategories.map((category) => {
              const isExpanded = expandedRows.has(category.id)
              return (
                <React.Fragment key={category.id}>
                  <tr
                    className="hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer"
                    onClick={() => toggleRowExpand(category.id)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRowExpand(category.id)
                          }}
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          )}
                        </button>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {category.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            ID: {category.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-slate-600">
                          {category.productGroups?.length || 0} groups
                        </div>
                        {category.productGroups?.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleManageGroups(category)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            View
                          </button>
                        )}
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
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(category)
                          }}
                          className="p-2 bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 rounded-lg transition-colors flex items-center gap-1"
                          title="Edit category"
                          disabled={category.deletedAt !== null}
                        >
                          <Edit3 className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleManageGroups(category)
                          }}
                          className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 rounded-lg transition-colors flex items-center gap-1"
                          title="Manage product groups"
                          disabled={category.deletedAt !== null}
                        >
                          <Package className="h-4 w-4" /> Groups
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(category)
                          }}
                          className="p-2 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-lg transition-colors flex items-center gap-1"
                          title="Delete category"
                          disabled={category.deletedAt !== null}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded row showing product groups */}
                  {isExpanded && category.productGroups && category.productGroups.length > 0 && (
                    <tr key={`${category.id}-expanded`} className="bg-slate-50/50">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="pl-10">
                          <div className="text-sm font-medium text-slate-700 mb-2">
                            Assigned Product Groups:
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {category.productGroups.map((group) => (
                              <div
                                key={group.id}
                                className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm font-medium text-slate-800">
                                    {group.name}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500">
                                  {group.products?.length || 0} products
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {/* Expanded row - no product groups message */}
                  {isExpanded && (!category.productGroups || category.productGroups.length === 0) && (
                    <tr key={`${category.id}-empty`} className="bg-slate-50/50">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="pl-10">
                          <div className="text-sm text-slate-500 italic">
                            No product groups assigned to this category
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
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

        {/* Modals */}
        <CategoryForm
          category={editingCategory}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
          isSubmitting={isSubmitting}
          existingCategories={categories || []}
        />

        <ManageGroupsModal
          category={selectedCategory}
          isOpen={isManagingGroups}
          onClose={handleCloseManageGroups}
          onAssign={handleAssignProductGroup}
          onRemove={handleRemoveProductGroup}
          isAssigning={isAssigning}
          isRemoving={isRemoving}
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