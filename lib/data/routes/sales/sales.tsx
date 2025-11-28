import apiClient from "@/lib/axiosConfig";
import { apiEndpoints } from "@/lib/apiEndpoints";
import { Sale } from "@/lib/types";

export const getSales = async (): Promise<Sale[] | null> => {
  try {
    const res = await apiClient.get(apiEndpoints.sales());
    return res.data.data;
  } catch (error) {
    console.error("Error fetching sales:", error);
    return null;
  }
};