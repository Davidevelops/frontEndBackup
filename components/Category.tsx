"use client"

import { useState, useEffect } from "react"
import { Category } from "@/lib/types"
import { X, Save } from "lucide-react"

interface CategoryFormProps {
	category?: Category | null
	isOpen: boolean
	onClose: () => void
	onSave: (categoryData: { name: string }) => Promise<void>
	isSubmitting: boolean
	existingCategories?: Category[]
}

export default function CategoryForm({
	category,
	isOpen,
	onClose,
	onSave,
	isSubmitting,
	existingCategories = [],
}: CategoryFormProps) {
	const [name, setName] = useState(category?.name || "")
	const [error, setError] = useState("")

	useEffect(() => {
		if (isOpen) {
			setName(category?.name || "")
			setError("")
		}
	}, [isOpen, category])

	const validateCategoryName = (categoryName: string): string => {
		const trimmedName = categoryName.trim()

		if (!trimmedName) {
			return "Category name is required"
		}

		if (trimmedName.length < 2) {
			return "Category name must be at least 2 characters long"
		}

		if (trimmedName.length > 50) {
			return "Category name must be less than 50 characters"
		}

		const isDuplicate = existingCategories.some(
			(existingCategory) =>
				existingCategory.name.toLowerCase() === trimmedName.toLowerCase() &&
				existingCategory.id !== category?.id,
		)

		if (isDuplicate) {
			return "A category with this name already exists"
		}

		return ""
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const validationError = validateCategoryName(name)
		if (validationError) {
			setError(validationError)
			return
		}

		setError("")

		try {
			await onSave({
				name: name.trim(),
			})

			if (!category) {
				setName("")
			}
		} catch (error) {
			console.error("Form submission error:", error)
		}
	}

	const handleNameChange = (value: string) => {
		setName(value)

		if (error) {
			const validationError = validateCategoryName(value)
			if (!validationError) {
				setError("")
			}
		}
	}

	const handleBlur = () => {
		const validationError = validateCategoryName(name)
		if (validationError) {
			setError(validationError)
		}
	}

	const handleClose = () => {
		setName("")
		setError("")
		onClose()
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-bold text-gray-800">
						{category ? "Edit Category" : "Create New Category"}
					</h2>
					<button
						onClick={handleClose}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						disabled={isSubmitting}
					>
						<X className="h-5 w-5 text-gray-500" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Category Name *
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => handleNameChange(e.target.value)}
							onBlur={handleBlur}
							className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
								error ? "border-red-300" : "border-gray-300"
							}`}
							placeholder="Enter category name"
							disabled={isSubmitting}
							maxLength={50}
						/>
						<div className="flex justify-between items-center mt-1">
							{error ? (
								<p className="text-red-500 text-sm">{error}</p>
							) : (
								<p className="text-gray-400 text-sm">
									{name.length}/50 characters
								</p>
							)}
						</div>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={handleClose}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={
								isSubmitting ||
								!name.trim() ||
								name.trim().length < 2 ||
								!!validateCategoryName(name)
							}
							className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
						>
							<Save className="h-4 w-4" />
							{isSubmitting ? "Saving..." : category ? "Update" : "Create"}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
