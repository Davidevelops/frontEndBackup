"use client"

import { useState, useEffect } from "react"
import { ProductGroup } from "@/lib/types"
import ProductList from "@/components/productList"
import AddProduct from "@/components/addProduct"
import {
  Package,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Download,
  Upload,
  Grid3X3,
  Layers,
  Database,
} from "lucide-react"
import { apiEndpoints } from "@/lib/apiEndpoints"
import { exportProductsTemplate,importProducts, downloadBlob, ImportResult  } from "@/lib/data/routes/excel/excel"
import toast from "react-hot-toast"
import apiClient from "@/lib/axiosConfig"

export default function ProductsPage() {
  const [productGroups, setProductGroups] = useState<ProductGroup[] | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fetchProducts = async () => {
    try {
      console.log("🔄 Fetching products from:", apiEndpoints.productGroup());
      
      // Use apiClient instead of fetch
      const response = await apiClient.get(apiEndpoints.productGroup());
      console.log("✅ Products data received:", response.data);
      setProductGroups(response.data.data);
    } catch (error: any) {
      console.error("❌ Error fetching products:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      setProductGroups(null);
      toast.error("Failed to load products. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleExportProducts = async () => {
    setExporting(true)
    try {
      const blob = await exportProductsTemplate({ includeArchived: false })
      if (blob) {
        downloadBlob(blob, `products_${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success("Products exported successfully!")
      } else {
        toast.error("Failed to export products template")
      }
    } catch (error) {
      toast.error("Error exporting products")
    } finally {
      setExporting(false)
    }
  }

  const handleImportProducts = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      console.log("Starting import with .xlsx file:", {
        name: file.name,
        type: file.type,
        size: file.size
      })

      // Create FormData properly for multipart
      const formData = new FormData();
      formData.append("file", file);

      // Use apiClient for consistency
      const response = await apiClient.post(`${apiEndpoints.excelProducts()}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log("Import response status:", response.status)
      console.log("Import response data:", response.data)

      const result = response.data;

      if (response.status === 200 || response.status === 201) {
        // Handle the actual backend response structure
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
        await fetchProducts()
      } else {
        // Handle HTTP error status
        if (result.error) {
          toast.error(`Import failed: ${result.error}`)
        } else if (result.message) {
          toast.error(`Import failed: ${result.message}`)
        } else {
          toast.error(`Import failed with status ${response.status}`)
        }
      }

    } catch (error: any) {
      console.error("Import error:", error)
      
      if (error.response?.data?.error) {
        toast.error(`Import failed: ${error.response.data.error}`)
      } else if (error.response?.data?.message) {
        toast.error(`Import failed: ${error.response.data.message}`)
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
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

  const totalProducts =
    productGroups?.reduce(
      (total, group) => total + (group.products?.length || 0),
      0,
    ) || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
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
              <div className="h-12 w-36 bg-[#E2E8F0] rounded-lg animate-pulse"></div>
              <div className="h-12 w-36 bg-[#E2E8F0] rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
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

          {/* Product Cards Skeleton */}
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
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="relative">
              <div className="bg-[#1E293B] p-3 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#16A34A] border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
                Product Management
              </h1>
              <p className="text-[#64748B] text-lg">
                Manage your product inventory and categories
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Export Button */}
            <button
              onClick={handleExportProducts}
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
                onChange={handleImportProducts}
                disabled={importing}
                className="hidden"
              />
            </label>

            <AddProduct refreshProducts={fetchProducts} />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B] mb-2">TOTAL PRODUCTS</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  {totalProducts}
                </p>
                <p className="text-sm text-[#64748B] mt-1">Across all categories</p>
              </div>
              <div className="bg-[#F1F5F9] p-3 rounded-lg">
                <Package className="h-6 w-6 text-[#1E293B]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B] mb-2">CATEGORIES</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  {productGroups?.length || 0}
                </p>
                <p className="text-sm text-[#64748B] mt-1">Product groups</p>
              </div>
              <div className="bg-[#F0FDF4] p-3 rounded-lg">
                <Layers className="h-6 w-6 text-[#16A34A]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#64748B] mb-2">DATA STATUS</p>
                <p className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#16A34A] rounded-full"></span>
                  Synced & Ready
                </p>
                <p className="text-sm text-[#64748B] mt-1">Auto-refresh enabled</p>
              </div>
              <div className="bg-[#F1F5F9] p-3 rounded-lg">
                <Database className="h-6 w-6 text-[#334155]" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                Bulk Operations
              </h3>
              <p className="text-[#64748B]">
                Use Excel files for bulk import/export operations. 
                <span className="text-[#DC2626] font-medium ml-1">
                  Only .xlsx format supported.
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-[#0F172A]">
                  {productGroups?.length || 0} categories
                </p>
                <p className="text-sm text-[#64748B]">
                  {totalProducts} total products
                </p>
              </div>
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
                <Grid3X3 className="h-6 w-6 text-[#64748B]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
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
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  Retry Loading
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
                <p className="text-[#64748B] mb-6">
                  Start building your inventory by adding your first product group
                  or import from Excel.
                </p>
                <div className="flex flex-col gap-3">
                  <AddProduct refreshProducts={fetchProducts} />
                  <label className="flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Import from Excel (.xlsx)
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={handleImportProducts}
                      className="hidden"
                    />
                  </label>
                </div>
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