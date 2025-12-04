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
  Search,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  ChevronsRight,
  ChevronsLeft,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Props {
  productGroups: ProductGroup[]
  refreshProducts: () => Promise<void>
}

const ITEMS_PER_PAGE = 10

// Helper function to filter out "base" variants
const filterBaseVariants = (products: any[]) => {
  return products.filter(product => product.name.toLowerCase() !== "base")
}

// Helper function to count non-base variants
const countNonBaseVariants = (products: any[]) => {
  return products.filter(product => product.name.toLowerCase() !== "base").length
}

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
    // Prevent creating a variant named "base"
    if (variantData.name.trim().toLowerCase() === "base") {
      setError('Variant name "base" is reserved and cannot be used')
      return
    }

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
    // Prevent validation from passing if name is "base"
    if (variantData.name.trim().toLowerCase() === "base") return false
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
        <Package className="mx-auto h-16 w-16 text-[#CBD5E1] mb-4" />
        <h3 className="text-lg font-semibold text-[#475569]">
          No products found
        </h3>
        <p className="text-[#64748B]">
          Start by adding your first product group
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search product groups by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full rounded">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left py-4 px-6 font-semibold text-[#334155]">
                    <div className="flex items-center gap-2">
                      Product Group
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-[#334155]">
                    <div className="flex items-center justify-center gap-2">
                      Variants Count
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-[#334155] min-w-[200px] max-w-[300px]">
                    <div className="flex items-center gap-2">
                      Variant Names
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-[#334155]">
                    <div className="flex items-center justify-center gap-2">
                      Last Updated
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-[#334155]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {currentProductGroups.map((group, index) => {
                  const products = group.products || []
                  const filteredProducts = filterBaseVariants(products)
                  const productCount = countNonBaseVariants(products)
                  const lastUpdated = new Date(group.updatedAt).toLocaleDateString()

                  return (
                    <tr key={group.id} className={`transition-colors duration-200 group ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'
                    } hover:bg-[#F1F5F9]`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {/* <div className="bg-[#1E293B] p-2 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-white" />
                          </div> */}
                          <div>
                            <div className="font-semibold text-[#0F172A] text-xs group-hover:text-[#1E293B] transition-colors">
                              {group.name.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-[#0F172A] text-lg">
                            {productCount}
                          </span>
                          <span className="text-sm text-[#64748B]">
                            variant{productCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 min-w-[200px] max-w-[300px]">
                        <div className="max-w-full">
                          {filteredProducts.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {filteredProducts.slice(0, 5).map((product, index) => (
                                <Link
                                  href={`/dashboard/product-view/${group.id}/${product.id}`}
                                  key={product.id}
                                  className="inline-flex group/variant"
                                >
                                  <div className="bg-[#F1F5F9] text-center border border-[#E2E8F0] rounded-lg px-2 py-1 hover:bg-[#E2E8F0] hover:border-[#CBD5E1] transition-all duration-200 cursor-pointer">
                                    <span className="text-xs font-medium text-[#334155] group-hover/variant:text-[#1E293B] truncate max-w-[120px]">
                                      {product.name.toUpperCase()}
                                    </span>
                                  </div>
                                </Link>
                              ))}
                              {filteredProducts.length > 5 && (
                                <div className="inline-flex items-center">
                                  <span className="text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded-full">
                                    +{filteredProducts.length - 5} more
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-1">
                              <span className="text-sm text-[#94A3B8] italic">No variants</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <span className="text-sm text-[#64748B]">
                            {lastUpdated}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
             
                          {filteredProducts.length > 0 ? (
                            filteredProducts.length === 1 ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link
                                    href={`/dashboard/product-view/${group.id}/${filteredProducts[0].id}`}
                                    className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800 border border-purple-100 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium"
                                  >
                                    <ChartNoAxesColumnIncreasing className="h-4 w-4" />
                                    Forecast
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#1E293B] text-white border-0">
                                  <div className="text-center">
                                    <p className="font-semibold">View Variant</p>
                                    <p className="text-xs text-[#CBD5E1] mt-1">View Variant Performance</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800 border border-purple-100 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium">
                                    <ChartNoAxesColumnIncreasing className="h-4 w-4" />
                                    Forecast
                                    <ChevronDown className="h-3 w-3" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white border border-[#E2E8F0] max-h-60 overflow-y-auto">
                                  <DropdownMenuLabel>Select Variant</DropdownMenuLabel>
                                  {filteredProducts.map((product) => (
                                    <DropdownMenuItem key={product.id} className="cursor-pointer">
                                      <Link
                                        href={`/dashboard/product-view/${group.id}/${product.id}`}
                                        className="w-full flex items-center justify-between"
                                      >
                                        <span className="truncate max-w-[180px]">
                                          {product.name.toUpperCase()}
                                        </span>
                                        <ChartNoAxesColumnIncreasing className="h-3 w-3 ml-2" />
                                      </Link>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="flex items-center gap-2 bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0] px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium cursor-not-allowed"
                                  disabled
                                >
                                  <ChartNoAxesColumnIncreasing className="h-4 w-4" />
                                  Forecast
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-[#1E293B] text-white border-0">
                                <div className="text-center">
                                  <p className="font-semibold">No Variants</p>
                                  <p className="text-xs text-[#CBD5E1] mt-1">Add a variant to view details</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium"
                                onClick={() => openAddVariantDialog(group.id)}
                              >
                                <Plus className="h-4 w-4" />
                                Add Variant
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1E293B] text-white border-0">
                              <div className="text-center">
                                <p className="font-semibold">Add Variant</p>
                                <p className="text-xs text-[#CBD5E1] mt-1">Create new product variant</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>

                     
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-800 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium"
                                onClick={() => openEditDialog(group.id, group.name)}
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1E293B] text-white border-0">
                              <div className="text-center">
                                <p className="font-semibold">Edit Group</p>
                                <p className="text-xs text-[#CBD5E1] mt-1">Update product group details</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>

      
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button 
                                className="flex items-center gap-2 bg-[#FEF2F2] hover:bg-[#FECACA] text-[#DC2626] hover:text-[#B91C1C] px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium"
                              >
                                <Trash2 className="h-4 w-4" />
                                Archive
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border border-[#FECACA] rounded-xl">
                              <AlertDialogHeader>
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="bg-[#FEF2F2] p-2 rounded-lg">
                                    <Archive className="h-6 w-6 text-[#DC2626]" />
                                  </div>
                                  <AlertDialogTitle className="text-[#0F172A]">
                                    Archive Product Group?
                                  </AlertDialogTitle>
                                </div>
                                <AlertDialogDescription className="text-[#475569]">
                                  This will archive the entire "
                                  <strong className="text-[#DC2626]">{group.name}</strong>" group including all{" "}
                                  {productCount} variant/s. Archived data is preserved for
                                  analytics and can be restored later.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] hover:bg-[#F1F5F9]">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
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
                <div className="border p-6 rounded-xl bg-[#F8FAFC] border-[#E2E8F0] inline-block">
                  <div className="bg-white p-4 rounded-xl w-20 h-20 mx-auto mb-6">
                    <Package className="h-10 w-10 text-[#64748B] mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-3">
                    No product groups found
                  </h3>
                  <p className="text-[#64748B] text-lg max-w-md mx-auto">
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
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-[#64748B]">
                Showing{" "}
                <span className="font-semibold text-[#0F172A]">
                  {startIndex + 1}-{Math.min(endIndex, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#0F172A]">{totalItems}</span>{" "}
                product group{totalItems !== 1 ? "s" : ""}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronsLeft className="h-4 w-4 text-[#64748B]" />
                </button>

                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4 text-[#64748B]" />
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
                            ? "bg-[#1E293B] text-white border-[#1E293B]"
                            : "border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC]"
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
                  className="p-2 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="h-4 w-4 text-[#64748B]" />
                </button>

                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronsRight className="h-4 w-4 text-[#64748B]" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#64748B]">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="border border-[#CBD5E1] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none transition-all duration-200"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-[#64748B]">per page</span>
              </div>
            </div>
          </div>
        )}

        <Dialog open={open} onOpenChange={setIsOpen}>
          <DialogContent className="bg-white border border-[#E2E8F0] max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#0F172A]">
                <NotebookPen className="h-5 w-5" />
                Update Product Group
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-[#334155]">Group Name</Label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="mt-1 border-[#CBD5E1] focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none"
                  placeholder="Enter new group name..."
                />
              </div>
              {error && (
                <div className="text-[#DC2626] text-sm bg-[#FEF2F2] p-2 rounded-lg">
                  {error}
                </div>
              )}
              <Button
                className="w-full bg-[#1E293B] hover:bg-[#0F172A] text-white"
                onClick={() => handleUpdateDetails(currentGroupId)}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={addVariantOpen} onOpenChange={setAddVariantOpen}>
          <DialogContent className="bg-white border border-[#E2E8F0] max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#0F172A]">
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
                      ? "bg-[#1E293B] hover:bg-[#0F172A] text-white"
                      : "border-[#CBD5E1] bg-white"
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
                      ? "bg-[#1E293B] hover:bg-[#0F172A] text-white"
                      : "border-[#CBD5E1] bg-white"
                  }`}
                  onClick={() => setAddMode("full")}
                >
                  Full
                </Button>
              </div>

              <div>
                <Label className="text-[#334155]">Variant Name *</Label>
                <Input
                  value={variantData.name}
                  onChange={(e) =>
                    handleVariantFieldChange("name", e.target.value)
                  }
                  className="mt-1 border-[#CBD5E1] focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none"
                  placeholder="Enter variant name (cannot be 'base')..."
                />
              </div>

              {addMode === "full" && (
                <div className="space-y-3 border-t pt-3">
                  <Label className="text-[#334155] font-semibold">
                    Settings *
                  </Label>
                  <div>
                    <Label className="text-[#475569] text-sm">
                      Classification *
                    </Label>
                    <select
                      value={variantData.setting?.classification || ""}
                      onChange={(e) =>
                        handleSettingFieldChange(
                          "classification",
                          e.target.value,
                        )
                      }
                      className="w-full mt-1 border border-[#CBD5E1] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none transition-all duration-200"
                    >
                      <option value="">Select classification</option>
                      <option value="fast">Fast</option>
                      <option value="slow">Slow</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[#475569] text-sm">
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
                      className="mt-1 border-[#CBD5E1] focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none"
                      placeholder="90"
                    />
                  </div>
                  <div>
                    <Label className="text-[#475569] text-sm">
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
                      className="mt-1 border-[#CBD5E1] focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none"
                      placeholder="90"
                    />
                  </div>
                  <div>
                    <Label className="text-[#475569] text-sm">
                      Safety Stock Methods
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
                      className="mt-1 border-[#CBD5E1] focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none"
                      placeholder="e.g., dynamic"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-[#DC2626] text-sm bg-[#FEF2F2] p-2 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                className="w-full bg-[#1E293B] hover:bg-[#0F172A] text-white"
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