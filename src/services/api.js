// src/services/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ganti dengan IP komputer Anda atau gunakan ngrok untuk testing
// Untuk emulator Android: 10.0.2.2
// Untuk device fisik: gunakan IP lokal komputer (misal: 192.168.1.100)
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
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor untuk error handling
api.interceptors.response.use(
  (response) => {
    // Log response untuk debugging
    console.log('API Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    // Log error untuk debugging
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network Error: Pastikan backend sedang berjalan dan URL benar');
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request Timeout: Server tidak merespon dalam waktu yang ditentukan');
    }

    return Promise.reject(error);
  }
);

export default api;
