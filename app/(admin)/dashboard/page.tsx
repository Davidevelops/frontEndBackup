"use client";
import { useProductStore } from "@/lib/productStore";
import DashboardOverview from "@/components/DashboardOverview";
import { useEffect } from "react";
import React from "react";


export default function Home() {
	const { isLoading, error, products, getProducts } = useProductStore();
	useEffect(() => {
		getProducts();
	}, [products]);
	return (
		<div className="p-3">
			<DashboardOverview />
		</div>
	);
}
