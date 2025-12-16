"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sale, SingleProduct, ProductGroup } from "@/lib/types";
import { getProductSales } from "@/lib/data/routes/product/product";
import SalesTable from "@/components/SalesTable";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle, ArrowLeft, Package, PackageCheck, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiEndpoints } from "@/lib/apiEndpoints";
import apiClient from "@/lib/axiosConfig";
import toast from "react-hot-toast";

export default function SalesPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const productId = params.productId as string;

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Fetch product and group details
  const fetchProductAndGroupDetails = async () => {
    try {
      console.log("Fetching variant with:", { groupId, productId });
      
      // Fetch product details - CORRECT URL: /groups/{groupId}/products/{productId}
      const productResponse = await apiClient.get(apiEndpoints.product(groupId, productId));
      console.log("Product API Response:", productResponse);
      console.log("Product API Response data:", productResponse.data);
      
      if (productResponse.data) {
        // Check different possible response structures
        const productData = productResponse.data.data || productResponse.data;
        console.log("Extracted product data:", productData);
        
        if (productData && productData.name) {
          setProductName(productData.name);
          console.log("Variant name set to:", productData.name);
        } else {
          console.error("Product data missing name field:", productData);
          setProductName("Unknown Variant");
        }
      } else {
        console.error("No data in product response");
        setProductName("Unknown Variant");
      }

      // Fetch group details
      const groupResponse = await apiClient.get(apiEndpoints.productGroups(groupId));
      console.log("Group API Response:", groupResponse);
      
      if (groupResponse.data) {
        const groupData = groupResponse.data.data || groupResponse.data;
        console.log("Extracted group data:", groupData);
        
        if (groupData && groupData.name) {
          setGroupName(groupData.name);
          console.log("Group name set to:", groupData.name);
        } else {
          console.error("Group data missing name field:", groupData);
          setGroupName("Unknown Group");
        }
      } else {
        console.error("No data in group response");
        setGroupName("Unknown Group");
      }
    } catch (err: any) {
      console.error("Error fetching product/group details:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      setProductName("Product Variant");
      setGroupName("Product Group");
    }
  };

  // Fetch sales data
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProductSales(groupId, productId);
      setSales(response.data);
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError("Failed to load sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (groupId && productId) {
        console.log("Starting fetch for:", { 
          groupId, 
          productId,
          productEndpoint: apiEndpoints.product(groupId, productId),
          groupEndpoint: apiEndpoints.productGroups(groupId)
        });
        
        await Promise.all([
          fetchProductAndGroupDetails(),
          fetchSalesData()
        ]);
      } else {
        console.error("Missing groupId or productId:", { groupId, productId });
      }
    };

    fetchAllData();
  }, [groupId, productId, refetchTrigger]);

  const handleRefetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const handleBackToVariant = () => {
    router.push(`/dashboard/product-view/${groupId}/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-6">
        <div className="max-w-[95rem] mx-auto">
          {/* Back button skeleton */}
          <div className="mb-4">
            <div className="h-10 w-28 bg-[#E2E8F0] rounded-lg animate-pulse"></div>
          </div>
          
          {/* Product header skeleton */}
          <Card className="bg-white border border-[#E2E8F0] mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#E2E8F0] p-3 rounded-lg w-14 h-14 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-6 w-64 bg-[#E2E8F0] rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-[#E2E8F0] rounded animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading content */}
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
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={handleBackToVariant}
            className="mb-4 flex items-center gap-2 text-[#475569] hover:text-[#0F172A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to variant
          </Button>

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
    <div className="min-h-screen p-8">
      <div className="mx-auto">
     
        {/* <Button
          variant="ghost"
          onClick={handleBackToVariant}
          className="mb-4 flex items-center gap-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to variant details
        </Button> */}

    
        {/* <Card className="bg-white border border-[#E2E8F0] mb-6">
          <CardContent className="p-6">
            <div className="flex items-start sm:items-center gap-4">
           
              <div className="bg-[#1E293B] p-3 rounded-lg flex-shrink-0">
                <PackageCheck className="h-7 w-7 text-white" />
              </div>

        
              <div className="space-y-1">
              
                <div className="flex flex-wrap items-center gap-2">
                  {groupName ? (
                    <>
                      <span className="text-sm font-medium text-[#475569]">
                        Product Group:
                      </span>
                      <h1 className="text-sm font-semibold text-[#1E293B]">
                        {groupName.toUpperCase()}
                      </h1>
                      <ChevronRight className="h-4 w-4 text-[#CBD5E1] mx-1" />
                      <span className="text-sm font-medium text-[#475569]">
                        Variant:
                      </span>
                      <h2 className="text-sm font-bold text-[#0F172A]">
                        {productName.toUpperCase()}
                      </h2>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-[#475569]">
                        Variant:
                      </span>
                      <h2 className="text-sm font-bold text-[#0F172A]">
                        {productName.toUpperCase()}
                      </h2>
                    </>
                  )}
                </div>

  
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <p className="text-[#64748B] flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {sales.length} sales records
                  </p>
                  <p className="text-[#64748B] flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {sales.length > 0 
                      ? `Last sale: ${new Date(sales[sales.length - 1].date).toLocaleDateString()}`
                      : "No sales yet"
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}

        <div className="sales-table-wrapper">
          <SalesTable
            sales={sales}
            productName={productName}
            groupId={groupId}
            productId={productId}
            onRefetch={handleRefetch}
            {...{ groupName } as any}
          />
        </div>
      </div>
    </div>
  );
}