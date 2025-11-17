import axios from "axios"
import { apiEndpoints } from "@/lib/apiEndpoints"
import { Sale } from "@/lib/types"

export const getSales = async (): Promise<Sale[] | null> => {
	try {
		const res = await axios.get(apiEndpoints.sales())
		return res.data.data
	} catch (error) {
		console.error("Error fetching sales:", error)
		return null
	}
}
