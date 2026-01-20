// Potongin/src/screens/HistoryPage.js - COMPLETE WITH CHECK-IN SYSTEM
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, getStatusColor } from '../theme/theme';
import Card from '../components/Card';

const HistoryPage = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewStates, setReviewStates] = useState({});
  const [filter, setFilter] = useState('all'); // all, upcoming, completed

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data);

      // Check review status for completed bookings
      const newReviewStates = {};
      for (const booking of response.data) {
        if (booking.status === 'completed') {
          await checkIfCanReview(booking.booking_id, newReviewStates);
        }
      }
      setReviewStates(newReviewStates);
    } catch (error) {
      console.error('Fetch bookings error:', error);
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
      console.error('Navigate to review error:', error);
      Alert.alert('Error', 'Gagal membuka form review');
    }
  };

  const handleConfirmCompleted = async (bookingId) => {
    Alert.alert(
      'Konfirmasi Layanan',
      'Apakah layanan sudah selesai dengan baik?',
      [
        { text: 'Belum', style: 'cancel' },
        {
          text: 'Ya, Selesai',
          onPress: async () => {
            try {
              const response = await api.post(`/bookings/${bookingId}/confirm-completed`);
              Alert.alert(
                'Berhasil!',
                response.data.message || 'Layanan dikonfirmasi selesai. Terima kasih!'
              );
              fetchBookings();
            } catch (error) {
              console.error('Confirm completed error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Gagal mengkonfirmasi layanan');
            }
          },
        },
      ]
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return ['pending_payment', 'confirmed', 'checked_in', 'in_progress', 'awaiting_confirmation'].includes(booking.status);
    }
    if (filter === 'completed') {
      return ['completed', 'cancelled', 'no_show'].includes(booking.status);
    }
    return true;
  });

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      {[
        { 
          key: 'all', 
          label: 'Semua', 
          count: bookings.length 
        },
        { 
          key: 'upcoming', 
          label: 'Aktif', 
          count: bookings.filter(b => 
            ['pending_payment', 'confirmed', 'checked_in', 'in_progress', 'awaiting_confirmation'].includes(b.status)
          ).length 
        },
        { 
          key: 'completed', 
          label: 'Selesai', 
          count: bookings.filter(b => 
            ['completed', 'cancelled', 'no_show'].includes(b.status)
          ).length 
        },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.filterTab,
            filter === tab.key && styles.filterTabActive,
          ]}
          onPress={() => setFilter(tab.key)}
        >
          <Text style={[
            styles.filterTabText,
            filter === tab.key && styles.filterTabTextActive,
          ]}>
            {tab.label}
          </Text>
          {tab.count > 0 && (
            <View style={[
              styles.filterBadge,
              filter === tab.key && styles.filterBadgeActive,
            ]}>
              <Text style={[
                styles.filterBadgeText,
                filter === tab.key && styles.filterBadgeTextActive,
              ]}>
                {tab.count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBookingItem = ({ item }) => {
    const reviewState = reviewStates[item.booking_id];
    const canReview = reviewState?.canReview;
    const hasReview = reviewState?.hasReview;
    const statusStyle = getStatusColor(item.status);
    
    // Check-in and status checks
    const canCheckIn = item.status === 'confirmed' && item.check_in_code;
    const isCheckedIn = item.status === 'checked_in';
    const isInProgress = item.status === 'in_progress';
    const isAwaitingConfirmation = item.status === 'awaiting_confirmation';
    const isCompleted = item.status === 'completed';
    const isNoShow = item.status === 'no_show';

    // Get status label
    const getStatusLabel = (status) => {
      const labels = {
        pending_payment: 'Menunggu Bayar',
        confirmed: 'Dikonfirmasi',
        checked_in: 'Sudah Check-in',
        in_progress: 'Sedang Dilayani',
        awaiting_confirmation: 'Menunggu Konfirmasi',
        completed: 'Selesai',
        cancelled: 'Dibatalkan',
        no_show: 'Tidak Hadir',
      };
      return labels[status] || status;
    };

    return (
      <Card style={styles.bookingCard} variant="flat">
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.barbershopInfo}>
            <View style={styles.iconCircle}>
              <Icon name="scissors" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.barbershopTextContainer}>
              <Text style={styles.barbershopName} numberOfLines={1}>
                {item.Barbershop?.name || 'Barbershop'}
              </Text>
              <Text style={styles.bookingId}>
                #{item.booking_id.substring(0, 8).toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={[
            styles.statusBadge, 
            { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }
          ]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          <Text style={styles.serviceName}>
            {item.Service?.name || 'Layanan Terhapus'}
          </Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Icon name="calendar" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>
                {new Date(item.booking_time).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="clock" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>
                {new Date(item.booking_time).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            {item.Staff && (
              <View style={styles.detailItem}>
                <Icon name="user" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{item.Staff.name}</Text>
              </View>
            )}
            
            <View style={styles.detailItem}>
              <Icon name="dollar-sign" size={14} color={COLORS.success.main} />
              <Text style={[styles.detailText, styles.priceText]}>
                Rp{Number(item.total_price).toLocaleString('id-ID')}
              </Text>
            </View>
          </View>

          {/* Check-in info */}
          {item.checked_in_at && (
            <View style={styles.checkInInfo}>
              <Icon name="check-circle" size={12} color={COLORS.success.main} />
              <Text style={styles.checkInText}>
                Check-in: {new Date(item.checked_in_at).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Footer Actions */}
        {(canCheckIn || isCheckedIn || isInProgress || isAwaitingConfirmation || 
          (isCompleted && (canReview || hasReview)) || 
          (item.payment_status === 'pending' && item.payment_url)) && (
          <>
            <View style={styles.divider} />
            <View style={styles.cardFooter}>
              {/* CHECK-IN BUTTON */}
              {canCheckIn && (
                <TouchableOpacity
                  style={styles.checkInButton}
                  onPress={() => navigation.navigate('CheckIn', { booking: item })}
                >
                  <Icon name="map-pin" size={16} color={COLORS.surface} />
                  <Text style={styles.checkInButtonText}>Check-in</Text>
                </TouchableOpacity>
              )}

              {/* STATUS INFO (Checked-in, In Progress) */}
              {isCheckedIn && (
                <View style={styles.statusBadgeInline}>
                  <Icon name="check-circle" size={16} color={COLORS.success.main} />
                  <Text style={styles.statusBadgeInlineText}>
                    Sudah Check-in
                  </Text>
                </View>
              )}

              {isInProgress && (
                <View style={[styles.statusBadgeInline, { backgroundColor: COLORS.primaryBg }]}>
                  <Icon name="loader" size={16} color={COLORS.primary} />
                  <Text style={[styles.statusBadgeInlineText, { color: COLORS.primary }]}>
                    Sedang Dilayani
                  </Text>
                </View>
              )}

              {/* CONFIRM COMPLETED BUTTON */}
              {isAwaitingConfirmation && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => handleConfirmCompleted(item.booking_id)}
                >
                  <Icon name="check" size={16} color={COLORS.surface} />
                  <Text style={styles.confirmButtonText}>Konfirmasi Selesai</Text>
                </TouchableOpacity>
              )}

              {/* REVIEW BUTTON */}
              {isCompleted && canReview && !hasReview && (
                <TouchableOpacity 
                  style={styles.reviewButton} 
                  onPress={() => handleReviewPress(item)}
                >
                  <Icon name="star" size={16} color={COLORS.primary} />
                  <Text style={styles.reviewButtonText}>Beri Ulasan</Text>
                </TouchableOpacity>
              )}

              {/* REVIEWED BADGE */}
              {hasReview && (
                <View style={styles.reviewedBadge}>
                  <Icon name="check-circle" size={16} color={COLORS.success.main} />
                  <Text style={styles.reviewedText}>Sudah diulas</Text>
                </View>
              )}

              {/* PAYMENT BUTTON */}
              {item.payment_status === 'pending' && item.status === 'pending_payment' && item.payment_url && (
                <TouchableOpacity 
                  style={styles.payButton}
                  onPress={() => navigation.navigate('PaymentWebView', {
                    paymentUrl: item.payment_url,
                    bookingId: item.booking_id,
                  })}
                >
                  <Icon name="credit-card" size={16} color={COLORS.surface} />
                  <Text style={styles.payButtonText}>Bayar Sekarang</Text>
                </TouchableOpacity>
              )}

              {/* NO SHOW INFO */}
              {isNoShow && (
                <View style={[styles.statusBadgeInline, { backgroundColor: COLORS.error.bg }]}>
                  <Icon name="x-circle" size={16} color={COLORS.error.text} />
                  <Text style={[styles.statusBadgeInlineText, { color: COLORS.error.text }]}>
                    Tidak Hadir
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat riwayat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Booking</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh-cw" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.booking_id.toString()}
        renderItem={renderBookingItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>Belum ada riwayat booking</Text>
            <Text style={styles.emptySubtext}>
              Booking pertamamu akan muncul di sini
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  filterTabActive: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.primary,
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  filterBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  filterBadgeText: {
    fontSize: TYPOGRAPHY.tiny,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textSecondary,
  },
  filterBadgeTextActive: {
    color: COLORS.surface,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  bookingCard: {
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  barbershopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barbershopTextContainer: {
    flex: 1,
  },
  barbershopName: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  bookingId: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontWeight: TYPOGRAPHY.medium,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  statusText: {
    fontSize: TYPOGRAPHY.tiny,
    fontWeight: TYPOGRAPHY.bold,
    textTransform: 'capitalize',
  },
  cardBody: {
    marginBottom: SPACING.md,
  },
  serviceName: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  detailsGrid: {
    gap: SPACING.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  priceText: {
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.success.main,
  },
  checkInInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  checkInText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.success.main,
    fontWeight: TYPOGRAPHY.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  checkInButton: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.success.main,
    gap: SPACING.xs,
    ...SHADOWS.md,
  },
  checkInButtonText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.surface,
  },
  statusBadgeInline: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.success.bg,
    gap: SPACING.xs,
  },
  statusBadgeInlineText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.success.main,
  },
  confirmButton: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    gap: SPACING.xs,
    ...SHADOWS.md,
  },
  confirmButtonText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.surface,
  },
  reviewButton: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryBg,
    gap: SPACING.xs,
  },
  reviewButtonText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
  },
  reviewedBadge: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.statusCompleted.bg,
    gap: SPACING.xs,
  },
  reviewedText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.success.main,
  },
  payButton: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    gap: SPACING.xs,
    ...SHADOWS.md,
  },
  payButtonText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.surface,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyText: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
  },
});

export default HistoryPage;