// src/services/bookingService.js
// Service untuk menangani semua API calls terkait booking dengan error handling yang baik

import api from './api';

/**
 * Mengambil booking yang akan datang (upcoming)
 * Endpoint: GET /bookings/upcoming
 * 
 * @async
 * @returns {Promise<Object|null>} Booking object atau null jika tidak ada
 * @throws {Error} Jika terjadi kesalahan jaringan atau server error
 */
export const getUpcomingBooking = async () => {
  try {
    console.log('📞 Memanggil GET /bookings/upcoming');
    const response = await api.get('/bookings/upcoming');
    
    // Validasi response status
    if (response.status !== 200) {
      console.warn(`⚠️ Status tidak normal: ${response.status}`);
    }
    
    // Validasi data
    if (!response.data) {
      console.log('ℹ️ Response data kosong dari /bookings/upcoming');
      return null;
    }
    
    // Jika data adalah array dan ada data
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('✅ Upcoming booking ditemukan:', response.data[0]);
      return response.data[0];
    }
    
    // Jika data adalah object langsung
    if (typeof response.data === 'object' && !Array.isArray(response.data)) {
      console.log('✅ Upcoming booking ditemukan:', response.data);
      return response.data;
    }
    
    console.log('ℹ️ Tidak ada upcoming booking');
    return null;
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error('❌ Error dari server:', {
        status,
        message: data?.message || 'Unknown error',
        endpoint: '/bookings/upcoming',
      });
      
      // 404 berarti endpoint tidak ditemukan atau tidak ada data
      if (status === 404) {
        console.warn('⚠️ Endpoint /bookings/upcoming tidak ditemukan atau tidak ada data. Pastikan backend sudah mengimplementasikan endpoint ini.');
        return null; // Return null instead of throwing untuk optional upcoming booking
      }
      
      // 401/403 berarti unauthorized
      if (status === 401 || status === 403) {
        console.error('🔒 Unauthorized: Token mungkin expired atau tidak valid');
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }
      
      // Server error
      if (status >= 500) {
        console.error('🔥 Server error:', status);
        throw new Error('Terjadi kesalahan di server. Silakan coba lagi nanti.');
      }
      
      throw error;
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ Tidak ada response dari server:', {
        message: error.message,
        endpoint: '/bookings/upcoming',
        baseURL: api.defaults.baseURL,
      });
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend sedang berjalan dan URL benar.');
    } else {
      // Something else happened
      console.error('❌ Error tidak terduga:', error.message);
      throw error;
    }
  }
};

/**
 * Mengambil semua booking milik user
 * Endpoint: GET /bookings/my-bookings
 * 
 * @async
 * @returns {Promise<Array>} Array of booking objects
 * @throws {Error} Jika terjadi kesalahan
 */
export const getMyBookings = async () => {
  try {
    console.log('📞 Memanggil GET /bookings/my-bookings');
    const response = await api.get('/bookings/my-bookings');
    
    // Validasi response
    if (response.status !== 200) {
      console.warn(`⚠️ Status tidak normal: ${response.status}`);
    }
    
    const bookings = response.data || [];
    console.log(`✅ Berhasil mengambil ${bookings.length} booking`);
    return bookings;
  } catch (error) {
    console.error('❌ Error mengambil my-bookings:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
    }
    
    throw new Error('Gagal memuat riwayat booking. Silakan coba lagi.');
  }
};

/**
 * Cek ketersediaan staff dan waktu booking
 * Endpoint: GET /bookings/check-availability
 * 
 * @async
 * @param {Object} params - Query parameters
 * @param {string} params.barbershop_id - ID barbershop
 * @param {string} params.date - Tanggal booking (YYYY-MM-DD)
 * @param {string} [params.time] - Waktu booking (HH:MM) - optional
 * @returns {Promise<Object>} Availability data
 * @throws {Error} Jika terjadi kesalahan
 */
export const checkAvailability = async (params) => {
  try {
    console.log('📞 Memanggil GET /bookings/check-availability', params);
    const response = await api.get('/bookings/check-availability', { params });
    
    if (response.status !== 200) {
      console.warn(`⚠️ Status tidak normal: ${response.status}`);
    }
    
    console.log('✅ Data ketersediaan:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error cek ketersediaan:', {
      message: error.message,
      status: error.response?.status,
      params,
    });
    
    // Log error details but return empty availability as fallback
    console.warn('⚠️ Mengembalikan data ketersediaan kosong sebagai fallback');
    
    // Return empty availability on error
    return {
      unavailable_staff_ids: [],
      fully_booked_times: [],
    };
  }
};

/**
 * Membuat booking baru
 * Endpoint: POST /bookings
 * 
 * @async
 * @param {Object} bookingData - Data booking
 * @returns {Promise<Object>} Created booking object
 * @throws {Error} Jika terjadi kesalahan
 */
export const createBooking = async (bookingData) => {
  try {
    console.log('📞 Memanggil POST /bookings', bookingData);
    const response = await api.post('/bookings', bookingData);
    
    if (response.status !== 200 && response.status !== 201) {
      console.warn(`⚠️ Status tidak normal: ${response.status}`);
    }
    
    console.log('✅ Booking berhasil dibuat:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error membuat booking:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    if (error.response?.status === 400) {
      const message = error.response.data?.message || 'Data booking tidak valid';
      throw new Error(message);
    }
    
    if (error.response?.status === 409) {
      throw new Error('Waktu booking sudah tidak tersedia. Silakan pilih waktu lain.');
    }
    
    throw new Error('Gagal membuat booking. Silakan coba lagi.');
  }
};

export default {
  getUpcomingBooking,
  getMyBookings,
  checkAvailability,
  createBooking,
};
