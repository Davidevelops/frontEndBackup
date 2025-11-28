import { apiEndpoints } from "@/lib/apiEndpoints";
import apiClient from "@/lib/axisoConfig";

export interface ImportResult {
  success?: boolean;
  groupsCreated?: number;
  groupsUpdated?: number;
  groupsArchived?: number;
  productsCreated?: number;
  productsUpdated?: number;
  productsArchived?: number;
  errors?: Array<{
    row: number;
    message: string;
  }>;
  message?: string;
}

export interface ExportProductsParams {
  includeArchived?: boolean;
}

export interface ExportSalesParams {
  productId?: string;
  includeArchived?: boolean;
}

export const exportProductsTemplate = async (params?: ExportProductsParams): Promise<Blob | null> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.includeArchived) {
      queryParams.append("include_archived", "true");
    }

    const url = `${apiEndpoints.excelProducts()}/export${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await apiClient.get(url, { responseType: "blob" });
    return response.data;
  } catch (error) {
    console.error("Error while exporting products template: ", error);
    return null;
  }
};

export const importProducts = async (file: File): Promise<ImportResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(`${apiEndpoints.excelProducts()}/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
      validateStatus: (status) => status < 500,
    });

    if (response.status >= 400) {
      throw new Error(response.data?.error || response.data?.message || `Import failed with status ${response.status}`);
    }

    return response.data;
  } catch (error: any) {
    console.error("Error while importing products: ", error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.message || "Import failed");
    }
    if (error.request) {
      throw new Error("Network error - please check your connection");
    }
    throw new Error(error.message || "Import failed");
  }
};

export const exportSalesTemplate = async (params?: ExportSalesParams): Promise<Blob | null> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.productId) {
      queryParams.append("product_id", params.productId);
    }
    if (params?.includeArchived) {
      queryParams.append("include_archived", "true");
    }

    const url = `${apiEndpoints.excelSales()}/export${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await apiClient.get(url, { responseType: "blob" });
    return response.data;
  } catch (error) {
    console.error("Error while exporting sales template: ", error);
    return null;
  }
};

export const importSales = async (file: File): Promise<ImportResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(`${apiEndpoints.excelSales()}/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error while importing sales: ", error);
    throw error;
  }
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};