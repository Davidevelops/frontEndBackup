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
      localStorage.setItem('token', token);
      console.log('✅ Token stored:', token.substring(0, 20) + '...');
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      console.log('✅ Token cleared from localStorage');
    }
    return { success: true };
  } catch (error: any) {
    throw error;
  }
};