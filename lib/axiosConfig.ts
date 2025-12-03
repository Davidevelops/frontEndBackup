import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  withCredentials: true, 
});


apiClient.interceptors.request.use(
  (config) => {
    console.log('📡 Making API request to:', config.url);
    

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
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response from:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;