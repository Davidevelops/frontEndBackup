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
    const response = await apiClient.post(apiEndpoints.login(), credentials, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
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
    // If your backend has a logout endpoint, use it here
    // const response = await apiClient.post(apiEndpoints.logout());
    // return response.data;
    
    // For now, just clear client-side state
    return { success: true };
  } catch (error: any) {
    throw error;
  }
};