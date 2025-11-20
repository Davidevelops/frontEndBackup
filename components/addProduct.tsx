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
				<Button className="flex gap-2 items-center bg-[#1E293B] hover:bg-[#0F172A] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
					<PlusCircle className="h-5 w-5" />
					Add Product Group
				</Button>
			</DialogTrigger>
			<DialogContent className="bg-white border border-[#E2E8F0] rounded-xl max-w-md p-0 overflow-hidden">
				<DialogHeader className="p-6 pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="bg-[#1E293B] p-2 rounded-lg">
								<Package className="h-6 w-6 text-white" />
							</div>
							<DialogTitle className="text-xl font-bold text-[#0F172A]">
								Add New Product
							</DialogTitle>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClose}
							className="h-8 w-8 rounded-lg hover:bg-[#F1F5F9] transition-colors duration-200"
						>
							<X className="h-4 w-4 text-[#64748B]" />
						</Button>
					</div>
				</DialogHeader>

				<div className="px-6 pb-1">
					<div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 mb-6">
						<div className="flex items-start gap-3">
							<div className="bg-white p-1.5 rounded-lg mt-0.5">
								<PlusCircle className="h-4 w-4 text-[#1E293B]" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold text-[#0F172A] text-sm">
									Create New Product
								</h4>
								<p className="text-[#64748B] text-xs mt-1">
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
							<Label className="text-sm font-semibold text-[#334155]">
								Product Name *
							</Label>
							<span className="text-xs text-[#64748B]">
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
							className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none transition-all duration-200 text-[#0F172A] placeholder-[#64748B]"
							disabled={isLoading}
						/>
						{error && (
							<div className="flex items-center gap-2 text-[#DC2626] text-sm bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3">
								<div className="w-2 h-2 bg-[#DC2626] rounded-full"></div>
								{error}
							</div>
						)}
					</div>

					<div className="flex gap-3 pt-2">
						<Button
							variant="outline"
							onClick={handleClose}
							disabled={isLoading}
							className="flex-1 border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-3 rounded-lg font-medium transition-all duration-200 h-auto"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmitProduct}
							disabled={isLoading || !productName.trim()}
							className="flex-1 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 h-auto"
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

					<div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
						<h4 className="text-xs font-semibold text-[#334155] mb-2">
							Quick Tips
						</h4>
						<ul className="text-xs text-[#64748B] space-y-1">
							<li className="flex items-center gap-2">
								<div className="w-1 h-1 bg-[#94A3B8] rounded-full"></div>
								Use descriptive names for easy identification
							</li>
							<li className="flex items-center gap-2">
								<div className="w-1 h-1 bg-[#94A3B8] rounded-full"></div>
								Include model numbers or specifications
							</li>
							<li className="flex items-center gap-2">
								<div className="w-1 h-1 bg-[#94A3B8] rounded-full"></div>
								Keep names concise but informative
							</li>
						</ul>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}