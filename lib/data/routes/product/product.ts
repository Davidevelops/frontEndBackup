import { apiEndpoints } from "@/lib/apiEndpoints"
import { ProductGroup, SalesResponse, Sale } from "@/lib/types"
import axios from "axios"

export const getProductList = async (): Promise<ProductGroup[] | null> => {
	try {
		const response = await axios.get(apiEndpoints.productGroup())

		return response.data.data
	} catch (error) {
		return null
	}
}

export const getProductSales = async (
	groupId: string,
	productId: string,
): Promise<SalesResponse> => {
	try {
		const response = await axios.get(
			apiEndpoints.productSales(groupId, productId, undefined),
		)

		return response.data
	} catch (error) {
		throw error
	}
}

export const addSale = async (
	groupId: string,
	productId: string,
	saleData: { date: string; quantity: number; status: string },
): Promise<Sale> => {
	try {
		const response = await axios.post(
			apiEndpoints.productSales(groupId, productId, undefined),
			saleData,
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		)

		return response.data
	} catch (error: any) {
		throw error
	}
}

export const updateSale = async (
	groupId: string,
	productId: string,
	saleId: string,
	saleData: { date: string; quantity: number; status: string },
): Promise<Sale> => {
	try {
		const response = await axios.patch(
			apiEndpoints.productSales(groupId, productId, saleId),
			saleData,
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		)

		return response.data
	} catch (error: any) {
		throw error
	}
}

export const deleteSale = async (
	groupId: string,
	productId: string,
	saleId: string,
): Promise<void> => {
	try {
		await axios.delete(apiEndpoints.productSales(groupId, productId, saleId))
	} catch (error: any) {
		throw error
	}
}
