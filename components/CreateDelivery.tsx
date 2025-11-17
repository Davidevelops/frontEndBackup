"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, X, Save, Package, Search, ChevronDown } from "lucide-react"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
          placeholder={placeholder}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {loading ? (
            <div className="h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors ${
                  selectedOption?.id === option.id
                    ? "bg-purple-100 text-purple-700"
                    : ""
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
      fetchSuppliedProducts()
    }
  }, [formData.supplierId])

  const fetchSuppliers = async () => {
    setLoadingSuppliers(true)
    try {
      const suppliersData = await getSuppliers()
      setSuppliers(suppliersData || [])
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      setSuppliers([])
    } finally {
      setLoadingSuppliers(false)
    }
  }

  const fetchSuppliedProducts = async () => {
    setLoadingProducts(true)
    try {
      const suppliedProduct = await getSuppliedProducts(formData.supplierId)
      setProducts(suppliedProduct.products)
    } catch (error) {
      setProducts([])
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
    if (products) {
      return products.map((product) => ({
        id: product.productId,
        name: `${product.groupName} - (${product.productName})`,
      }))
    } else {
      return []
    }
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
        alert("Please add at least one valid item")
        return
      }

      if (!formData.supplierId) {
        alert("Please select a supplier")
        return
      }

      await createDelivery({
        ...formData,
        items: validItems,
      })

      onDeliveryCreated()
      setIsOpen(false)

      setFormData({
        items: [{ productId: "", quantity: 0 }],
        status: "pending",
        supplierId: "",
      })
    } catch (error) {
      console.error("Error creating delivery:", error)
      alert("Failed to create delivery. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
      >
        <Plus className="h-5 w-5" />
        New Delivery
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                Create New Delivery
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-600" />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-600" />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      Delivery Items *
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
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
                                const selectedProduct = products.find(
                                  (p) => p.productId === productId,
                                )
                                updateItem(index, "productId", productId)
                                if (selectedProduct) {
                                  updateItem(
                                    index,
                                    "quantity",
                                    selectedProduct.minOrderable,
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Quantity"
                              min="1"
                            />
                          </div>
                        </div>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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