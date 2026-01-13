// src/services/api.js
// Enhanced API service dengan logging dan error handling yang lebih baik

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const api = axios.create({
  baseURL: 'http://10.0.2.2:5000/api',
  timeout: 10000, // 10 detik timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }

    // Log request untuk debugging
    console.log('🌐 API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      params: config.params,
      hasAuth: !!config.headers.Authorization,
    });

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Log response untuk debugging
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      dataSize: JSON.stringify(response.data).length,
    });
    return response;
  },
  async (error) => {
    // Log error untuk debugging dengan detail lebih lengkap
    const errorInfo = {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
    };
    
    console.error('❌ API Error:', errorInfo);

    // Handle network errors
    if (error.message === 'Network Error' || !error.response) {
      console.error('🔌 Network Error: Pastikan backend sedang berjalan di ' + api.defaults.baseURL);
      console.error('💡 Tip: Untuk emulator Android, gunakan http://10.0.2.2:5000');
      console.error('💡 Tip: Untuk device fisik, gunakan IP lokal komputer (e.g., http://192.168.x.x:5000)');
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout: Server tidak merespon dalam waktu yang ditentukan (10s)');
    }
    
    // Handle specific HTTP status codes
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        console.error('🔍 404 Not Found: Endpoint tidak ditemukan -', error.config?.url);
      } else if (status === 401) {
        console.error('🔒 401 Unauthorized: Token tidak valid atau expired');
      } else if (status === 403) {
        console.error('🚫 403 Forbidden: Akses ditolak');
      } else if (status >= 500) {
        console.error('🔥 Server Error:', status, '-', error.response.statusText);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
