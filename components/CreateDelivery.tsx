"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, X, Save, Package, Search, ChevronDown } from "lucide-react"
import toast from "react-hot-toast"
import {
  CreateDeliveryData,
  CreateDeliveryItem,
  Supplier,
  ProductGroup,
  SingleProduct,
} from "@/lib/types"
import { createDelivery } from "@/lib/data/routes/delivery/delivery"
import {
  getSuppliedProducts,
  getSuppliers,
} from "@/lib/data/routes/supplier/supplier"
import MiniRecommendationsPanel from "./MiniRecommendations"
import { productGroupsApi } from "@/lib/data/routes/temp/service"

interface CreateDeliveryProps {
  onDeliveryCreated: () => void
}

interface SearchableDropdownProps {
  options: { id: string; name: string }[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  loading?: boolean
}

function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  loading = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOption, setSelectedOption] = useState<{
    id: string
    name: string
  } | null>(null)

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [options, searchTerm])

  useEffect(() => {
    const option = options.find((opt) => opt.id === value)
    setSelectedOption(option || null)
    if (option) {
      setSearchTerm(option.name)
    } else {
      setSearchTerm("")
    }
  }, [value, options])

  const handleSelect = (option: { id: string; name: string }) => {
    onChange(option.id)
    setSearchTerm(option.name)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    setSearchTerm("")
  }

  const handleInputBlur = (e: React.FocusEvent) => {
    setTimeout(() => setIsOpen(false), 200)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white pr-10"
          placeholder={placeholder}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          {loading ? (
            <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-600">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                  selectedOption?.id === option.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700"
                }`}
                onClick={() => handleSelect(option)}
              >
                {option.name}
                <div className="text-xs text-gray-500">ID: {option.id}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export interface SuppliedProduct {
  productId: string
  groupId: string
  groupName: string
  productName: string
  maxOrderable: number
  minOrderable: number
  isDefault: boolean
}

export default function CreateDelivery({
  onDeliveryCreated,
}: CreateDeliveryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<SuppliedProduct[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [formData, setFormData] = useState<CreateDeliveryData>({
    items: [{ productId: "", quantity: 0 }],
    status: "pending",
    supplierId: "",
  })

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers()
    }
  }, [isOpen])

  useEffect(() => {
    if (formData.supplierId) {
      fetchAllProducts()
    } else {
      // Clear products when no supplier is selected
      setProducts([])
      setDebugInfo("Select a supplier to load products")
    }
  }, [formData.supplierId])

  const fetchSuppliers = async () => {
    setLoadingSuppliers(true)
    try {
      const suppliersData = await getSuppliers()
      setSuppliers(suppliersData || [])
      setDebugInfo(`Loaded ${suppliersData?.length || 0} suppliers`)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      setSuppliers([])
      setDebugInfo(`Error loading suppliers: ${error}`)
    } finally {
      setLoadingSuppliers(false)
    }
  }

  // Fetch all products using the productGroupsApi service
  const fetchAllProducts = async () => {
    setLoadingProducts(true)
    setDebugInfo("Starting to fetch all products...")
    
    try {
      // Get all product groups using productGroupsApi
      setDebugInfo("Fetching product groups...")
      const productGroups = await productGroupsApi.getAll()
      
      console.log('Product groups fetched:', productGroups)
      setDebugInfo(`Found ${productGroups.length} product groups`)
      
      // Create an array to hold all products
      const allProducts: SuppliedProduct[] = []
      
      // Fetch products for each group
      for (const group of productGroups) {
        try {
          setDebugInfo(`Fetching products for group: ${group.name} (${group.id})`)
          
          // Use productGroupsApi to get products for this group
          const productsInGroup = await productGroupsApi.getProductsByGroup(group.id)
          
          console.log(`Products for group ${group.name}:`, productsInGroup)
          
          // Convert SingleProduct to SuppliedProduct format
          const convertedProducts: SuppliedProduct[] = productsInGroup.map((product: SingleProduct) => ({
            productId: product.id,
            groupId: group.id,
            groupName: group.name,
            productName: product.name,
            maxOrderable: product.stock || 100, // Use stock property
            minOrderable: 1,
            isDefault: false
          }))
          
          allProducts.push(...convertedProducts)
          setDebugInfo(prev => `${prev}\nGroup ${group.name}: ${convertedProducts.length} products`)
        } catch (error) {
          console.error(`Error fetching products for group ${group.id}:`, error)
          setDebugInfo(prev => `${prev}\nError fetching products for group ${group.name}: ${error}`)
        }
      }
      
      setProducts(allProducts)
      console.log('All products fetched:', allProducts)
      setDebugInfo(prev => `${prev}\n✅ Total products loaded: ${allProducts.length}`)
    } catch (error) {
      console.error("Error fetching all products:", error)
      setProducts([])
      setDebugInfo(`❌ Error fetching products: ${error}`)
    } finally {
      setLoadingProducts(false)
    }
  }

  const supplierOptions = useMemo(() => {
    return suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
    }))
  }, [suppliers])

  const productOptions = useMemo(() => {
    console.log('Generating product options from products:', products)
    const options = products.map((product) => ({
      id: product.productId,
      name: `${product.groupName} - ${product.productName}`,
      originalProduct: product // Keep reference for minOrderable
    }))
    console.log('Generated product options:', options.length, 'options')
    return options
  }, [products])

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 0 }],
    }))
  }

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (
    index: number,
    field: keyof CreateDeliveryItem,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const validItems = formData.items.filter(
        (item) => item.productId.trim() && item.quantity > 0,
      )

      if (validItems.length === 0) {
        toast.error("Please add at least one valid item")
        setLoading(false)
        return
      }

      if (!formData.supplierId) {
        toast.error("Please select a supplier")
        setLoading(false)
        return
      }

      await createDelivery({
        ...formData,
        items: validItems,
      })

      toast.success("Delivery created successfully!")
      onDeliveryCreated()
      setIsOpen(false)

      setFormData({
        items: [{ productId: "", quantity: 0 }],
        status: "pending",
        supplierId: "",
      })
    } catch (error: any) {
      console.error("Error creating delivery:", error)
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 409) {
          // Product is not supplied by supplier error
          toast.error(
            <div>
              <div className="font-semibold">Cannot Create Delivery</div>
              <div className="text-sm">The selected product is not supplied by this supplier.</div>
              <div className="text-xs mt-1">Please select a product that is associated with the supplier.</div>
            </div>,
            {
              duration: 5000,
              style: {
                background: '#fee',
                border: '1px solid #fcc',
              }
            }
          )
        } else if (error.response.status === 400) {
          toast.error(
            <div>
              <div className="font-semibold">Invalid Request</div>
              <div className="text-sm">{error.response.data?.error || "Please check your input"}</div>
            </div>
          )
        } else if (error.response.status === 401) {
          toast.error("Unauthorized access. Please log in again.")
        } else if (error.response.status === 500) {
          toast.error("Server error. Please try again later.")
        } else {
          toast.error(`Failed to create delivery: ${error.response.data?.error || "Unknown error"}`)
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.")
      } else {
        toast.error(`Failed to create delivery: ${error.message || "Unknown error"}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-400 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/30"
      >
        <Plus className="h-5 w-5" />
        New Delivery
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-700" />
                Create New Delivery
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Debug info section */}
              {debugInfo && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium text-yellow-800 text-sm mb-1">Debug Info:</div>
                  <div className="text-yellow-700 text-xs whitespace-pre-wrap">{debugInfo}</div>
                  <div className="text-yellow-600 text-xs mt-1">
                    Products loaded: {products.length} | Product options: {productOptions.length}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    Supplier *
                  </label>
                  <SearchableDropdown
                    options={supplierOptions}
                    value={formData.supplierId}
                    onChange={(supplierId) =>
                      setFormData((prev) => ({
                        ...prev,
                        supplierId,
                      }))
                    }
                    placeholder="Search suppliers by name..."
                    loading={loadingSuppliers}
                  />
                </div>

                {/* Mini Recommendations Panel - Only shows when supplier is selected */}
                <MiniRecommendationsPanel supplierId={formData.supplierId || null} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as "pending" | "completed" | "cancelled",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-600" />
                      Delivery Items *
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-sm text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <SearchableDropdown
                              options={productOptions.filter(
                                (option) =>
                                  !formData.items.some(
                                    (selectedItem, i) =>
                                      selectedItem.productId === option.id &&
                                      i !== index,
                                  ),
                              )}
                              value={item.productId}
                              onChange={(productId) => {
                                // Find the selected product
                                const selectedOption = productOptions.find(opt => opt.id === productId)
                                updateItem(index, "productId", productId)
                                // Set quantity to minOrderable if available
                                if (selectedOption && selectedOption.originalProduct) {
                                  updateItem(
                                    index,
                                    "quantity",
                                    selectedOption.originalProduct.minOrderable || 1
                                  )
                                }
                              }}
                              placeholder="Search products..."
                              loading={loadingProducts}
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                              placeholder="Quantity"
                              min="1"
                            />
                          </div>
                        </div>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mt-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Creating..." : "Create Delivery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}