"use client";
import axios from "axios";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, X, Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiEndpoints } from "@/lib/apiEndpoints";

type Props = {
	refreshProducts: () => Promise<void>
}
export default function AddProduct({ refreshProducts }: Props) {
	const [productName, setProductName] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [isOpen, setIsOpen] = useState(false);

	const handleSubmitProduct = async () => {
		if (!productName.trim()) {
			setError("Product name is required");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			await axios.post(apiEndpoints.productGroup(), {
				name: productName.trim(),
			});
			setProductName("");
			setError("");
			setIsOpen(false);
			refreshProducts()
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.error || "An unknown error occurred");
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setIsOpen(false);
		setProductName("");
		setError("");
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button className="flex gap-2 items-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-6 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 border-0">
					<PlusCircle className="h-5 w-5" />
					Add Product Group
				</Button>
			</DialogTrigger>
			<DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-2xl shadow-xl max-w-md p-0 overflow-hidden">
				<DialogHeader className="p-6 pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-xl">
								<Package className="h-6 w-6 text-white" />
							</div>
							<DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
								Add New Product
							</DialogTitle>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClose}
							className="h-8 w-8 rounded-lg hover:bg-gray-100 transition-colors duration-200"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</DialogHeader>

				<div className="px-6 pb-1">
					<div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4 mb-6">
						<div className="flex items-start gap-3">
							<div className="bg-white p-1.5 rounded-lg mt-0.5">
								<PlusCircle className="h-4 w-4 text-purple-600" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold text-gray-800 text-sm">
									Create New Product
								</h4>
								<p className="text-gray-600 text-xs mt-1">
									Add a new product to your inventory. The product will be
									available across all categories.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="px-6 pb-6 space-y-6">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label className="text-sm font-semibold text-gray-700">
								Product Name *
							</Label>
							<span className="text-xs text-gray-500">
								{productName.length}/50
							</span>
						</div>
						<Input
							value={productName}
							onChange={(e) => {
								setProductName(e.target.value.slice(0, 50));
								setError("");
							}}
							placeholder="Enter product name (e.g., Fish Food)"
							className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-400"
							disabled={isLoading}
						/>
						{error && (
							<div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
								<div className="w-2 h-2 bg-red-500 rounded-full"></div>
								{error}
							</div>
						)}
					</div>

					<div className="flex gap-3 pt-2">
						<Button
							variant="outline"
							onClick={handleClose}
							disabled={isLoading}
							className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 h-auto"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmitProduct}
							disabled={isLoading || !productName.trim()}
							className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 h-auto"
						>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Adding Product...
								</>
							) : (
								<>
									<PlusCircle className="h-4 w-4 mr-2" />
									Add Product Group
								</>
							)}
						</Button>
					</div>

					<div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
						<h4 className="text-xs font-semibold text-gray-700 mb-2">
							Quick Tips
						</h4>
						<ul className="text-xs text-gray-600 space-y-1">
							<li className="flex items-center gap-2">
								<div className="w-1 h-1 bg-gray-400 rounded-full"></div>
								Use descriptive names for easy identification
							</li>
							<li className="flex items-center gap-2">
								<div className="w-1 h-1 bg-gray-400 rounded-full"></div>
								Include model numbers or specifications
							</li>
							<li className="flex items-center gap-2">
								<div className="w-1 h-1 bg-gray-400 rounded-full"></div>
								Keep names concise but informative
							</li>
						</ul>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
