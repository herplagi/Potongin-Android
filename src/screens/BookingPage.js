import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import api from '../services/api';

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

const BookingPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { service, barbershop } = route.params;

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // ✅ VALIDASI FORMAT TANGGAL
    const bookingDateTime = `${selectedDate}T${selectedTime}:00`;
    const bookingDate = new Date(bookingDateTime);

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

      // ✅ NAVIGASI KE PAYMENT WEBVIEW (TIDAK BUKA BROWSER)
      Alert.alert(
        '✅ Booking Berhasil!',
        `Booking ID: ${booking.booking_id}\n\nSilakan lanjutkan ke pembayaran.`,
        [
          {
            text: '💳 Bayar Sekarang',
            onPress: () => {
              // Navigate ke WebView Payment
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
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.barbershopName}>{barbershop.name}</Text>
        <Text style={styles.servicePrice}>
          Rp {Number(service.price).toLocaleString('id-ID')}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>1. Pilih Tanggal</Text>
      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#4F46E5' },
        }}
        minDate={new Date().toISOString().split('T')[0]}
        theme={{
          selectedDayBackgroundColor: '#4F46E5',
          todayTextColor: '#4F46E5',
          arrowColor: '#4F46E5',
        }}
      />

      {barbershop.staff && barbershop.staff.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            2. Pilih Tukang Cukur (Opsional)
          </Text>
          <View style={styles.timeContainer}>
            {barbershop.staff.map(staff => (
              <TouchableOpacity
                key={staff.staff_id}
                style={[
                  styles.timeChip,
                  selectedStaffId === staff.staff_id && styles.timeChipSelected,
                ]}
                onPress={() => setSelectedStaffId(staff.staff_id)}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedStaffId === staff.staff_id &&
                      styles.timeTextSelected,
                  ]}
                >
                  {staff.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {selectedDate && (
        <>
          <Text style={styles.sectionTitle}>
            {barbershop.staff && barbershop.staff.length > 0 ? '3' : '2'}. Pilih
            Waktu
          </Text>
          <View style={styles.timeContainer}>
            {availableTimes.length > 0 ? (
              availableTimes.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeChip,
                    selectedTime === time && styles.timeChipSelected,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && styles.timeTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noTimeText}>
                Tidak ada jadwal tersedia di tanggal ini atau barbershop tutup.
              </Text>
            )}
          </View>
        </>
      )}

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
});

export default BookingPage;