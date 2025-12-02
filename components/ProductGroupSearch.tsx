"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2, Check, Package } from "lucide-react"
import { ProductGroup } from "@/lib/types"
import { getProductGroups } from "@/lib/data/routes/categories/productGroups"

interface ProductGroupSearchProps {
  categoryId: string;
  assignedGroups: ProductGroup[];
  onAssign: (groupId: string) => Promise<void>;
  onRemove: (groupId: string) => Promise<void>;
  isAssigning?: boolean;
  isRemoving?: boolean;
}

export default function ProductGroupSearch({
  categoryId,
  assignedGroups,
  onAssign,
  onRemove,
  isAssigning = false,
  isRemoving = false
}: ProductGroupSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [allProductGroups, setAllProductGroups] = useState<ProductGroup[]>([])
  const [filteredGroups, setFilteredGroups] = useState<ProductGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasLoadedAllGroups, setHasLoadedAllGroups] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load all product groups on component mount
  useEffect(() => {
    loadAllProductGroups()
  }, [])

  // Filter groups based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Show all available groups when search is empty
      setFilteredGroups(
        allProductGroups.filter(
          group => !assignedGroups.some(assigned => assigned.id === group.id)
        )
      )
    } else {
      // Filter by search term
      const filtered = allProductGroups.filter(
        group =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !assignedGroups.some(assigned => assigned.id === group.id)
      )
      setFilteredGroups(filtered)
    }
  }, [searchTerm, allProductGroups, assignedGroups])

  const loadAllProductGroups = async () => {
    setIsLoading(true)
    try {
      const result = await getProductGroups(undefined, 100) // Load up to 100 groups
      if (result?.data) {
        setAllProductGroups(result.data)
        setHasLoadedAllGroups(true)
        // Initially show all available groups
        setFilteredGroups(
          result.data.filter(
            group => !assignedGroups.some(assigned => assigned.id === group.id)
          )
        )
      }
    } catch (error) {
      console.error("Error loading product groups:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleInputFocus = () => {
    if (!isOpen) {
      setIsOpen(true)
    }
    // Refresh the list when focusing
    if (!hasLoadedAllGroups) {
      loadAllProductGroups()
    }
  }

  const handleAssign = async (group: ProductGroup) => {
    try {
      await onAssign(group.id)
      // Remove from filtered list after assigning
      setFilteredGroups(prev => prev.filter(g => g.id !== group.id))
      setSearchTerm("") // Clear search term
      setIsOpen(false) // Close dropdown
      // Focus back on input
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error("Error assigning product group:", error)
    }
  }

  const handleClear = () => {
    setSearchTerm("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
    if (e.key === 'Enter' && filteredGroups.length === 1) {
      // If there's only one result, assign it on Enter
      handleAssign(filteredGroups[0])
    }
  }

  const getAvailableGroupCount = () => {
    return allProductGroups.filter(
      group => !assignedGroups.some(assigned => assigned.id === group.id)
    ).length
  }

  return (
    <div className="space-y-6" ref={containerRef}>
      {/* Search Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Search and Assign Product Groups
        </label>
        <div className="relative" onKeyDown={handleKeyDown}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="Type to filter product groups..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              disabled={isAssigning || isRemoving || isLoading}
            />
            {searchTerm && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isAssigning || isRemoving || isLoading}
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Info text */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-500">
              {isLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading product groups...
                </span>
              ) : (
                `${getAvailableGroupCount()} available product groups`
              )}
            </p>
            {searchTerm && (
              <p className="text-xs text-slate-500">
                Showing {filteredGroups.length} of {getAvailableGroupCount()} groups
              </p>
            )}
          </div>

          {/* Dropdown with all available groups */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                  <span className="ml-2 text-sm text-slate-500">Loading...</span>
                </div>
              ) : filteredGroups.length > 0 ? (
                <ul className="py-2">
                  {filteredGroups.map((group) => (
                    <li key={group.id} className="border-b border-slate-100 last:border-b-0">
                      <button
                        onClick={() => handleAssign(group)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between group"
                        disabled={isAssigning || isRemoving}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-slate-900">{group.name}</div>
                            <div className="text-sm text-slate-500">
                              {group.products?.length || 0} products
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                            Assign
                          </span>
                          <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center">
                  {getAvailableGroupCount() === 0 ? (
                    <>
                      <div className="text-slate-400 mb-1">No product groups available</div>
                      <div className="text-sm text-slate-500">
                        All product groups are already assigned to this category
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-slate-400 mb-1">No matching product groups</div>
                      <div className="text-sm text-slate-500">
                        Try a different search term
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assigned Groups Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-700">Assigned Product Groups</h4>
          <span className="text-sm text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {assignedGroups.length} assigned
          </span>
        </div>
        
        {assignedGroups.length > 0 ? (
          <div className="space-y-2">
            {assignedGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Package className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{group.name}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-3">
                      <span>ID: {group.id.slice(0, 8)}...</span>
                      <span>•</span>
                      <span>{group.products?.length || 0} products</span>
                      {group.productCategoryId && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">Already categorized</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(group.id)}
                  disabled={isRemoving || isAssigning}
                  className="px-3 py-1.5 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isRemoving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="bg-white p-3 rounded-lg w-12 h-12 mx-auto mb-3 shadow-xs">
              <Package className="h-6 w-6 text-slate-400 mx-auto" />
            </div>
            <p className="text-slate-500">No product groups assigned yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Click on the input above to see available product groups
            </p>
          </div>
        )}
      </div>
    </div>
  )
}