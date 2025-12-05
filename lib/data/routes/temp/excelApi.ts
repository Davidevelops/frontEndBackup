// lib/data/routes/excel/excel.ts
import axiosInstance from '@/lib/axiosConfig';

export interface ImportError {
  row?: number;
  message: string;
  field?: string;
  value?: any;
}

export interface ImportResult {
  success?: boolean;
  groupsCreated?: number;
  groupsUpdated?: number;
  groupsArchived?: number;
  productsCreated?: number;
  productsUpdated?: number;
  productsArchived?: number;
  errors?: ImportError[];
  message?: string;
  warning?: string;
  error?: string;
}

export interface ExportProductsParams {
  includeArchived?: boolean;
}

export interface ExportSalesParams {
  productId?: string;
  includeArchived?: boolean;
  dateRangeStart?: string; // ISO string
  dateRangeEnd?: string;   // ISO string
}

// Export Products Template
export const exportProductsTemplate = async (params?: ExportProductsParams): Promise<Blob | null> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.includeArchived) {
      queryParams.append("include_archived", "true");
    }

    const url = `/excel/products/export${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    
    console.log('Exporting products...', { url, params });
    
    const response = await axiosInstance.get(url, { 
      responseType: "blob",
      timeout: 60000, // 60 second timeout for large exports
    });

    if (!response.data || response.data.size === 0) {
      throw new Error("Export returned empty file");
    }

    console.log('Products export successful', { 
      size: response.data.size,
      type: response.data.type 
    });

    return response.data;
  } catch (error: any) {
    console.error("Error exporting products template: ", error);
    
    if (error.response?.status === 404) {
      throw new Error("No products found to export");
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("Export timeout - try again with fewer products");
    } else if (error.response?.status === 400) {
      throw new Error("Bad request - invalid export parameters");
    } else if (error.response?.status === 401) {
      throw new Error("Unauthorized - please log in again");
    } else if (error.response?.status === 403) {
      throw new Error("Access denied - insufficient permissions");
    } else if (error.response?.status === 500) {
      throw new Error("Server error - please try again later");
    } else if (error.message) {
      throw new Error(`Export failed: ${error.message}`);
    } else {
      throw new Error("Failed to export products - please check your connection");
    }
  }
};

// Export Sales Template
export const exportSalesTemplate = async (params?: ExportSalesParams): Promise<Blob | null> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.productId) {
      queryParams.append("productId", params.productId);
    }
    if (params?.includeArchived) {
      queryParams.append("includeArchived", "true");
    }
    if (params?.dateRangeStart) {
      queryParams.append("dateRangeStart", params.dateRangeStart);
    }
    if (params?.dateRangeEnd) {
      queryParams.append("dateRangeEnd", params.dateRangeEnd);
    }

    const url = `/excel/sales/export${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    
    console.log('Exporting sales...', { url, params });
    
    const response = await axiosInstance.get(url, { 
      responseType: "blob",
      timeout: 60000,
    });

    if (!response.data || response.data.size === 0) {
      console.warn('No sales data found to export');
      return null;
    }

    console.log('Sales export successful', { 
      size: response.data.size,
      type: response.data.type 
    });

    return response.data;
  } catch (error: any) {
    console.error("Error exporting sales template: ", error);
    
    if (error.response?.status === 404 || error.response?.data?.message?.includes("No sales found")) {
      console.log('ℹNo sales found in the specified range');
      return null;
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("Export timeout - try again with a smaller date range");
    } else if (error.response?.status === 400) {
      throw new Error("Invalid date range or parameters");
    } else if (error.response?.status === 401) {
      throw new Error("Unauthorized - please log in again");
    } else if (error.response?.status === 403) {
      throw new Error("Access denied - insufficient permissions");
    } else if (error.response?.status === 500) {
      throw new Error("Server error - please try again later");
    } else if (error.message) {
      throw new Error(`Export failed: ${error.message}`);
    } else {
      throw new Error("Failed to export sales - please check your connection");
    }
  }
};

// Import Products
export const importProducts = async (file: File): Promise<ImportResult> => {
  try {
    if (!file) {
      throw new Error("No file selected");
    }

    // Validate file
    if (!file.name.endsWith('.xlsx')) {
      throw new Error("Only .xlsx files are supported");
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error("File size must be less than 10MB");
    }

    console.log('importing products from file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(`/excel/products/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 second timeout for imports
    });

    console.log('Products import response:', {
      status: response.status,
      data: response.data
    });

    if (response.status >= 400) {
      const errorData = response.data as ImportResult;
      throw new Error(errorData.error || errorData.message || `Import failed with status ${response.status}`);
    }

    return response.data as ImportResult;
  } catch (error: any) {
    console.error("Error importing products: ", error);
    
    // Handle specific error cases
    if (error.response) {
      const errorData = error.response.data as ImportResult;
      
      if (error.response.status === 400) {
        throw new Error(errorData.error || "Invalid file format or structure");
      } else if (error.response.status === 401) {
        throw new Error("Unauthorized - please log in again");
      } else if (error.response.status === 413) {
        throw new Error("File too large - maximum size is 10MB");
      } else if (error.response.status === 415) {
        throw new Error("Unsupported file type - only Excel files are allowed");
      } else if (error.response.status === 422) {
        // Validation errors from the server
        const serverErrors = errorData.errors || [];
        if (serverErrors.length > 0) {
          const errorMessages = serverErrors.map(e => 
            e.row ? `Row ${e.row}: ${e.message}` : e.message
          ).join('; ');
          throw new Error(`Import validation failed: ${errorMessages}`);
        }
        throw new Error(errorData.error || "Import validation failed");
      } else if (error.response.status === 500) {
        throw new Error(errorData.error || "Server error during import");
      } else {
        throw new Error(errorData?.error || errorData?.message || "Import failed");
      }
    } else if (error.request) {
      throw new Error("No response from server - check your network connection");
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("Import timeout - try again with a smaller file");
    } else {
      throw new Error(error.message || "Failed to import products");
    }
  }
};

// Import Sales
export const importSales = async (file: File): Promise<ImportResult> => {
  try {
    if (!file) {
      throw new Error("No file selected");
    }

    // Validate file
    if (!file.name.endsWith('.xlsx')) {
      throw new Error("Only .xlsx files are supported");
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error("File size must be less than 10MB");
    }

    console.log('Importing sales from file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(`/excel/sales/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });

    console.log('Sales import response:', {
      status: response.status,
      data: response.data
    });

    if (response.status >= 400) {
      const errorData = response.data as ImportResult;
      throw new Error(errorData.error || errorData.message || `Import failed with status ${response.status}`);
    }

    return response.data as ImportResult;
  } catch (error: any) {
    console.error("Error importing sales: ", error);
    
    if (error.response) {
      const errorData = error.response.data as ImportResult;
      
      if (error.response.status === 400) {
        throw new Error(errorData.error || "Invalid file format or structure");
      } else if (error.response.status === 401) {
        throw new Error("Unauthorized - please log in again");
      } else if (error.response.status === 413) {
        throw new Error("File too large - maximum size is 10MB");
      } else if (error.response.status === 415) {
        throw new Error("Unsupported file type - only Excel files are allowed");
      } else if (error.response.status === 422) {
        const serverErrors = errorData.errors || [];
        if (serverErrors.length > 0) {
          const errorMessages = serverErrors.map(e => 
            e.row ? `Row ${e.row}: ${e.message}` : e.message
          ).join('; ');
          throw new Error(`Import validation failed: ${errorMessages}`);
        }
        throw new Error(errorData.error || "Import validation failed");
      } else if (error.response.status === 500) {
        throw new Error(errorData.error || "Server error during import");
      } else {
        throw new Error(errorData?.error || errorData?.message || "Import failed");
      }
    } else if (error.request) {
      throw new Error("No response from server - check your network connection");
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("Import timeout - try again with a smaller file");
    } else {
      throw new Error(error.message || "Failed to import sales");
    }
  }
};

// Utility function to download blob
export const downloadBlob = (blob: Blob, filename: string): void => {
  try {
    if (!blob || blob.size === 0) {
      throw new Error("Cannot download empty file");
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log('⬇File download initiated:', { filename, size: blob.size });
  } catch (error) {
    console.error("Error downloading file:", error);
    throw new Error("Failed to download file");
  }
};

// Helper function to validate Excel file before upload
export const validateExcelFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const validExtensions = ['.xlsx', '.xls'];
  const validMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream'
  ];

  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  
  if (!validExtensions.includes(fileExtension) && 
      !validMimeTypes.includes(file.type) && 
      file.type !== '') {
    return {
      isValid: false,
      error: "Only Excel files (.xlsx, .xls) are supported"
    };
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size must be less than 10MB"
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: "File is empty"
    };
  }

  return { isValid: true };
};

// Helper function to format import results for display
export const formatImportResults = (result: ImportResult): {
  success: boolean;
  title: string;
  message: string;
  details: string[];
} => {
  const details: string[] = [];
  
  // Add creation/update stats
  if (result.groupsCreated) details.push(`Groups created: ${result.groupsCreated}`);
  if (result.groupsUpdated) details.push(`Groups updated: ${result.groupsUpdated}`);
  if (result.productsCreated) details.push(`Products created: ${result.productsCreated}`);
  if (result.productsUpdated) details.push(`Products updated: ${result.productsUpdated}`);
  
  // Add error info
  if (result.errors && result.errors.length > 0) {
    details.push(`Errors found: ${result.errors.length}`);
    // Show first 3 errors as examples
    result.errors.slice(0, 3).forEach(error => {
      const errorText = error.row ? `Row ${error.row}: ${error.message}` : error.message;
      details.push(errorText);
    });
    if (result.errors.length > 3) {
      details.push(`... and ${result.errors.length - 3} more errors`);
    }
  }
  
  // Determine success status
  const hasErrors = result.errors && result.errors.length > 0;
  const hasChanges = result.groupsCreated || result.groupsUpdated || 
                     result.productsCreated || result.productsUpdated;
  
  let success = true;
  let title = "Import Successful";
  let message = "Data imported successfully";
  
  if (hasErrors && hasChanges) {
    success = true;
    title = "Import Partially Successful";
    message = "Data imported with some errors";
  } else if (hasErrors && !hasChanges) {
    success = false;
    title = "Import Failed";
    message = "No data was imported due to errors";
  } else if (!hasErrors && !hasChanges) {
    success = true;
    title = "Import Completed";
    message = "No changes were made - data already up to date";
  }
  
  // Use server message if available
  if (result.message) {
    message = result.message;
  }
  
  return {
    success,
    title,
    message,
    details
  };
};