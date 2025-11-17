import axios from "axios"
import { Supplier } from "@/lib/types"
import { apiEndpoints } from "@/lib/apiEndpoints"

export const getSuppliers = async (): Promise<Supplier[] | null> => {
	try {
		const res = await axios.get(`${apiEndpoints.supplier()}?include=products`)
		return res.data.data
	} catch (error) {
		return null
	}
}

export const getSupplier = async (id: string): Promise<Supplier | null> => {
	try {
		const res = await axios.get(`${apiEndpoints.supplier(id)}?include=products`)
		return res.data.data
	} catch (error) {
		return null
	}
}

export const updateSupplier = async (
	supplierId: string,
	data: { name: string; leadTime: number },
): Promise<Supplier | null> => {
	try {
		const res = await axios.patch(`${apiEndpoints.supplier(supplierId)}`, data)
		return res.data.data
	} catch (error) {
		throw error
	}
}

export const deleteSupplier = async (supplierId: string): Promise<boolean> => {
	try {
		await axios.delete(apiEndpoints.supplier(supplierId))
		return true
	} catch (error) {
		throw error
	}
}

export const createSupplier = async (data: {
	name: string
	leadTime: number
}): Promise<Supplier | null> => {
	try {
		const res = await axios.post(apiEndpoints.supplier(), data)
		return res.data.data
	} catch (error) {
		throw error
	}
}

export const addProductToSupplier = async (
	supplierId: string,
	data: { productId: string; min: number; max: number },
): Promise<Supplier | null> => {
	try {
		const res = await axios.post(apiEndpoints.suppliedProduct(supplierId), data)
		return res.data.data
	} catch (error: any) {
		throw error
	}
}

export const updateSupplierProduct = async (
	supplierId: string,
	productId: string,
	data: { min: number; max: number },
): Promise<Supplier | null> => {
	try {
		const res = await axios.patch(
			apiEndpoints.suppliedProduct(supplierId, productId),
			data,
		)
		return res.data.data
	} catch (error) {
		throw error
	}
}

export const deleteSupplierProduct = async (
	supplierId: string,
	productId: string,
): Promise<boolean> => {
	try {
		await axios.delete(apiEndpoints.suppliedProduct(supplierId, productId))
		return true
	} catch (error) {
		throw error
	}
}

export const getSuppliedProducts = async (supplierId: string) => {
	try {
		const res = await axios.get(
			`${apiEndpoints.supplier(supplierId)}?include=products`,
		)
		return res.data.data
	} catch (error) {
		throw error
	}
}
