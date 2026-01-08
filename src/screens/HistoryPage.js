// src/screens/HistoryPage.js - ENHANCED VERSION
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
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '../services/api';

const HistoryPage = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'ongoing', 'completed'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [reviewStates, setReviewStates] = useState({});

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  useEffect(() => {
    filterBookings(activeFilter);
  }, [bookings, activeFilter]);

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

  const filterBookings = (filter) => {
    let filtered = [...bookings];
    
    if (filter === 'ongoing') {
      // Status ongoing: pending_payment, confirmed
      filtered = filtered.filter(b => 
        ['pending_payment', 'confirmed'].includes(b.status)
      );
    } else if (filter === 'completed') {
      // Status completed: completed, cancelled, no_show
      filtered = filtered.filter(b => 
        ['completed', 'cancelled', 'no_show'].includes(b.status)
      );
    }
    
    // Sort by booking_time descending
    filtered.sort((a, b) => new Date(b.booking_time) - new Date(a.booking_time));
    
    setFilteredBookings(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleBookingPress = (booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const handleReviewPress = async (booking) => {
    try {
      const serviceResponse = await api.get(`/barbershops/detail/${booking.barbershop_id}`);
      const service = serviceResponse.data.services?.find(s => s.service_id === booking.service_id);
      
      if (!service) {
        Alert.alert('Error', 'Data layanan tidak ditemukan');
        return;
      }

      setDetailModalVisible(false);
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
      case 'pending_payment': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'no_show': return '#9CA3AF';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_payment': return 'Menunggu Pembayaran';
      case 'confirmed': return 'Terkonfirmasi';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      case 'no_show': return 'Tidak Hadir';
      default: return status;
    }
  };

  const renderFilterButton = (filter, label, count) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.filterBadge,
          activeFilter === filter && styles.filterBadgeActive,
        ]}
      >
        <Text
          style={[
            styles.filterBadgeText,
            activeFilter === filter && styles.filterBadgeTextActive,
          ]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderBookingItem = ({ item }) => {
    const reviewState = reviewStates[item.booking_id];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleBookingPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
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
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          {item.payment_status === 'paid' && (
            <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.statusText}>Dibayar</Text>
            </View>
          )}
        </View>

        {item.status === 'completed' && reviewState?.canReview && !reviewState?.hasReview && (
          <View style={styles.quickActionRow}>
            <Text style={styles.tapToViewText}>Tap untuk beri review →</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedBooking) return null;

    const reviewState = reviewStates[selectedBooking.booking_id];
    const canReview = reviewState?.canReview;
    const hasReview = reviewState?.hasReview;

    return (
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Booking</Text>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Status Section */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Status</Text>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusBadgeLarge,
                      { backgroundColor: getStatusColor(selectedBooking.status) },
                    ]}
                  >
                    <Text style={styles.statusTextLarge}>
                      {getStatusText(selectedBooking.status)}
                    </Text>
                  </View>
                  {selectedBooking.payment_status === 'paid' && (
                    <View style={[styles.statusBadgeLarge, { backgroundColor: '#10B981' }]}>
                      <Text style={styles.statusTextLarge}>Dibayar</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Booking Info */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Informasi Booking</Text>
                <DetailRow label="Booking ID" value={selectedBooking.booking_id} />
                <DetailRow
                  label="Tanggal & Waktu"
                  value={`${new Date(selectedBooking.booking_time).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })} • ${new Date(selectedBooking.booking_time).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
                />
              </View>

              {/* Service Info */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Layanan</Text>
                <DetailRow label="Nama Layanan" value={selectedBooking.Service?.name} />
                <DetailRow
                  label="Harga"
                  value={`Rp${Number(selectedBooking.total_price).toLocaleString('id-ID')}`}
                />
              </View>

              {/* Barbershop Info */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Barbershop</Text>
                <DetailRow label="Nama" value={selectedBooking.Barbershop?.name} />
                {selectedBooking.Barbershop?.address && (
                  <DetailRow label="Alamat" value={selectedBooking.Barbershop.address} />
                )}
                {selectedBooking.Barbershop?.city && (
                  <DetailRow label="Kota" value={selectedBooking.Barbershop.city} />
                )}
                {selectedBooking.Staff && (
                  <DetailRow label="Kapster" value={selectedBooking.Staff.name} />
                )}
              </View>

              {/* Payment Info */}
              {selectedBooking.payment_status === 'paid' && selectedBooking.paid_at && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Informasi Pembayaran</Text>
                  <DetailRow
                    label="Dibayar Pada"
                    value={new Date(selectedBooking.paid_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  />
                  <DetailRow label="Status" value="Lunas" />
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              {selectedBooking.status === 'completed' && canReview && !hasReview && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => handleReviewPress(selectedBooking)}
                >
                  <Text style={styles.reviewButtonText}>⭐ Beri Review</Text>
                </TouchableOpacity>
              )}
              {hasReview && (
                <View style={styles.reviewedTag}>
                  <Text style={styles.reviewedText}>✅ Sudah Direview</Text>
                </View>
              )}
              {selectedBooking.status === 'pending_payment' && selectedBooking.payment_url && (
                <TouchableOpacity
                  style={styles.payButtonLarge}
                  onPress={() => {
                    setDetailModalVisible(false);
                    navigation.navigate('PaymentWebView', {
                      paymentUrl: selectedBooking.payment_url,
                      bookingId: selectedBooking.booking_id,
                    });
                  }}
                >
                  <Text style={styles.payButtonTextLarge}>💳 Lanjutkan Pembayaran</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
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

  const ongoingCount = bookings.filter(b => ['pending_payment', 'confirmed'].includes(b.status)).length;
  const completedCount = bookings.filter(b => ['completed', 'cancelled', 'no_show'].includes(b.status)).length;

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'Semua', bookings.length)}
        {renderFilterButton('ongoing', 'Berjalan', ongoingCount)}
        {renderFilterButton('completed', 'Selesai', completedCount)}
      </View>

      {filteredBookings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>📋 Tidak Ada Riwayat</Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'ongoing'
              ? 'Anda tidak memiliki booking yang sedang berjalan'
              : activeFilter === 'completed'
              ? 'Anda belum memiliki booking yang selesai'
              : 'Belum ada riwayat booking'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.booking_id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
          }
        />
      )}

      {renderDetailModal()}
    </View>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || '-'}</Text>
  </View>
);

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

  // Filter
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B6A82',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#F5F3FF',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B6A82',
  },
  filterBadgeTextActive: {
    color: '#7C3AED',
  },

  // List
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
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
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  },
  quickActionRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
  },
  tapToViewText: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B6A82',
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B6A82',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1B4B',
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusTextLarge: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
    gap: 12,
  },
  reviewButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  reviewedTag: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  reviewedText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 15,
  },
  payButtonLarge: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonTextLarge: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default HistoryPage;