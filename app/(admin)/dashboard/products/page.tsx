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
import { exportProductsTemplate, importProducts, downloadBlob, ImportResult } from "@/lib/data/routes/excel/excel"
import toast from "react-hot-toast"
import apiClient from "@/lib/axiosConfig"


interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

interface ImportError {
  row?: number
  message: string
  field?: string
  value?: any
}

interface ImportResponse {
  groupsCreated?: number
  groupsUpdated?: number
  productsCreated?: number
  productsUpdated?: number
  errors?: ImportError[]
  error?: string
  message?: string
}

// Logging utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data ? data : '')
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data ? data : '')
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error ? error : '')
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data ? data : '')
    }
  }
}

export default function ProductsPage() {
  const [productGroups, setProductGroups] = useState<ProductGroup[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [fetchError, setFetchError] = useState<ApiError | null>(null)

  // Enhanced error handler
  const handleError = (error: any, context: string, userMessage: string = "An error occurred") => {
    const errorDetails: ApiError = {
      message: error.message || 'Unknown error occurred',
      status: error.response?.status,
      code: error.code,
      details: error.response?.data
    }

    logger.error(`Error in ${context}:`, errorDetails)

    // Show generic user message
    toast.error(userMessage)

    // Detailed errors are only in logs, not in toast
  }

  const fetchProducts = async (retryCount = 0): Promise<void> => {
    const maxRetries = 3
    const retryDelay = 1000 * Math.pow(2, retryCount) // Exponential backoff

    try {
      setLoading(true)
      setFetchError(null)
      logger.info('Fetching products', { 
        endpoint: apiEndpoints.productGroup(),
        retryCount 
      })

      const response = await apiClient.get(apiEndpoints.productGroup())
      
      if (!response.data) {
        throw new Error('No data received from server')
      }

      if (!response.data.data) {
        logger.warn('Unexpected response structure', response.data)
        throw new Error('Invalid response format from server')
      }

      setProductGroups(response.data.data)
      logger.info('Products fetched successfully', {
        groupCount: response.data.data.length,
        totalProducts: response.data.data.reduce((total: number, group: ProductGroup) => 
          total + (group.products?.length || 0), 0
        )
      })

    } catch (error: any) {
      const errorContext = `fetchProducts (attempt ${retryCount + 1})`
      
      if (retryCount < maxRetries && error.response?.status >= 500) {
        logger.warn(`Retrying fetch after ${retryDelay}ms`, { retryCount })
        setTimeout(() => fetchProducts(retryCount + 1), retryDelay)
        return
      }

      const apiError: ApiError = {
        message: error.message,
        status: error.response?.status,
        details: error.response?.data
      }
      
      setFetchError(apiError)
      setProductGroups(null)
      handleError(error, errorContext, 'Failed to load products')

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleExportProducts = async (): Promise<void> => {
    setExporting(true)
    try {
      logger.info('Starting products export')
      
      const blob = await exportProductsTemplate({ includeArchived: false })
      
      if (!blob) {
        throw new Error('Export returned empty blob')
      }

      if (blob.size === 0) {
        throw new Error('Export returned empty file')
      }

      const filename = `products_${new Date().toISOString().split('T')[0]}.xlsx`
      downloadBlob(blob, filename)
      
      logger.info('Products exported successfully', { filename, size: blob.size })
      toast.success("Products exported successfully!")

    } catch (error: any) {
      handleError(error, 'handleExportProducts', 'Error exporting products')
    } finally {
      setExporting(false)
    }
  }

  const validateImportFile = (file: File): string | null => {
    // File type validation
    if (!file.name.endsWith('.xlsx')) {
      return "Please select an Excel file with .xlsx format only"
    }

    // MIME type validation
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ]
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx')) {
      return "Invalid file type. Please select a valid .xlsx Excel file"
    }

    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return "File size too large. Please select a file smaller than 10MB."
    }

    if (file.size === 0) {
      return "File is empty. Please select a valid file."
    }

    return null
  }

  const handleImportProducts = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    if (!file) {
      logger.warn('No file selected for import')
      return
    }

    // Validate file
    const validationError = validateImportFile(file)
    if (validationError) {
      toast.error(validationError)
      logger.warn('File validation failed', { 
        fileName: file.name, 
        fileType: file.type, 
        fileSize: file.size 
      })
      return
    }

    setImporting(true)
    
    logger.info('Starting products import', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await apiClient.post<ImportResponse>(
        `${apiEndpoints.excelProducts()}/import`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout for large files
        }
      )

      logger.info('Import API response received', {
        status: response.status,
        data: response.data
      })

      const result = response.data

      if (response.status === 200 || response.status === 201) {
        await handleImportSuccess(result)
      } else {
        handleImportFailure(result, response.status)
      }

    } catch (error: any) {
      await handleImportError(error)
    } finally {
      setImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleImportSuccess = async (result: ImportResponse): Promise<void> => {
    const groupsCreated = result.groupsCreated || 0
    const groupsUpdated = result.groupsUpdated || 0
    const productsCreated = result.productsCreated || 0
    const productsUpdated = result.productsUpdated || 0
    const errors = result.errors || []
    
    const totalChanges = groupsCreated + groupsUpdated + productsCreated + productsUpdated
    
    logger.info('Import completed with results', {
      groupsCreated,
      groupsUpdated,
      productsCreated,
      productsUpdated,
      errorCount: errors.length,
      totalChanges
    })

    if (errors.length > 0) {
      const errorDetails = errors.slice(0, 3).map((error: ImportError) => 
        `Row ${error.row}: ${error.message || 'Unknown error'}`
      ).join('; ')
      
      if (totalChanges > 0) {
        toast.success(
          `Import partially successful! ` +
          `Groups: ${groupsCreated} created, ${groupsUpdated} updated. ` +
          `Products: ${productsCreated} created, ${productsUpdated} updated. ` +
          `But had ${errors.length} error(s)`
        )
        if (errorDetails) {
          // Log detailed errors but don't show in toast
          logger.warn('Import completed with errors', { 
            errorDetails,
            totalErrors: errors.length 
          })
        }
      } else {
        toast.error("Import failed with errors")
        logger.error('Import failed completely with errors', { errors })
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
    
    // Refresh data after successful import
    try {
      await fetchProducts()
      logger.info('Data refreshed after import')
    } catch (error) {
      logger.error('Failed to refresh data after import', error)
      // Don't show error toast here as import might still be successful
    }
  }

  const handleImportFailure = (result: ImportResponse, status: number): void => {
    logger.error('Import failed with HTTP error', { status, result })
    
    // Show generic error to user, details in logs
    toast.error("Import failed")
  }

  const handleImportError = async (error: any): Promise<void> => {
    logger.error('Import process failed', error)

    // Handle specific error types but show generic message
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      toast.error("Import timeout")
      return
    }

    // Always show generic error to user
    toast.error("Import failed")
  }

  const totalProducts = productGroups?.reduce(
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
              <div className="h-12 w-36 bg-[#E2E8F0] rounded-lg animate-pulse"></div>
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

      
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportProducts}
              disabled={exporting}
              className="text-xs flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-400 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
            >
              <Download className={`h-4 w-4 ${exporting ? 'animate-spin' : ''}`} />
              {exporting ? "Exporting..." : "Export Excel"}
            </button>

    
            <label className="text-xs flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 border border-green-400 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium cursor-pointer disabled:opacity-50">
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
                  <span className={`w-2 h-2 rounded-full ${fetchError ? 'bg-[#DC2626]' : 'bg-[#16A34A]'}`}></span>
                  {fetchError ? 'Sync Failed' : 'Synced & Ready'}
                </p>
                <p className="text-sm text-[#64748B] mt-1">
                  {fetchError ? 'Click retry to reload' : 'Auto-refresh enabled'}
                </p>
              </div>
              <div className="bg-[#F1F5F9] p-3 rounded-lg">
                <Database className="h-6 w-6 text-[#334155]" />
              </div>
            </div>
          </div>
        </div>

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
                  {fetchError?.message || 'There was an error fetching your product data.'}
                  {fetchError?.status && ` (Status: ${fetchError.status})`}
                </p>
                <button
                  onClick={() => fetchProducts()}
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
            <div className="p-4">
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