// axiosConfig.ts - UPDATED VERSION
import axios from 'axios';

// Make sure this matches your .env file
const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://inventorypro.local/api';

console.log('🔧 Axios baseURL configured as:', baseURL);

const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

apiClient.interceptors.request.use(
  (config) => {
    console.log('📡 Making API request to:', `${config.baseURL}${config.url}`);
    console.log('📡 Full URL:', config.url);
    
    // For development debugging
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request');
      } else {
        console.log('⚠️ No token found in localStorage');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response from:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      baseURL: error.config?.baseURL,
      url: error.config?.url,
      fullURL: error.config?.baseURL + error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.config?.headers,
    });
    
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing storage');
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;