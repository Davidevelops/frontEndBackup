import { apiEndpoints } from "@/lib/apiEndpoints";
import { ProductGroup, SalesResponse, Sale } from "@/lib/types";
import apiClient from "@/lib/axiosConfig";

export const getProductList = async (): Promise<ProductGroup[] | null> => {
  try {
    console.log('📦 Fetching product list...');
    console.log('🔑 Token exists:', !!localStorage.getItem('token'));
    
    const response = await apiClient.get(apiEndpoints.productGroup());
    console.log('✅ Product list success');
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Product list error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return null;
  }
};

export const getProductSales = async (groupId: string, productId: string): Promise<SalesResponse> => {
  try {
    console.log('📦 Fetching product sales...');
    const response = await apiClient.get(apiEndpoints.productSales(groupId, productId, undefined));
    return response.data;
  } catch (error) {
    console.error('❌ Product sales error:', error);
    throw error;
  }
};

export const addSale = async (groupId: string, productId: string, saleData: { date: string; quantity: number; status: string }): Promise<Sale> => {
  try {
    console.log('➕ Adding sale...');
    console.log('🔑 Token:', localStorage.getItem('token')?.substring(0, 20) + '...');
    
    const response = await apiClient.post(
      apiEndpoints.productSales(groupId, productId, undefined), 
      saleData, 
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    console.log('✅ Sale added successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Add sale error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const updateSale = async (groupId: string, productId: string, saleId: string, saleData: { date: string; quantity: number; status: string }): Promise<Sale> => {
  try {
    const response = await apiClient.patch(
      apiEndpoints.productSales(groupId, productId, saleId), 
      saleData, 
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteSale = async (groupId: string, productId: string, saleId: string): Promise<void> => {
  try {
    await apiClient.delete(apiEndpoints.productSales(groupId, productId, saleId));
  } catch (error: any) {
    throw error;
  }
};