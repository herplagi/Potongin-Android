# Dokumentasi Perbaikan Error Endpoint `/bookings/upcoming`

## 📋 Ringkasan Masalah

Aplikasi Android mengalami error "tidak ditemukan" (404) saat mencoba mengakses endpoint `/bookings/upcoming` dari backend. Error ini menyebabkan aplikasi tidak dapat menampilkan informasi booking yang akan datang di homepage.

## 🔧 Solusi yang Diimplementasikan

### 1. **Dibuat Service Layer Baru: `bookingService.js`**

File: `src/services/bookingService.js`

Service layer ini mengentralisasi semua panggilan API terkait booking dengan fitur:

#### ✅ **Error Handling yang Lebih Baik**
- Menangani berbagai status code HTTP (404, 401, 403, 500+)
- Memberikan pesan error yang informatif untuk setiap kasus
- Graceful fallback untuk endpoint yang optional (seperti upcoming booking)

#### ✅ **Logging yang Detail**
- Log setiap request dengan emoji untuk mudah dibaca
- Log response dengan ukuran data
- Log error dengan informasi lengkap (status, message, endpoint)

#### ✅ **Validasi Response**
- Validasi status code response
- Validasi format data yang diterima
- Handling untuk array maupun object response

#### 📝 **Fungsi yang Tersedia**

```javascript
// 1. Get Upcoming Booking
export const getUpcomingBooking = async ()

// 2. Get All User's Bookings  
export const getMyBookings = async ()

// 3. Check Availability
export const checkAvailability = async (params)

// 4. Create Booking
export const createBooking = async (bookingData)
```

### 2. **Enhanced Logging di `api.js`**

File: `src/services/api.js`

Peningkatan interceptor untuk logging yang lebih baik:

#### Request Interceptor:
- Log URL lengkap dengan baseURL
- Log method HTTP
- Log query parameters
- Indikator apakah request memiliki token authorization

#### Response Interceptor:
- Log status code response
- Log ukuran data yang diterima
- Detail error handling untuk berbagai kasus:
  - **Network Error**: Tips untuk cek backend dan konfigurasi URL
  - **Timeout**: Informasi timeout duration
  - **404**: Endpoint tidak ditemukan
  - **401/403**: Masalah authentication
  - **500+**: Server error

#### Tips yang Ditampilkan:
```
🔌 Network Error: Pastikan backend sedang berjalan di http://10.0.2.2:5000
💡 Tip: Untuk emulator Android, gunakan http://10.0.2.2:5000
💡 Tip: Untuk device fisik, gunakan IP lokal komputer (e.g., http://192.168.x.x:5000)
```

### 3. **Refactor HomePage.js**

File: `src/screens/HomePage.js`

Perubahan:
- Import `getUpcomingBooking` dari bookingService
- Improved error handling untuk upcoming booking
- Lebih informatif logging
- Alert hanya untuk error authentication (agar user tidak terganggu jika tidak ada upcoming booking)

```javascript
const fetchUpcomingBooking = useCallback(async () => {
  try {
    const booking = await getUpcomingBooking();
    if (booking) {
      setUpcomingBooking(booking);
      console.log('✅ Upcoming booking berhasil dimuat');
    } else {
      console.log('ℹ️ Tidak ada upcoming booking');
      setUpcomingBooking(null);
    }
  } catch (error) {
    console.error('⚠️ Error saat mengambil upcoming booking:', error.message);
    setUpcomingBooking(null);
    
    // Alert hanya untuk masalah autentikasi
    if (error.message.includes('login')) {
      Alert.alert('Sesi Berakhir', error.message);
    }
  }
}, []);
```

### 4. **Refactor HistoryPage.js**

File: `src/screens/HistoryPage.js`

Perubahan:
- Import `getMyBookings` dari bookingService
- Improved error handling dengan message yang lebih jelas
- Menggunakan useCallback untuk menghindari linting errors
- Consistent error logging

### 5. **Refactor BookingPage.js**

File: `src/screens/BookingPage.js`

Perubahan:
- Import `checkAvailability` dan `createBooking` dari bookingService
- Remove unused `api` import
- Improved error messages
- Menggunakan useCallback untuk fetchAvailability
- Fix React Hook dependencies

## 🎯 Manfaat Perbaikan

### 1. **Debugging yang Lebih Mudah**
- Log yang terstruktur dan mudah dibaca dengan emoji
- Informasi lengkap untuk setiap error
- Tips troubleshooting langsung di console

### 2. **Error Handling yang Lebih Baik**
- User mendapat pesan error yang jelas dan informatif
- Graceful fallback untuk fitur optional
- Handling khusus untuk berbagai jenis error

### 3. **Validasi Endpoint Backend**
Dengan logging yang detail, developer dapat:
- Melihat apakah endpoint tersedia di backend
- Validasi URL connection dengan mudah
- Identify masalah network atau configuration

### 4. **Format Data yang Konsisten**
- Service layer memastikan format data yang konsisten
- Validasi response sebelum digunakan
- Handling untuk berbagai format response

### 5. **Kode yang Lebih Maintainable**
- Centralized API logic
- Reusable functions
- Better separation of concerns
- Comprehensive documentation

## 📊 Status Code Handling

| Status Code | Handling | User Message |
|-------------|----------|--------------|
| 200/201 | ✅ Success | - |
| 404 | ⚠️ Return null untuk optional endpoints | - |
| 401/403 | ❌ Throw error | "Sesi Anda telah berakhir. Silakan login kembali." |
| 500+ | ❌ Throw error | "Terjadi kesalahan di server. Silakan coba lagi nanti." |
| Network Error | ❌ Throw error | "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan dan URL benar." |
| Timeout | ❌ Throw error | "Request timeout" |

## 🔍 Debugging Guide

### Jika Endpoint 404:

1. **Cek Backend**:
   ```bash
   # Pastikan backend berjalan di port 5000
   curl http://localhost:5000/api/bookings/upcoming
   ```

2. **Cek Logs di Android**:
   ```
   🌐 API Request: {
     method: 'GET',
     url: 'http://10.0.2.2:5000/api/bookings/upcoming',
     hasAuth: true
   }
   
   ❌ API Error: {
     status: 404,
     message: 'Endpoint tidak ditemukan'
   }
   
   🔍 404 Not Found: Endpoint tidak ditemukan - /bookings/upcoming
   ```

3. **Verifikasi Endpoint di Backend**:
   - Cek apakah route `/bookings/upcoming` sudah diimplementasikan
   - Cek apakah route terdaftar di router
   - Cek apakah middleware authentication berfungsi

### Jika Network Error:

1. **Cek Backend Running**:
   ```bash
   netstat -an | grep 5000
   ```

2. **Cek Firewall**:
   - Pastikan port 5000 tidak diblok

3. **Cek URL Configuration**:
   - Emulator Android: `http://10.0.2.2:5000`
   - Device Fisik: `http://192.168.x.x:5000` (IP lokal komputer)

### Jika Auth Error:

1. **Cek Token**:
   - Token tersimpan di AsyncStorage?
   - Token format Bearer valid?
   - Token belum expired?

## 📝 Catatan untuk Backend Developer

Untuk menyelesaikan issue ini sepenuhnya, backend perlu:

1. **Implementasi Endpoint `/bookings/upcoming`**:
   ```javascript
   // GET /api/bookings/upcoming
   // Return: Array of upcoming bookings atau single booking object
   router.get('/bookings/upcoming', authMiddleware, async (req, res) => {
     // Query booking yang statusnya 'confirmed' atau 'pending_payment'
     // Dan waktu booking masih di masa depan
     // Urutkan berdasarkan waktu booking terdekat
     // Return booking paling dekat
   });
   ```

2. **Validasi Response Format**:
   - Return array: `[{ booking_id, barbershop_id, ... }]`
   - Atau object: `{ booking_id, barbershop_id, ... }`
   - Atau empty array jika tidak ada: `[]`

3. **Error Handling**:
   - 200: Success dengan data
   - 404: Tidak ada upcoming booking (atau return empty array)
   - 401: Unauthorized
   - 500: Server error

## ✅ Testing

### Manual Testing Steps:

1. **Test Upcoming Booking**:
   - Buka aplikasi
   - Login dengan user yang memiliki booking
   - Cek homepage apakah menampilkan upcoming booking card
   - Cek console logs untuk memastikan API call berhasil

2. **Test Error Handling**:
   - Matikan backend
   - Buka aplikasi
   - Cek apakah error message informatif
   - Cek console logs untuk tips troubleshooting

3. **Test Booking Flow**:
   - Buat booking baru
   - Cek apakah semua API calls menggunakan service baru
   - Cek error handling jika ada masalah

### Expected Console Logs:

**Success Case**:
```
🌐 API Request: { method: 'GET', url: 'http://10.0.2.2:5000/api/bookings/upcoming', hasAuth: true }
📞 Memanggil GET /bookings/upcoming
✅ API Response: { status: 200, url: '/bookings/upcoming', dataSize: 425 }
✅ Upcoming booking ditemukan: { booking_id: 123, ... }
✅ Upcoming booking berhasil dimuat
```

**No Data Case**:
```
🌐 API Request: { method: 'GET', url: 'http://10.0.2.2:5000/api/bookings/upcoming', hasAuth: true }
📞 Memanggil GET /bookings/upcoming
✅ API Response: { status: 200, url: '/bookings/upcoming', dataSize: 2 }
ℹ️ Response data kosong dari /bookings/upcoming
ℹ️ Tidak ada upcoming booking
```

**404 Error Case**:
```
🌐 API Request: { method: 'GET', url: 'http://10.0.2.2:5000/api/bookings/upcoming', hasAuth: true }
📞 Memanggil GET /bookings/upcoming
❌ API Error: { status: 404, url: '/bookings/upcoming', message: 'Not Found' }
🔍 404 Not Found: Endpoint tidak ditemukan - /bookings/upcoming
⚠️ Endpoint /bookings/upcoming tidak ditemukan atau tidak ada data. Pastikan backend sudah mengimplementasikan endpoint ini.
ℹ️ Tidak ada upcoming booking
```

## 🚀 Next Steps

1. **Backend Team**: Implementasi endpoint `/bookings/upcoming`
2. **Test**: Test integrasi setelah backend ready
3. **Monitor**: Monitor logs untuk memastikan tidak ada error
4. **Documentation**: Update API documentation

## 📚 Referensi

- Backend Repository: https://github.com/herplagi/Potongin-Backend
- Android Emulator Network Setup: https://developer.android.com/studio/run/emulator-networking
- Axios Error Handling: https://axios-http.com/docs/handling_errors
