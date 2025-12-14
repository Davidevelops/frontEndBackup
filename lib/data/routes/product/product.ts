import axiosInstance from '@/lib/axiosConfig';
import { apiEndpoints } from "@/lib/apiEndpoints";
import { ProductGroup, SalesResponse, Sale } from "@/lib/types";

export const getProductList = async (): Promise<ProductGroup[] | null> => {
  try {
    console.log('📦 Fetching product list...');
    
    // FIXED: Changed from productGroup() to productGroups()
    const response = await axiosInstance.get(apiEndpoints.productGroups());
    console.log('✅ Product list success');
    
    // Extract data based on your API response structure
    // Assuming your API returns { data: [...] } or just an array
    const data = response.data;
    return Array.isArray(data) ? data : data.data || data.products || [];
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
    const response = await axiosInstance.get(apiEndpoints.productSales(groupId, productId, undefined));
    return response.data;
  } catch (error) {
    console.error('❌ Product sales error:', error);
    throw error;
  }
};

export const addSale = async (groupId: string, productId: string, saleData: { date: string; quantity: number; status: string }): Promise<Sale> => {
  try {
    console.log('➕ Adding sale...');
    
    const response = await axiosInstance.post(
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
    const response = await axiosInstance.patch(
      apiEndpoints.productSales(groupId, productId, saleId), 
      saleData, 
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('❌ Update sale error:', error);
    throw error;
  }
};

export const deleteSale = async (groupId: string, productId: string, saleId: string): Promise<void> => {
  try {
    await axiosInstance.delete(apiEndpoints.productSales(groupId, productId, saleId));
    console.log('✅ Sale deleted successfully');
  } catch (error: any) {
    console.error('❌ Delete sale error:', error);
    throw error;
  }
};

// Additional helper functions you might need
export const getProductsByGroup = async (groupId: string): Promise<any[] | null> => {
  try {
    console.log(`📦 Fetching products for group ${groupId}...`);
    const response = await axiosInstance.get(apiEndpoints.product(groupId));
    console.log('✅ Products by group success');
    
    const data = response.data;
    return Array.isArray(data) ? data : data.data || data.products || [];
  } catch (error: any) {
    console.error(`❌ Products by group ${groupId} error:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return null;
  }
};

export const getSingleProduct = async (groupId: string, productId: string): Promise<any | null> => {
  try {
    console.log(`📦 Fetching product ${productId} from group ${groupId}...`);
    const response = await axiosInstance.get(apiEndpoints.product(groupId, productId));
    console.log('✅ Single product success');
    return response.data;
  } catch (error: any) {
    console.error(`❌ Single product error:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return null;
  }
};