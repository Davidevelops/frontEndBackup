"use client"

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationDialogProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title: string
	description: string
	isLoading?: boolean
}

export default function DeleteConfirmationDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	isLoading = false,
}: DeleteConfirmationDialogProps) {
	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<div className="flex items-center gap-3">
						<div className="bg-red-100 p-2 rounded-full">
							<AlertTriangle className="h-6 w-6 text-red-600" />
						</div>
						<AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
					</div>
					<AlertDialogDescription className="text-base text-gray-600 mt-2">
						{description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isLoading}
						className="bg-red-600 hover:bg-red-700 text-white"
					>
						{isLoading ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
