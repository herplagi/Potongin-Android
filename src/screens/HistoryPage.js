// src/screens/HistoryPage.js - GAYA KREATIF & IMMERSIVE
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '../services/api';

const HistoryPage = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewStates, setReviewStates] = useState({});

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data);

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
      case 'pending_payment': return '#F59E0B'; // amber
      case 'confirmed': return '#3B82F6';       // blue
      case 'completed': return '#10B981';       // emerald
      case 'cancelled': return '#EF4444';       // red
      default: return '#9CA3AF';
    }
  };

  const renderBookingItem = ({ item }) => {
    const reviewState = reviewStates[item.booking_id];
    const canReview = reviewState?.canReview;
    const hasReview = reviewState?.hasReview;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.serviceName}>{item.Service?.name || 'Layanan'}</Text>
            <Text style={styles.barbershopName}>
              {item.Barbershop?.name || 'Barbershop'}
            </Text>
          </View>
          <Text style={styles.price}>
            Rp{Number(item.total_price).toLocaleString('id-ID')}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.dateTime}>
            {new Date(item.booking_time).toLocaleDateString('id-ID', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
            {' • '}
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

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
          {item.payment_status === 'paid' && (
            <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.statusText}>Dibayar</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {item.status === 'completed' && canReview && !hasReview && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => handleReviewPress(item)}
            >
              <Text style={styles.reviewButtonText}>⭐ Beri Review</Text>
            </TouchableOpacity>
          )}

          {hasReview && (
            <View style={styles.reviewedTag}>
              <Text style={styles.reviewedText}>✅ Sudah Direview</Text>
            </View>
          )}

          {item.payment_status === 'pending' && item.status === 'pending_payment' && item.payment_url && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() =>
                navigation.navigate('PaymentWebView', {
                  paymentUrl: item.payment_url,
                  bookingId: item.booking_id,
                })
              }
            >
              <Text style={styles.payButtonText}>💳 Bayar Sekarang</Text>
            </TouchableOpacity>
          )}

          {item.payment_status === 'expired' && (
            <View style={styles.expiredTag}>
              <Text style={styles.expiredText}>⏰ Kadaluarsa</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Menyiapkan riwayat Anda...</Text>
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>📋 Belum Ada Riwayat</Text>
        <Text style={styles.emptySubtitle}>
          Booking Anda akan muncul di sini setelah Anda melakukan pemesanan.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.booking_id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#7C3AED',
    fontWeight: '500',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B6A82',
    textAlign: 'center',
    lineHeight: 20,
  },

  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    flex: 1,
    marginRight: 12,
  },
  barbershopName: {
    fontSize: 14,
    color: '#6B6A82',
    marginTop: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'right',
  },
  cardBody: {
    marginBottom: 14,
  },
  dateTime: {
    fontSize: 14,
    color: '#4C4B63',
    marginBottom: 6,
  },
  staff: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
    marginBottom: 6,
  },
  bookingId: {
    fontSize: 11,
    color: '#A7A6BB',
    fontFamily: 'monospace',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  reviewButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  reviewButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  reviewedTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  reviewedText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 14,
  },
  payButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  payButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  expiredTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  expiredText: {
    color: '#B91C1C',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default HistoryPage;