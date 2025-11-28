import { apiEndpoints } from "@/lib/apiEndpoints";
import apiClient from "@/lib/axisoConfig";

export interface Recommendation {
  coverageDays: number;
  id: string;
  leadTime: number;
  productId: string;
  restockAmount: number;
  restockAt: string;
  runsOutAt: string;
  status: "urgent" | "critical" | "warning" | "good";
  supplierId: string;
}

export interface RecommendationsResponse {
  data: Recommendation[];
}

export const getRecommendations = async (): Promise<Recommendation[] | null> => {
  try {
    const response = await apiClient.get<RecommendationsResponse>(apiEndpoints.recommendations());
    return response.data.data;
  } catch (error) {
    console.error("Error while getting recommendations: ", error);
    return null;
  }
};