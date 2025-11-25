"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sale } from "@/lib/types";
import { getProductSales } from "@/lib/data/routes/product/product";
import SalesTable from "@/components/SalesTable";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";

export default function SalesPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const productId = params.productId as string;

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productName, setProductName] = useState("Product Variant");
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProductSales(groupId, productId);
        setSales(response.data);
        setProductName("Product Variant");
      } catch (err) {
        console.error("Error fetching sales data:", err);
        setError("Failed to load sales data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (groupId && productId) {
      fetchSalesData();
    }
  }, [groupId, productId, refetchTrigger]);

  const handleRefetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-6">
        <div className="max-w-[95rem] mx-auto">
          <Card className="bg-white border border-[#E2E8F0]">
            <CardContent className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#475569] mx-auto mb-4" />
                <p className="text-lg font-semibold text-[#1E293B]">
                  Loading Sales Data
                </p>
                <p className="text-[#475569]">
                  Fetching your product analytics...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-6">
        <div className="max-w-[95rem] mx-auto">
          <Card className="bg-white border border-[#E2E8F0]">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-[#64748B]" />
              </div>
              <div className="text-[#1E293B] text-lg font-semibold mb-2">
                Error Loading Data
              </div>
              <p className="text-[#475569] mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#1E293B] text-white px-6 py-2 rounded-xl hover:bg-[#0F172A] transition-all duration-200"
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <SalesTable
      sales={sales}
      productName={productName}
      groupId={groupId}
      productId={productId}
      onRefetch={handleRefetch}
    />
  );
}