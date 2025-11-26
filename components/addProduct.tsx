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
				<Button className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white py-3 rounded-lg transition-all duration-200 font-medium h-auto">
					<PlusCircle className="h-4 w-4" />
					Add Product Group
				</Button>
			</DialogTrigger>
			<DialogContent className="bg-white border border-[#E2E8F0] rounded-xl max-w-md p-0 overflow-hidden shadow-lg">
				<DialogHeader className="p-6 pb-4 border-b border-[#E2E8F0]">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="bg-[#1E293B] p-2 rounded-lg">
								<Package className="h-5 w-5 text-white" />
							</div>
							<div>
								<DialogTitle className="text-lg font-bold text-[#0F172A]">
									Add Product Group
								</DialogTitle>
								<p className="text-sm text-[#64748B] mt-1">
									Create a new product category
								</p>
							</div>
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

				<div className="p-6 space-y-6">
					{/* Info Card */}
					<div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
						<div className="flex items-start gap-3">
							<div className="bg-white p-1.5 rounded-lg shrink-0">
								<PlusCircle className="h-4 w-4 text-[#1E293B]" />
							</div>
							<div>
								<h4 className="font-semibold text-[#0F172A] text-sm mb-1">
									New Product Group
								</h4>
								<p className="text-[#64748B] text-xs leading-relaxed">
									Add a new product category to organize your inventory. 
									Product groups help categorize similar products together.
								</p>
							</div>
						</div>
					</div>

					{/* Form Section */}
					<div className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label className="text-sm font-medium text-[#334155]">
									Product Group Name *
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
								placeholder="Enter product group name (e.g., Fish Food)"
								className="w-full px-3 py-2.5 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none transition-all duration-200 text-[#0F172A] placeholder-[#64748B] text-sm"
								disabled={isLoading}
								autoFocus
							/>
							{error && (
								<div className="flex items-center gap-2 text-[#DC2626] text-sm bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3">
									<div className="w-1.5 h-1.5 bg-[#DC2626] rounded-full"></div>
									<span className="font-medium">{error}</span>
								</div>
							)}
						</div>

						{/* Quick Tips */}
						<div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
							<h4 className="text-xs font-semibold text-[#334155] mb-3 uppercase tracking-wide">
								Naming Tips
							</h4>
							<ul className="text-xs text-[#64748B] space-y-2">
								<li className="flex items-start gap-2">
									<div className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full mt-1 shrink-0"></div>
									<span>Use clear, descriptive names (e.g., "Premium Fish Food")</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full mt-1 shrink-0"></div>
									<span>Be consistent with existing naming conventions</span>
								</li>
								<li className="flex items-start gap-2">
									<div className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full mt-1 shrink-0"></div>
									<span>Avoid special characters and keep it concise</span>
								</li>
							</ul>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-2">
						<Button
							variant="outline"
							onClick={handleClose}
							disabled={isLoading}
							className="flex-1 border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-2.5 rounded-lg font-medium transition-all duration-200 h-auto text-sm"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmitProduct}
							disabled={isLoading || !productName.trim()}
							className="flex-1 bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 h-auto text-sm"
						>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Creating...
								</>
							) : (
								<>
									<PlusCircle className="h-4 w-4 mr-2" />
									Create Group
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}