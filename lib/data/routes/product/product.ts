import { apiEndpoints } from "@/lib/apiEndpoints";
import { ProductGroup, SalesResponse, Sale } from "@/lib/types";
import apiClient from "@/lib/axiosConfig";

export const getProductList = async (): Promise<ProductGroup[] | null> => {
  try {
    const response = await apiClient.get(apiEndpoints.productGroup());
    return response.data.data;
  } catch (error) {
    return null;
  }
};

export const getProductSales = async (groupId: string, productId: string): Promise<SalesResponse> => {
  try {
    const response = await apiClient.get(apiEndpoints.productSales(groupId, productId, undefined));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addSale = async (groupId: string, productId: string, saleData: { date: string; quantity: number; status: string }): Promise<Sale> => {
  try {
    const response = await apiClient.post(apiEndpoints.productSales(groupId, productId, undefined), saleData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const updateSale = async (groupId: string, productId: string, saleId: string, saleData: { date: string; quantity: number; status: string }): Promise<Sale> => {
  try {
    const response = await apiClient.patch(apiEndpoints.productSales(groupId, productId, saleId), saleData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
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