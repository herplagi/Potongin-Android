// src/screens/BookingPage.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import api from '../services/api';

// --- TAMBAHKAN FUNGSI PEMBANTU ---
const generateTimeSlots = (start, end, intervalMinutes) => {
  const slots = [];
  let currentTime = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  while (currentTime < endTime) {
    slots.push(currentTime.toTimeString().substring(0, 5));
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
  }
  return slots;
};
// ----------------------------------

const BookingPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { service, barbershop } = route.params;

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk ketersediaan staff
  const [unavailableStaffIds, setUnavailableStaffIds] = useState([]);
  // State untuk waktu yang penuh (semua staff dibooking)
  const [fullyBookedTimes, setFullyBookedTimes] = useState([]);
  // State untuk loading indicator
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // --- TAMBAHKAN STATE UNTUK WAKTU SAAT INI ---
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  // ---------------------------------------------

  // --- TAMBAHKAN FUNGSI UTILITAS ---
  const isTimePassed = (dateString, timeString) => {
    if (!dateString || !timeString) return false;
    const selectedDateTime = new Date(`${dateString}T${timeString}:00+07:00`);
    if (selectedDateTime.toISOString().split('T')[0] === currentDateTime.toISOString().split('T')[0]) {
      return selectedDateTime < currentDateTime;
    }
    return false;
  };

  const isDateBeyondOneWeek = (dateString) => {
    if (!dateString) return false;
    const selectedDateObj = new Date(dateString);
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    return selectedDateObj > oneWeekFromNow;
  };
  // ---------------------------------

  // --- PERBARUI WAKTU SAAT INI SETIAP MENIT ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update setiap menit

    return () => clearInterval(timer);
  }, []);
  // --------------------------------------------

  // Fungsi untuk mengecek ketersediaan staff dan waktu penuh
  const fetchAvailability = async (date, time = null) => {
    if (!date) {
      setUnavailableStaffIds([]);
      setFullyBookedTimes([]);
      return;
    }

    setLoadingAvailability(true);
    try {
      const params = {
        barbershop_id: barbershop.barbershop_id,
        date: date,
      };
      if (time) {
        params.time = time;
      }

      const response = await api.get(`/bookings/check-availability`, { params });

      if (time) {
        console.log('🔍 Mengecek ketersediaan staff untuk waktu:', time);
        setUnavailableStaffIds(response.data.unavailable_staff_ids || []);
        if (selectedStaffId && (response.data.unavailable_staff_ids || []).includes(selectedStaffId)) {
             setSelectedStaffId(null);
        }
      } else {
        console.log('🔍 Mengecek waktu penuh untuk tanggal:', date);
        setFullyBookedTimes(response.data.fully_booked_times || []);
        setUnavailableStaffIds([]);
        setSelectedStaffId(null);
      }
    } catch (error) {
      console.error('Gagal cek ketersediaan:', error);
      if (time) {
         setUnavailableStaffIds([]);
      } else {
         setFullyBookedTimes([]);
      }
    } finally {
      setLoadingAvailability(false);
    }
  };

  // useEffect untuk memanggil fetchAvailability saat selectedDate berubah
  useEffect(() => {
    fetchAvailability(selectedDate, null);
  }, [selectedDate]);

  // useEffect untuk memanggil fetchAvailability saat selectedTime berubah
  useEffect(() => {
    if (selectedDate && selectedTime) {
        fetchAvailability(selectedDate, selectedTime);
    } else if (selectedDate && !selectedTime) {
        setUnavailableStaffIds([]);
        setSelectedStaffId(null);
    }
  }, [selectedDate, selectedTime]);

  // Memoized list of available times based on barbershop hours
  const availableTimes = useMemo(() => {
    try {
      const hoursObject =
        typeof barbershop.opening_hours === 'string'
          ? JSON.parse(barbershop.opening_hours)
          : barbershop.opening_hours;

      const dayOfWeek = new Date(selectedDate).toLocaleDateString('id-ID', {
        weekday: 'long',
      });
      const dayInfo = hoursObject[dayOfWeek];

      if (dayInfo && dayInfo.aktif) {
        return generateTimeSlots(dayInfo.buka, dayInfo.tutup, 60);
      }
    } catch (e) {
      console.error('Gagal parse jam buka:', e);
    }
    return [];
  }, [selectedDate, barbershop.opening_hours]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert(
        'Peringatan',
        'Silakan pilih tanggal dan waktu terlebih dahulu.',
      );
      return;
    }

    // --- TAMBAHKAN PENGECEKAN INI ---
    if (isDateBeyondOneWeek(selectedDate)) {
      Alert.alert('Tanggal Tidak Valid', 'Maaf, Anda hanya dapat memesan hingga 7 hari ke depan.');
      return;
    }
    // --- AKHIR PENAMBAHAN ---

    if (fullyBookedTimes.includes(selectedTime)) {
        Alert.alert('Waktu Tidak Tersedia', 'Maaf, waktu yang Anda pilih sudah penuh. Silakan pilih waktu lain.');
        return;
    }

    const bookingDateTime = `${selectedDate}T${selectedTime}:00`;

    const bookingDate = new Date(`${selectedDate}T${selectedTime}:00+07:00`);
    if (isNaN(bookingDate.getTime())) {
      Alert.alert('Error', 'Format tanggal tidak valid');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        barbershop_id: barbershop.barbershop_id,
        service_id: service.service_id,
        staff_id: selectedStaffId || undefined,
        booking_time: bookingDateTime,
      };

      console.log('📤 Sending booking data:', bookingData);

      const response = await api.post('/bookings', bookingData);
      console.log('📥 Booking response:', response.data);

      const { booking, payment } = response.data;

      if (!payment || !payment.redirect_url) {
        Alert.alert('Error', 'URL pembayaran tidak tersedia');
        return;
      }

      Alert.alert(
        '✅ Booking Berhasil!',
        `Booking ID: ${booking.booking_id}\n\nSilakan lanjutkan ke pembayaran.`,
        [
          {
            text: '💳 Bayar Sekarang',
            onPress: () => {
              navigation.navigate('PaymentWebView', {
                paymentUrl: payment.redirect_url,
                bookingId: booking.booking_id,
              });
            },
          },
          {
            text: '⏰ Bayar Nanti',
            onPress: () => {
              navigation.navigate('Main', { screen: 'Riwayat' });
            },
            style: 'cancel',
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      console.error('❌ Booking error:', error);
      console.error('Error response:', error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Terjadi kesalahan saat membuat booking.';

      Alert.alert('❌ Booking Gagal', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Ringkasan Pesanan */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.barbershopName}>{barbershop.name}</Text>
        <Text style={styles.servicePrice}>
          Rp {Number(service.price).toLocaleString('id-ID')}
        </Text>
      </View>

      {/* Pilih Tanggal */}
      <Text style={styles.sectionTitle}>1. Pilih Tanggal</Text>
      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#4F46E5' },
        }}
        minDate={new Date().toISOString().split('T')[0]}
        maxDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Batas 7 hari ke depan
        theme={{
          selectedDayBackgroundColor: '#4F46E5',
          todayTextColor: '#4F46E5',
          arrowColor: '#4F46E5',
          disabledDaysStyles: {
            backgroundColor: '#F8FAFC',
            color: '#94A3B8',
          },
        }}
      />

      {/* Indikator Loading Ketersediaan */}
      {loadingAvailability && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.loadingText}>Memeriksa ketersediaan...</Text>
        </View>
      )}

      {/* Pilih Kapster (Staff) */}
      {barbershop.staff && barbershop.staff.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            2. Pilih Tukang Cukur (Opsional)
          </Text>
          <View style={styles.staffContainer}>
            {barbershop.staff.map(staff => {
              const isUnavailable = unavailableStaffIds.includes(staff.staff_id);
              return (
                <TouchableOpacity
                  key={staff.staff_id}
                  style={[
                    styles.staffChip,
                    selectedStaffId === staff.staff_id && styles.staffChipSelected,
                    isUnavailable && styles.staffChipUnavailable,
                  ]}
                  onPress={() => {
                    if (!isUnavailable && !loadingAvailability) {
                      setSelectedStaffId(
                        selectedStaffId === staff.staff_id ? null : staff.staff_id
                      );
                    }
                  }}
                  disabled={isUnavailable || loadingAvailability}
                >
                  <Text
                    style={[
                      styles.staffText,
                      selectedStaffId === staff.staff_id && styles.staffTextSelected,
                      isUnavailable && styles.staffTextUnavailable,
                    ]}
                  >
                    {staff.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {/* Pilih Waktu */}
      {selectedDate && (
        <>
          <Text style={styles.sectionTitle}>
            {barbershop.staff && barbershop.staff.length > 0 ? '3' : '2'}. Pilih
            Waktu
          </Text>
          <View style={styles.timeContainer}>
            {availableTimes.length > 0 ? (
              availableTimes.map(time => {
                // --- TAMBAHKAN PENGECEKAN INI ---
                const isTimeDisabled =
                  (selectedDate && isTimePassed(selectedDate, time)) ||
                  (selectedDate && isDateBeyondOneWeek(selectedDate));

                const isFullyBooked = fullyBookedTimes.includes(time);
                // ----------------------------------
                return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeChip,
                    selectedTime === time && styles.timeChipSelected,
                    // --- TAMBAHKAN GAYA UNTUK WAKTU YANG DINONAKTIFKAN ---
                    (isTimeDisabled || isFullyBooked) && styles.timeChipDisabled,
                    // --------------------------------------
                  ]}
                  onPress={() => {
                    if (!(isTimeDisabled || isFullyBooked)) {
                      setSelectedTime(time);
                    }
                  }}
                  // Nonaktifkan jika waktu sudah lewat atau penuh
                  disabled={isTimeDisabled || isFullyBooked || loadingAvailability}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && styles.timeTextSelected,
                      // --- TAMBAHKAN GAYA TEKS UNTUK WAKTU YANG DINONAKTIFKAN ---
                      (isTimeDisabled || isFullyBooked) && styles.timeTextDisabled,
                      // --------------------------------------------
                    ]}
                  >
                    {time}
                    {(isTimeDisabled || isFullyBooked) && <Text style={styles.fullyBookedIndicator}> </Text>}
                  </Text>
                </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.noTimeText}>
                Tidak ada jadwal tersedia di tanggal ini atau barbershop tutup.
              </Text>
            )}
          </View>
        </>
      )}

      {/* Tombol Konfirmasi */}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!selectedDate || !selectedTime || isSubmitting) &&
            styles.confirmButtonDisabled,
        ]}
        onPress={handleBooking}
        disabled={!selectedDate || !selectedTime || isSubmitting}
      >
        <Text style={styles.confirmButtonText}>
          {isSubmitting ? '⏳ Memproses...' : '💳 Lanjut ke Pembayaran'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', padding: 16 },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  serviceName: { fontSize: 16, fontWeight: '600', color: '#334155' },
  barbershopName: { fontSize: 14, color: '#64748B', marginTop: 4 },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#64748B',
  },
  timeContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  timeChip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  timeChipSelected: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  timeText: { color: '#334155', fontWeight: '600' },
  timeTextSelected: { color: 'white' },
  confirmButton: {
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
    elevation: 3,
  },
  confirmButtonDisabled: {
    backgroundColor: '#94A3B8',
    elevation: 1,
  },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  noTimeText: {
    color: '#64748B',
    padding: 8,
  },
  // Gaya untuk staff
  staffContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  staffChip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  staffChipSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  staffChipUnavailable: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    opacity: 0.6,
  },
  staffText: {
    color: '#334155',
    fontWeight: '600',
  },
  staffTextSelected: {
    color: 'white',
  },
  staffTextUnavailable: {
    color: '#EF4444',
    textDecorationLine: 'line-through',
  },
  // --- TAMBAHKAN GAYA UNTUK WAKTU YANG DINONAKTIFKAN ---
  timeChipDisabled: {
    backgroundColor: '#FEE2E2', // Merah muda (seperti gambar)
    borderColor: '#FECACA',    // Merah muda lebih gelap
    opacity: 0.6,             // Sedikit transparansi
  },
  timeTextDisabled: {
    color: '#EF4444',         // Merah
    textDecorationLine: 'line-through', // Coret teks
  },
  // --------------------------------------
  fullyBookedIndicator: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#EF4444',
  },
});

export default BookingPage;