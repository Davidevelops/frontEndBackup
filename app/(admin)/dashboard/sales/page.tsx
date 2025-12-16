"use client"

import { useState, useEffect, useCallback } from "react"
import SalesTable from "@/components/Sales"
import { Sale } from "@/lib/types"
import { getSales } from "@/lib/data/routes/sales/sales"
import toast from "react-hot-toast"

export default function SalesList() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = useCallback(async () => {
	try {
	  setLoading(true)
	  setError(null)
	  const salesData = await getSales()
	  setSales(salesData || [])
	} catch (err: any) {
	  console.error("Failed to fetch sales:", err)
	  setError(err.message || "Failed to load sales")
	  toast.error("Failed to load sales data")
	} finally {
	  setLoading(false)
	}
  }, [])

  useEffect(() => {
	fetchSales()
  }, [fetchSales])

  const handleRefetch = () => {
	fetchSales()
  }

  if (loading) {
	return (
	  <div className="min-h-screen p-6">
		<div className="max-w-[95rem] mx-auto">
		  <div className="bg-white rounded-xl p-12 border border-[#E2E8F0] text-center">
			<div className="animate-pulse flex flex-col items-center">
			  <div className="bg-[#CBD5E1] rounded-full h-16 w-16 mb-4"></div>
			  <div className="bg-[#E2E8F0] h-6 w-48 rounded mb-2"></div>
			  <div className="bg-[#E2E8F0] h-4 w-32 rounded"></div>
			</div>
		  </div>
		</div>
	  </div>
	)
  }

  if (error) {
	return (
	  <div className="min-h-screen p-6">
		<div className="max-w-[95rem] mx-auto">
		  <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] text-center">
			<h3 className="text-xl font-bold text-[#0F172A] mb-3">
			  Error Loading Sales
			</h3>
			<p className="text-[#64748B] mb-6">{error}</p>
			<button
			  onClick={fetchSales}
			  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
			>
			  Retry
			</button>
		  </div>
		</div>
	  </div>
	)
  }

  // If you're showing ALL sales (not filtered by product), pass empty values
  // for the product-specific props
  return (
	<SalesTable
	  sales={sales}
	  productName="" // Empty for all products view
	  groupId="" // Empty for all products view
	  productId="" // Empty for all products view
	  onRefetch={handleRefetch}

	/>
  )
}