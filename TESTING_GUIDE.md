# Testing Guide untuk Fix Endpoint `/bookings/upcoming`

## 🧪 Manual Testing Steps

### Prerequisite
1. Backend harus berjalan di `http://localhost:5000`
2. Android emulator atau device fisik sudah terpasang
3. Node modules sudah terinstall (`npm install`)

### Test Case 1: Happy Path - Endpoint Tersedia

**Setup:**
```bash
# Pastikan backend running
curl http://localhost:5000/api/bookings/upcoming
# Expected: 200 OK dengan data booking atau empty array
```

**Steps:**
1. Jalankan aplikasi Android: `npm run android`
2. Login dengan user yang memiliki booking
3. Buka Home page
4. Perhatikan console logs

**Expected Result:**
```
🌐 API Request: { method: 'GET', url: 'http://10.0.2.2:5000/api/bookings/upcoming', hasAuth: true }
📞 Memanggil GET /bookings/upcoming
✅ API Response: { status: 200, url: '/bookings/upcoming', dataSize: 425 }
✅ Upcoming booking ditemukan: { booking_id: 123, ... }
✅ Upcoming booking berhasil dimuat
```

**Visual:**
- Upcoming booking card ditampilkan di home page
- Tidak ada error alert

---

### Test Case 2: No Upcoming Booking

**Setup:**
```bash
# Backend returns empty array
```

**Steps:**
1. Login dengan user yang tidak memiliki upcoming booking
2. Buka Home page

**Expected Result:**
```
🌐 API Request: { method: 'GET', url: 'http://10.0.2.2:5000/api/bookings/upcoming', hasAuth: true }
📞 Memanggil GET /bookings/upcoming
✅ API Response: { status: 200, url: '/bookings/upcoming', dataSize: 2 }
ℹ️ Response data kosong dari /bookings/upcoming
ℹ️ Tidak ada upcoming booking
```

**Visual:**
- Home page tampil normal tanpa upcoming booking card
- Tidak ada error alert

---

### Test Case 3: Endpoint 404 Not Found

**Setup:**
```bash
# Backend belum implement endpoint atau endpoint tidak ada
```

**Steps:**
1. Matikan backend atau pastikan endpoint belum tersedia
2. Jalankan aplikasi
3. Login
4. Buka Home page

**Expected Result:**
```
🌐 API Request: { method: 'GET', url: 'http://10.0.2.2:5000/api/bookings/upcoming', hasAuth: true }
📞 Memanggil GET /bookings/upcoming
❌ API Error: { status: 404, url: '/bookings/upcoming', message: 'Not Found' }
🔍 404 Not Found: Endpoint tidak ditemukan - /bookings/upcoming
❌ Error dari server: { status: 404, message: 'Not Found', endpoint: '/bookings/upcoming' }
⚠️ Endpoint /bookings/upcoming tidak ditemukan atau tidak ada data. 
   Pastikan backend sudah mengimplementasikan endpoint ini.
ℹ️ Tidak ada upcoming booking
⚠️ Error saat mengambil upcoming booking: ...
```

**Visual:**
- Home page tampil normal tanpa upcoming booking card
- Tidak ada error alert (graceful degradation)
- Error hanya di console untuk debugging

---

### Test Case 4: Network Error

**Setup:**
```bash
# Matikan backend
```

**Steps:**
1. Stop backend server
2. Jalankan aplikasi
3. Login
4. Buka Home page

**Expected Result:**
```
🌐 API Request: { method: 'GET', url: 'http://10.0.2.2:5000/api/bookings/upcoming', hasAuth: true }
📞 Memanggil GET /bookings/upcoming
❌ API Error: { message: 'Network Error', url: '/bookings/upcoming', baseURL: 'http://10.0.2.2:5000/api' }
🔌 Network Error: Pastikan backend sedang berjalan di http://10.0.2.2:5000/api
💡 Tip: Untuk emulator Android, gunakan http://10.0.2.2:5000
💡 Tip: Untuk device fisik, gunakan IP lokal komputer (e.g., http://192.168.x.x:5000)
❌ Tidak ada response dari server: { message: 'Network Error', endpoint: '/bookings/upcoming', baseURL: 'http://10.0.2.2:5000/api' }
⚠️ Error saat mengambil upcoming booking: Tidak dapat terhubung ke server. 
   Pastikan backend sedang berjalan dan URL benar.
```

**Visual:**
- Home page tampil normal tanpa upcoming booking card
- Tidak ada error alert untuk network error (optional feature)

---

### Test Case 5: Authentication Error (401)

**Setup:**
```bash
# Token expired atau tidak valid
```

**Steps:**
1. Hapus atau corrupt token di AsyncStorage
2. Buka Home page

**Expected Result:**
```
🌐 API Request: { method: 'GET', url: 'http://10.0.2.2:5000/api/bookings/upcoming', hasAuth: false }
📞 Memanggil GET /bookings/upcoming
❌ API Error: { status: 401, message: 'Unauthorized' }
🔒 401 Unauthorized: Token tidak valid atau expired
🔒 Unauthorized: Token mungkin expired atau tidak valid
⚠️ Error saat mengambil upcoming booking: Sesi Anda telah berakhir. Silakan login kembali.
```

**Visual:**
- Alert muncul: "Sesi Berakhir - Sesi Anda telah berakhir. Silakan login kembali."
- User diminta login kembali

---

### Test Case 6: Booking Flow

**Steps:**
1. Pilih barbershop
2. Pilih service
3. Pilih tanggal dan waktu
4. Pilih staff (optional)
5. Submit booking

**Expected Result:**
- Booking berhasil dibuat
- Payment redirect URL diterima
- Alert konfirmasi muncul
- Console logs menunjukkan:
  ```
  📞 Memanggil POST /bookings
  ✅ Booking berhasil dibuat: { booking_id: 456, ... }
  ```

**Test Error Cases:**
- Invalid date/time: Error message muncul
- Staff tidak tersedia: Sistem update availability
- Network error: Error message informatif

---

### Test Case 7: History Page

**Steps:**
1. Buka History/Riwayat page
2. Lihat daftar booking

**Expected Result:**
```
📞 Memanggil GET /bookings/my-bookings
✅ API Response: { status: 200, url: '/bookings/my-bookings' }
✅ Berhasil mengambil 5 booking
```

**Visual:**
- Daftar booking ditampilkan
- Filter (All/Ongoing/Completed) berfungsi
- Pull-to-refresh works

---

## 🔍 Debug Checklist

### Jika Endpoint 404:
- [ ] Backend running?
  ```bash
  netstat -an | grep 5000
  ```
- [ ] Endpoint implemented di backend?
  ```bash
  curl http://localhost:5000/api/bookings/upcoming
  ```
- [ ] Route terdaftar di backend router?
- [ ] Middleware authentication berfungsi?

### Jika Network Error:
- [ ] Backend URL benar?
  - Emulator: `http://10.0.2.2:5000`
  - Physical device: `http://192.168.x.x:5000` (IP lokal)
- [ ] Firewall tidak blocking port 5000?
- [ ] Backend accessible dari emulator/device?

### Jika Auth Error:
- [ ] Token tersimpan di AsyncStorage?
- [ ] Token format Bearer valid?
- [ ] Token belum expired?
- [ ] Backend middleware authentication berfungsi?

---

## 📊 Checklist Sebelum Merge

- [ ] Semua test cases passed
- [ ] No console errors (except expected ones)
- [ ] Linter passed
- [ ] Code review approved
- [ ] Documentation complete
- [ ] Backend endpoint status verified
- [ ] Network configuration tested (emulator + device)

---

## 🚀 Next Steps

### Untuk Backend Team:
1. Implement endpoint `/bookings/upcoming`:
   ```javascript
   // GET /api/bookings/upcoming
   // Query: upcoming bookings dengan status confirmed/pending_payment
   // Sort: by booking_time ascending (terdekat di depan)
   // Return: Array atau single object
   ```

2. Test endpoint:
   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:5000/api/bookings/upcoming
   ```

3. Verify response format:
   ```json
   [
     {
       "booking_id": 123,
       "barbershop_id": 1,
       "service_id": 2,
       "booking_time": "2024-01-20T10:00:00",
       "status": "confirmed",
       ...
     }
   ]
   ```

### Untuk Android Team:
1. Test dengan backend yang sudah implement endpoint
2. Verify semua console logs sesuai expected
3. Test di emulator dan device fisik
4. Monitor error logs di production
5. Update error handling jika diperlukan

---

## 📝 Notes

- Upcoming booking adalah **optional feature** - app harus tetap berfungsi normal jika endpoint belum ready
- Error handling di design untuk **graceful degradation** - user tidak terganggu dengan error alerts kecuali critical (auth)
- Logging extensive untuk **debugging purposes** - memudahkan diagnose masalah koneksi backend
- Service layer pattern memudahkan **maintenance dan testing** di masa depan
