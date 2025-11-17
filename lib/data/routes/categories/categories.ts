import axios from "axios"
import { apiEndpoints } from "@/lib/apiEndpoints"
import { Category } from "@/lib/types"

export const getCategories = async (): Promise<Category[] | null> => {
	try {
		console.log("🔄 Fetching categories from:", apiEndpoints.categories())
		const res = await axios.get(apiEndpoints.categories())
		console.log("✅ Categories response:", res.data)
		return res.data.data
	} catch (error) {
		console.error("❌ Error fetching categories:", error)
		return null
	}
}

export const createCategory = async (categoryData: {
	name: string
}): Promise<Category | null> => {
	try {
		console.log("🔄 Creating category with data:", categoryData)
		console.log("📤 Sending to:", apiEndpoints.categories())

		const res = await axios.post(apiEndpoints.categories(), categoryData)
		console.log("✅ Create category response:", res.data)

		if (res.data && res.data.data) {
			return res.data.data
		} else if (res.data) {
			console.log("📝 Using direct response data")
			return res.data
		} else {
			console.warn("Unexpected response structure:", res.data)
			return null
		}
	} catch (error: any) {
		console.error("Error creating category:", error)

		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.message

		if (
			errorMessage.toLowerCase().includes("duplicate") ||
			errorMessage.toLowerCase().includes("already exists") ||
			error.response?.status === 409
		) {
			throw new Error("A category with this name already exists")
		}

		console.error("📊 Error details:", {
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			message: error.message,
		})
		return null
	}
}

export const updateCategory = async (
	categoryId: string,
	categoryData: { name: string },
): Promise<Category | null> => {
	try {
		console.log("Updating category:", categoryId, "with data:", categoryData)
		console.log("Sending to:", apiEndpoints.categories(categoryId))

		const res = await axios.patch(
			apiEndpoints.categories(categoryId),
			categoryData,
		)
		console.log("Update category response:", res.data)

		if (res.data && res.data.data) {
			return res.data.data
		} else if (res.data) {
			console.log("Using direct response data")
			return res.data
		} else {
			console.warn("Unexpected response structure:", res.data)
			return null
		}
	} catch (error: any) {
		console.error("❌ Error updating category:", error)

		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.message

		if (
			errorMessage.toLowerCase().includes("duplicate") ||
			errorMessage.toLowerCase().includes("already exists") ||
			error.response?.status === 409
		) {
			throw new Error("A category with this name already exists")
		}

		console.error("Error details:", {
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			message: error.message,
		})
		return null
	}
}

export const deleteCategory = async (categoryId: string): Promise<boolean> => {
	try {
		console.log("Deleting category:", categoryId)
		console.log("Sending to:", apiEndpoints.categories(categoryId))

		await axios.delete(apiEndpoints.categories(categoryId))
		console.log("Category deleted successfully")
		return true
	} catch (error: any) {
		console.error("Error deleting category:", error)
		console.error("Error details:", {
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			message: error.message,
		})
		return false
	}
}
