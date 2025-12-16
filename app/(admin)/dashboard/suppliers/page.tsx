"use client";
import { useState, useEffect } from "react";
import { Supplier as SupplierType } from "@/lib/types";
import { getSuppliers } from "@/lib/data/routes/supplier/supplier";
import SupplierList from "@/components/supplierList";
import axios from "axios";

export default function Supplier() {
	const [suppliers, setSuppliers] = useState<SupplierType[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const fetchSuppliers = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getSuppliers();
			setSuppliers(data);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.error || "An unknown error occurred");
			} else {
				setError("An unexpected error occurred");
			}
			setSuppliers(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSuppliers();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen p-8">
				<div className="mx-auto">
					<div className="bg-white rounded-xl p-12 border border-[#E2E8F0] text-center">
						<div className="animate-pulse flex flex-col items-center">
							<div className="bg-[#CBD5E1] rounded-full h-16 w-16 mb-4"></div>
							<div className="bg-[#E2E8F0] h-6 w-48 rounded mb-2"></div>
							<div className="bg-[#E2E8F0] h-4 w-32 rounded"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen p-8">
				<div className=" mx-auto">
					<div className="bg-white rounded-xl p-8 border border-[#E2E8F0] text-center">
						<div className="text-[#DC2626] text-xl mb-4">⚠️</div>
						<h2 className="text-xl font-semibold text-[#475569] mb-2">
							Error Loading Suppliers
						</h2>
						<p className="text-[#64748B] mb-4">{error}</p>
						<button
							onClick={() => window.location.reload()}
							className="bg-[#1E293B] text-white px-4 py-2 rounded-lg hover:bg-[#0F172A] transition-colors"
						>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<SupplierList supplier={suppliers} refresh={fetchSuppliers} />
		</div>
	);
}