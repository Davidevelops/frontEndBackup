import apiClient from "@/lib/axiosConfig";
import { apiEndpoints } from "@/lib/apiEndpoints";
import { ProductGroup } from "@/lib/types";

export interface ProductGroupSearchResponse {
  data: ProductGroup[];
  total?: number;
}

export const getProductGroups = async (
  searchTerm?: string,
  limit: number = 10,
  excludeAssignedToCategory?: string
): Promise<ProductGroupSearchResponse | null> => {
  try {
    const queryParams: Record<string, string | number> = {
      limit,
    };
    
    if (searchTerm) {
      queryParams.search = searchTerm;
    }
    
    // Add exclude parameter if we want to filter groups not assigned to a specific category
    if (excludeAssignedToCategory) {
      queryParams.excludeAssignedToCategory = excludeAssignedToCategory;
    }
    
    console.log("🔄 Fetching product groups with params:", queryParams);
    const res = await apiClient.get(apiEndpoints.productGroups(undefined, queryParams));
    console.log("✅ Product groups response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching product groups:", error);
    return null;
  }
};

export const getProductGroup = async (
  groupId: string
): Promise<ProductGroup | null> => {
  try {
    console.log("🔄 Fetching product group:", groupId);
    const res = await apiClient.get(apiEndpoints.productGroups(groupId));
    console.log("✅ Product group response:", res.data);
    return res.data.data || res.data;
  } catch (error) {
    console.error("❌ Error fetching product group:", error);
    return null;
  }
};

export const assignProductGroupToCategory = async (
  categoryId: string,
  groupId: string
): Promise<any | null> => {
  try {
    console.log("🔄 Assigning product group to category:", { categoryId, groupId });
    const res = await apiClient.post(apiEndpoints.categoryGroups(categoryId), {
      groupId
    });
    console.log("✅ Assign product group response:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error assigning product group:", error);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    throw new Error(errorMessage);
  }
};

export const removeProductGroupFromCategory = async (
  categoryId: string,
  groupId: string
): Promise<boolean> => {
  try {
    console.log("🔄 Removing product group from category:", { categoryId, groupId });
    await apiClient.delete(apiEndpoints.categoryGroups(categoryId, groupId));
    console.log("✅ Product group removed successfully");
    return true;
  } catch (error: any) {
    console.error("❌ Error removing product group:", error);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    throw new Error(errorMessage);
  }
};