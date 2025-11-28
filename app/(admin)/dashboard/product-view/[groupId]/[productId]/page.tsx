"use client";

import ProductDetails from "@/components/productDetails";
import { apiEndpoints } from "@/lib/apiEndpoints";
import { SingleProduct } from "@/lib/types";
import apiClient from "@/lib/axiosConfig";
import { useEffect, useState, use } from "react";

interface PageProps {
  params: Promise<{
    groupId: string;
    productId: string;
  }>;
}

export default function Page({ params }: PageProps) {

  const { groupId, productId } = use(params);
  
  const [product, setProduct] = useState<SingleProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProductDetails = async () => {
      try {
        console.log('Fetching product with:', { groupId, productId });
        const response = await apiClient.get(apiEndpoints.product(groupId, productId));
        console.log('API Response:', response.data);
        setProduct(response.data);
      } catch (error: any) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    getProductDetails();
  }, [groupId, productId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {product ? <ProductDetails product={product} /> : <div>Product not found</div>}
    </div>
  );
}