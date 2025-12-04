import apiClient from "./axiosConfig";
import { apiEndpoints } from "@/lib/apiEndpoints";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Session {
  user: {
    id: string;
    username: string;
    role: string;
  };
}

// FIXED: Helper function to set token in both localStorage and cookies
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    // Set in localStorage
    localStorage.setItem('token', token);
    
    // FIXED: Set cookie properly for middleware access
    // Use document.cookie API with proper attributes
    const cookieValue = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    document.cookie = cookieValue;
    
    console.log('✅ Token set in localStorage and cookies:', token.substring(0, 20) + '...');
  }
};

// FIXED: Helper to remove token
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    // Clear cookie properly
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    console.log('✅ Token removed from localStorage and cookies');
  }
};

export const login = async (credentials: LoginCredentials) => {
  try {
    console.log('🔐 Login attempt to:', apiEndpoints.login());
    
    const response = await apiClient.post(apiEndpoints.login(), credentials, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log('📦 Full login response:', response.data);
    

    const token = 
      response.data.token || 
      response.data.access_token || 
      response.data.data?.token ||
      response.data.data?.access_token ||
      response.data.accessToken ||
      response.data.data?.accessToken;
    
    if (token) {
      // Set token in both localStorage and cookies
      setAuthToken(token);
      console.log('✅ Login successful, token stored');
    } else {
      console.warn('⚠️ No token found in response');
      console.log('📊 Response structure:', Object.keys(response.data));
      throw new Error('No authentication token received');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Login error:', {
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

export const getSession = async (): Promise<Session | null> => {
  try {
    const response = await apiClient.get(apiEndpoints.session());
    return response.data;
  } catch (error: any) {
    console.error("Error getting session:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    removeAuthToken();
    return { success: true };
  } catch (error: any) {
    throw error;
  }
};