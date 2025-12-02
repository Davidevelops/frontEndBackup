"use client"

import { useState } from "react"
import { X, Loader2, Package } from "lucide-react"
import { Category, ProductGroup } from "@/lib/types"
import ProductGroupSearch from "./ProductGroupSearch"

interface ManageGroupsModalProps {
  category: Category | null
  isOpen: boolean
  onClose: () => void
  onAssign: (categoryId: string, groupId: string) => Promise<void>
  onRemove: (categoryId: string, groupId: string) => Promise<void>
  isAssigning: boolean
  isRemoving: boolean
}

export default function ManageGroupsModal({
  category,
  isOpen,
  onClose,
  onAssign,
  onRemove,
  isAssigning,
  isRemoving
}: ManageGroupsModalProps) {
  const [localIsAssigning, setLocalIsAssigning] = useState(false)
  const [localIsRemoving, setLocalIsRemoving] = useState(false)

  if (!isOpen || !category) return null

  const handleAssign = async (groupId: string) => {
    setLocalIsAssigning(true)
    try {
      await onAssign(category.id, groupId)
    } finally {
      setLocalIsAssigning(false)
    }
  }

  const handleRemove = async (groupId: string) => {
    setLocalIsRemoving(true)
    try {
      await onRemove(category.id, groupId)
    } finally {
      setLocalIsRemoving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Manage Product Groups
              </h2>
              <p className="text-slate-600 mt-1">
                Assign product groups to <span className="font-semibold text-slate-800">{category.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={isAssigning || isRemoving || localIsAssigning || localIsRemoving}
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <ProductGroupSearch
            categoryId={category.id}
            assignedGroups={category.productGroups || []}
            onAssign={handleAssign}
            onRemove={handleRemove}
            isAssigning={isAssigning || localIsAssigning}
            isRemoving={isRemoving || localIsRemoving}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">
                {category.productGroups?.length || 0}
              </span> product groups assigned
            </div>
            <button
              onClick={onClose}
              disabled={isAssigning || isRemoving || localIsAssigning || localIsRemoving}
              className="px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {(isAssigning || isRemoving || localIsAssigning || localIsRemoving) ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                "Done"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}