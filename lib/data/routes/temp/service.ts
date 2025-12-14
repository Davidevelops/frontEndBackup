import axiosInstance from './axiosInstance';
import { apiEndpoints } from '@/lib/apiEndpoints';
import { ProductGroup, CreateProductGroupDto, UpdateProductGroupDto, SingleProduct, ApiResponse, ClassificationType, SafetyStockMethod } from '@/lib/types';

export class ProductGroupsApi {
  private endpoints = apiEndpoints;

  async getAll(): Promise<ProductGroup[]> {
    try {
      const response = await axiosInstance.get<any>(
        this.endpoints.productGroups()
      );
      
      const data = response.data;
      return this.extractProductGroups(data);
    } catch (error) {
      console.error('Error fetching product groups:', error);
      throw error;
    }
  }

  async getOne(groupId: string): Promise<ProductGroup> {
    try {
      const response = await axiosInstance.get<any>(
        this.endpoints.productGroups(groupId)
      );
      const data = response.data;
      return this.extractProductGroup(data);
    } catch (error) {
      console.error(`Error fetching product group ${groupId}:`, error);
      throw error;
    }
  }

  async getCount(): Promise<number> {
    try {
      const response = await axiosInstance.get<any>(
        this.endpoints.productGroupsCount()
      );
      
      const data = response.data;
      console.log('COUNT RESPONSE:', data);
      return this.extractCount(data);
    } catch (error) {
      console.error('Error fetching product groups count:', error);
      // Return 0 if the endpoint doesn't exist or fails
      return 0;
    }
  }

  async create(data: CreateProductGroupDto): Promise<ProductGroup> {
    try {
      console.log('Creating product group with data:', data);
      
      // Validate required fields
      if (!data.name || data.name.trim() === '') {
        throw new Error('Product group name is required');
      }
      
      // Prepare the request data
      const requestData: any = { name: data.name.trim() };
      
      // Only include setting if it's provided and valid
      if (data.setting) {
        // Validate classification
        if (data.setting.classification && !['fast', 'slow'].includes(data.setting.classification)) {
          throw new Error('Classification must be either "fast" or "slow"');
        }
        
        // Validate service level (0-100)
        if (data.setting.serviceLevel !== undefined && (data.setting.serviceLevel < 0 || data.setting.serviceLevel > 100)) {
          throw new Error('Service level must be between 0 and 100');
        }
        
        // Validate fill rate (0-100)
        if (data.setting.fillRate !== undefined && (data.setting.fillRate < 0 || data.setting.fillRate > 100)) {
          throw new Error('Fill rate must be between 0 and 100');
        }
        
        requestData.setting = {
          classification: data.setting.classification || 'fast',
          serviceLevel: data.setting.serviceLevel || 90,
          fillRate: data.setting.fillRate || 90,
          safetyStockCalculationMethod: data.setting.safetyStockCalculationMethod || 'dynamic'
        };
      }
      
      const response = await axiosInstance.post<any>(
        this.endpoints.productGroups(),
        requestData
      );
      
      const responseData = response.data;
      console.log('CREATE Response:', responseData);
      
      return this.extractProductGroup(responseData);
    } catch (error) {
      console.error('Error creating product group:', error);
      throw error;
    }
  }

  async update(groupId: string, data: UpdateProductGroupDto): Promise<ProductGroup> {
    try {
      const cleanGroupId = groupId.trim();
      const endpoint = this.endpoints.productGroups(cleanGroupId);
      
      console.log('UPDATE DETAILS:', {
        endpoint,
        method: 'PATCH',
        groupId: cleanGroupId,
        data
      });
      
      const response = await axiosInstance.patch<any>(endpoint, data);
      
      console.log('UPDATE RESPONSE:', {
        status: response.status,
        data: response.data
      });
      
      return this.extractProductGroup(response.data);
    } catch (error: any) {
      console.error(`UPDATE FAILED for group ${groupId}:`, error);
      
      if (error.response) {
        console.error('Error details:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw error;
    }
  }

  async archive(groupId: string): Promise<void> {
    try {
      // FIXED: Changed from productGroupArchive to productGroups (DELETE)
      await axiosInstance.delete(this.endpoints.productGroups(groupId));
      console.log(`Archived group ${groupId} successfully`);
    } catch (error) {
      console.error(`Error archiving product group ${groupId}:`, error);
      throw error;
    }
  }

  async unarchive(groupId: string): Promise<ProductGroup> {
    try {
      // FIXED: Changed from productGroupUnarchive to the correct endpoint
      const response = await axiosInstance.patch<any>(
        this.endpoints.productGroupUnarchive(groupId)
      );
      const responseData = response.data;
      return this.extractProductGroup(responseData);
    } catch (error) {
      console.error(`Error unarchiving product group ${groupId}:`, error);
      throw error;
    }
  }

  // NEW: Get products for a specific group
  async getProductsByGroup(groupId: string): Promise<SingleProduct[]> {
    try {
      console.log('Fetching products for group ID:', groupId);
      // FIXED: Ensure the endpoint is called correctly
      const endpoint = this.endpoints.product(groupId);
      console.log('API Endpoint:', endpoint);
      
      const response = await axiosInstance.get<any>(endpoint);
      
      const data = response.data;
      console.log('RAW PRODUCTS RESPONSE FOR GROUP', groupId, ':', data);
      const extracted = this.extractSingleProducts(data);
      console.log('EXTRACTED PRODUCTS:', extracted.length, 'products');
      return extracted;
    } catch (error: any) {
      console.error(`Error fetching products for group ${groupId}:`, error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      return [];
    }
  }

  // Helper method to extract count from various response formats
  private extractCount(data: any): number {
    if (!data) return 0;
    
    console.log('EXTRACTING COUNT FROM:', data);
    
    // If data is a number
    if (typeof data === 'number') {
      console.log('Direct number extraction:', data);
      return data;
    }
    
    // If data is a string that can be converted to a number
    if (typeof data === 'string' && !isNaN(Number(data))) {
      console.log('String to number conversion:', Number(data));
      return Number(data);
    }
    
    if (typeof data === 'object') {
      // FIRST: Check for the specific API response format: { "data": 2 }
      if (data.data !== undefined) {
        console.log('Found data property:', data.data);
        
        // If data.data is a number
        if (typeof data.data === 'number') {
          console.log('Extracted count from data.data (number):', data.data);
          return data.data;
        }
        
        // If data.data is a string that can be converted to a number
        if (typeof data.data === 'string' && !isNaN(Number(data.data))) {
          console.log('Extracted count from data.data (string):', Number(data.data));
          return Number(data.data);
        }
      }
      
      // SECOND: Check for other common formats
      const countProperties = ['count', 'total', 'totalCount', 'totalItems', 'numberOfItems', 'size', 'length'];
      
      for (const prop of countProperties) {
        const value = data[prop];
        if (value !== undefined) {
          console.log(`Checking property "${prop}":`, value);
          
          if (typeof value === 'number') {
            console.log(`Found count in property "${prop}":`, value);
            return value;
          }
          
          if (typeof value === 'string' && !isNaN(Number(value))) {
            console.log(`Found string count in property "${prop}":`, Number(value));
            return Number(value);
          }
        }
      }
      
      // THIRD: Check for nested structures
      if (data.success !== undefined && data.data !== undefined) {
        console.log('Found success wrapper, checking nested data');
        return this.extractCount(data.data);
      }
      
      // FOURTH: Check for message wrapper
      if (data.message && data.data) {
        console.log('Found message wrapper, checking nested data');
        return this.extractCount(data.data);
      }
    }
    
    console.warn('Could not extract count from response, returning 0. Data:', JSON.stringify(data, null, 2));
    return 0;
  }

  // Helper method to extract product groups from various response formats
  private extractProductGroups(data: any): ProductGroup[] {
    if (!data) return [];
    
    console.log('EXTRACTING PRODUCT GROUPS FROM:', data);
    
    if (Array.isArray(data)) {
      console.log('Direct array extraction');
      return data;
    }
    
    if (typeof data === 'object') {
      // Try different property names that might contain the array
      const arrayProperties = ['data', 'products', 'groups', 'items', 'result', 'content', 'list'];
      
      for (const prop of arrayProperties) {
        if (Array.isArray(data[prop])) {
          console.log(`Found array in property: ${prop}`);
          return data[prop];
        }
      }
      
      // If it's a single object but we need an array
      if (data.id && data.name) {
        console.log('Single object wrapped in array');
        return [data];
      }
      
      // Check for pagination structure
      if (data.items && Array.isArray(data.items)) {
        console.log('Found paginated items');
        return data.items;
      }
    }
    
    console.warn('Could not extract product groups from response:', data);
    return [];
  }

  // Helper method to extract a single product group from various response formats
  private extractProductGroup(data: any): ProductGroup {
    if (!data) {
      throw new Error('Empty response from server');
    }
    
    console.log('EXTRACTING SINGLE PRODUCT GROUP FROM:', data);
    
    // If data is already a ProductGroup with required fields
    if (data.id && data.name) {
      console.log('Direct extraction successful');
      return data;
    }
    
    // Check for common nested structures
    if (typeof data === 'object') {
      // Common API response patterns
      const possiblePaths = ['data', 'productGroup', 'group', 'item', 'result', 'response', 'body', 'product', 'resource'];
      
      for (const path of possiblePaths) {
        const nestedData = data[path];
        if (nestedData && nestedData.id && nestedData.name) {
          console.log(`Found in nested path: ${path}`);
          return nestedData;
        }
      }
      
      // Try to find any object with id and name in the response
      for (const key in data) {
        const value = data[key];
        if (value && typeof value === 'object' && value.id && value.name) {
          console.log(`Found in key: ${key}`);
          return value;
        }
      }
      
      // Check if the response has a success/error wrapper
      if (data.success !== undefined && data.data && data.data.id && data.data.name) {
        console.log('Found in success wrapper');
        return data.data;
      }
      
      // Check for message wrapper
      if (data.message && data.data && data.data.id && data.data.name) {
        console.log('Found in message wrapper');
        return data.data;
      }
    }
    
    // If we can't extract a proper ProductGroup, log the full structure
    console.warn('Could not extract proper product group structure. Raw data:', JSON.stringify(data, null, 2));
    
    // Try to extract what we can
    const extractedGroup: ProductGroup = {
      id: data.id || String(Date.now()),
      name: data.name || 'Unknown',
      accountId: data.accountId || '',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      deletedAt: data.deletedAt || null,
      productCategoryId: data.productCategoryId || null,
      products: data.products || []
    };
    
    // Add setting if it exists
    if (data.setting) {
      extractedGroup.setting = data.setting;
    }
    
    console.log('Fallback extraction:', extractedGroup);
    return extractedGroup;
  }

  // Helper method to extract SingleProduct[] from response
  private extractSingleProducts(data: any): SingleProduct[] {
    if (!data) return [];
    
    console.log('EXTRACTING SINGLE PRODUCTS FROM:', data);
    
    if (Array.isArray(data)) {
      console.log('Direct array extraction for single products');
      return data;
    }
    
    if (typeof data === 'object') {
      // Try different property names
      const arrayProperties = ['data', 'products', 'items', 'result', 'content', 'list'];
      
      for (const prop of arrayProperties) {
        if (Array.isArray(data[prop])) {
          console.log(`Found products array in property: ${prop}`);
          return data[prop];
        }
      }
      
      // If it's a single product but we need an array
      if (data.id && data.name) {
        console.log('Single product wrapped in array');
        return [data];
      }
    }
    
    console.warn('Could not extract single products from response:', data);
    return [];
  }

  // Optional: Debug method to check what the backend returns
  async debugResponse(groupId: string): Promise<void> {
    try {
      const endpoint = this.endpoints.productGroups(groupId);
      console.log('DEBUG: Testing endpoint:', endpoint);
      
      const response = await axiosInstance.get(endpoint);
      console.log('DEBUG: Response structure:', {
        status: response.status,
        headers: response.headers,
        data: response.data,
        fullResponse: response
      });
      
      // Test extraction
      const extracted = this.extractProductGroup(response.data);
      console.log('DEBUG: Extracted product group:', extracted);
    } catch (error) {
      console.error('DEBUG: Error:', error);
    }
  }
}

// Export instance for convenience
export const productGroupsApi = new ProductGroupsApi();

// Use export type for type-only exports
export type { CreateProductGroupDto, UpdateProductGroupDto };