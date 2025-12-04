import axiosInstance from './axiosInstance';
import { apiEndpoints } from '@/lib/apiEndpoints';
import { ProductGroup, CreateProductGroupDto, UpdateProductGroupDto, ApiResponse, ClassificationType, SafetyStockMethod } from '@/lib/types';

export class ProductGroupsApi {
  private endpoints = apiEndpoints;

  async getAll(): Promise<ProductGroup[]> {
    try {
      const response = await axiosInstance.get<any>(
        this.endpoints.productGroup()
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
        this.endpoints.productGroup(groupId)
      );
      const data = response.data;
      return this.extractProductGroup(data);
    } catch (error) {
      console.error(`Error fetching product group ${groupId}:`, error);
      throw error;
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
        this.endpoints.productGroup(),
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
      const response = await axiosInstance.put<any>(
        this.endpoints.productGroup(groupId),
        data
      );
      const responseData = response.data;
      return this.extractProductGroup(responseData);
    } catch (error) {
      console.error(`Error updating product group ${groupId}:`, error);
      throw error;
    }
  }

  async archive(groupId: string): Promise<void> {
    try {
      await axiosInstance.delete(this.endpoints.productGroupArchive(groupId));
      console.log(`Archived group ${groupId} successfully`);
    } catch (error) {
      console.error(`Error archiving product group ${groupId}:`, error);
      throw error;
    }
  }

  async unarchive(groupId: string): Promise<ProductGroup> {
    try {
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

  // Helper method to extract product groups from various response formats
  private extractProductGroups(data: any): ProductGroup[] {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      return data;
    }
    
    if (typeof data === 'object') {
      // Try different property names
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data.products)) {
        return data.products;
      }
      if (Array.isArray(data.groups)) {
        return data.groups;
      }
      if (Array.isArray(data.items)) {
        return data.items;
      }
      if (Array.isArray(data.result)) {
        return data.result;
      }
      
      // If it's a single object but we need an array
      if (data.id && data.name) {
        return [data];
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
    
    // If data is already a ProductGroup
    if (data.id && data.name) {
      return data;
    }
    
    // Check for nested structures
    if (typeof data === 'object') {
      // Try different nested property names
      const possiblePaths = ['data', 'productGroup', 'group', 'item', 'result', 'product'];
      
      for (const path of possiblePaths) {
        if (data[path] && data[path].id && data[path].name) {
          return data[path];
        }
      }
      
      // Try to find any object with id and name in the response
      for (const key in data) {
        if (data[key] && typeof data[key] === 'object' && 
            data[key].id && data[key].name) {
          return data[key];
        }
      }
    }
    
    // If we can't extract a proper ProductGroup, log the data
    console.warn('Could not extract proper product group. Raw data:', data);
    
    // Try to create a minimal ProductGroup from whatever data we have
    return {
      id: data.id || String(Date.now()),
      name: data.name || 'Unknown',
      accountId: data.accountId || '',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      deletedAt: data.deletedAt || null,
      productCategoryId: data.productCategoryId || null,
      products: data.products || []
    };
  }
}

// Export instance for convenience
export const productGroupsApi = new ProductGroupsApi();

// Use export type for type-only exports
export type { CreateProductGroupDto, UpdateProductGroupDto };