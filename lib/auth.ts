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

// NEW: Helper function to set token in both localStorage and cookies
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    // Also set as cookie for middleware access
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
    console.log('✅ Token set in localStorage and cookies');
  }
};

// NEW: Helper to remove token
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
      // UPDATED: Use the new helper function
      setAuthToken(token);
      console.log('✅ Token stored in localStorage and cookies');
    } else {
      console.warn('⚠️ No token found in response');
      console.log('📊 Response structure:', Object.keys(response.data));
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
    // UPDATED: Use the new helper function
    removeAuthToken();
    return { success: true };
  } catch (error: any) {
    throw error;
  }
};