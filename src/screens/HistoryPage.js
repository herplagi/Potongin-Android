// src/screens/HistoryPage.js - UPDATED with Review Feature
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const HistoryPage = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewStates, setReviewStates] = useState({}); // Track review status per booking

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data);
      
      // Check review status untuk setiap booking yang completed
      const newReviewStates = {};
      for (const booking of response.data) {
        if (booking.status === 'completed') {
          await checkIfCanReview(booking.booking_id, newReviewStates);
        }
      }
      setReviewStates(newReviewStates);
    } catch (error) {
      console.error('Gagal memuat booking:', error);
      Alert.alert('Error', 'Gagal memuat riwayat booking');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkIfCanReview = async (bookingId, stateObj) => {
    try {
      const response = await api.get(`/reviews/can-review/${bookingId}`);
      stateObj[bookingId] = response.data;
    } catch (error) {
      console.error('Error checking review status:', error);
      stateObj[bookingId] = { canReview: false };
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleReviewPress = async (booking) => {
    try {
      // Fetch service dan barbershop details
      const serviceResponse = await api.get(`/barbershops/detail/${booking.barbershop_id}`);
      const service = serviceResponse.data.services?.find(s => s.service_id === booking.service_id);
      
      if (!service) {
        Alert.alert('Error', 'Data layanan tidak ditemukan');
        return;
      }

      navigation.navigate('Review', {
        booking,
        service,
        barbershop: {
          barbershop_id: booking.barbershop_id,
          name: booking.Barbershop?.name,
        },
      });
    } catch (error) {
      console.error('Error navigating to review:', error);
      Alert.alert('Error', 'Gagal membuka form review');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_payment':
        return '#EAB308';
      case 'confirmed':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#10B981';
      case 'pending':
        return '#EAB308';
      case 'failed':
        return '#EF4444';
      case 'expired':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderBookingItem = ({ item }) => {
    const reviewState = reviewStates[item.booking_id];
    const canReview = reviewState?.canReview;
    const hasReview = reviewState?.hasReview;

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName}>{item.Service?.name || 'Layanan'}</Text>
          <Text style={styles.price}>
            Rp {Number(item.total_price).toLocaleString('id-ID')}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.barbershopName}>
            {item.Barbershop?.name || 'Barbershop'}
          </Text>
          <Text style={styles.dateTime}>
            {new Date(item.booking_time).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.time}>
            {new Date(item.booking_time).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {item.Staff && (
            <Text style={styles.staff}>Kapster: {item.Staff.name}</Text>
          )}
          <Text style={styles.bookingId}>ID: {item.booking_id}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>
                {item.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(item.payment_status) }]}>
              <Text style={styles.statusText}>
                {item.payment_status === 'paid' ? '✔ DIBAYAR' : 'BELUM BAYAR'}
              </Text>
            </View>
          </View>

          {/* TOMBOL REVIEW - Tampil jika booking completed dan bisa review */}
          {item.status === 'completed' && canReview && !hasReview && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => handleReviewPress(item)}
            >
              <Text style={styles.reviewButtonText}>⭐ Beri Review</Text>
            </TouchableOpacity>
          )}

          {/* Pesan jika sudah ada review */}
          {hasReview && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ✅ Anda sudah memberi review untuk booking ini
              </Text>
            </View>
          )}

          {/* Tombol bayar jika pending payment */}
          {item.payment_status === 'pending' && 
           item.status === 'pending_payment' && 
           item.payment_url && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => {
                navigation.navigate('PaymentWebView', {
                  paymentUrl: item.payment_url,
                  bookingId: item.booking_id,
                });
              }}
            >
              <Text style={styles.payButtonText}>💳 Bayar Sekarang</Text>
            </TouchableOpacity>
          )}

          {/* Pesan untuk payment expired */}
          {item.payment_status === 'expired' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ⏰ Pembayaran sudah kadaluarsa. Silakan buat booking baru.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Memuat riwayat booking...</Text>
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>📋 Belum ada riwayat booking</Text>
        <Text style={styles.emptySubtext}>
          Booking Anda akan muncul di sini
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={item => item.booking_id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F5F9' 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  listContainer: { 
    padding: 16 
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  cardBody: {
    marginBottom: 12,
  },
  barbershopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  staff: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  cardFooter: {
    gap: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  reviewButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  payButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
  },
});

export default HistoryPage;