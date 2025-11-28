import axios from 'axios';


const apiClient = axios.create({
  withCredentials: true, 
});


apiClient.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
     alert('Unauthorized, redirecting to login...');
    }
    return Promise.reject(error);
  }
);

export default apiClient;