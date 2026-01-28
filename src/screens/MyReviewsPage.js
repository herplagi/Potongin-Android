import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import api from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme/theme';

const MyReviewsPage = () => {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async (pageNum = 1, isRefreshing = false) => {
    try {
      if (!isRefreshing && pageNum === 1) setLoading(true);

      const response = await api.get(`/reviews/my-reviews?page=${pageNum}&limit=10`);
      
      if (pageNum === 1) {
        setReviews(response.data.reviews);
      } else {
        setReviews(prev => [...prev, ...response.data.reviews]);
      }

      setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReviews(1);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchReviews(page + 1);
    }
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="star"
            size={16}
            color={star <= rating ? COLORS.accent : COLORS.borderLight}
            fill={star <= rating ? COLORS.accent : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=300&fit=crop';
    return url.startsWith('http') ? url : `http://10.0.2.2:5000${url}`;
  };

  const renderReviewItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reviewCard}
      onPress={() =>
        navigation.navigate('BarbershopDetail', {
          barbershopId: item.Barbershop?.barbershop_id,
        })
      }
      activeOpacity={0.7}
    >
      {/* Barbershop Info Header */}
      <View style={styles.headerSection}>
        <Image
          source={{ uri: getImageUrl(item.Barbershop?.main_image_url) }}
          style={styles.barbershopImage}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.barbershopName} numberOfLines={1}>
            {item.Barbershop?.name}
          </Text>
          <View style={styles.locationRow}>
            <Icon name="map-pin" size={14} color={COLORS.textTertiary} />
            <Text style={styles.locationText}>{item.Barbershop?.city}</Text>
          </View>
          {item.Service && (
            <View style={styles.serviceBadge}>
              <Icon name="scissors" size={12} color={COLORS.primary} />
              <Text style={styles.serviceText}>{item.Service.name}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Rating Section */}
      <View style={styles.ratingSection}>
        <View style={styles.starsRow}>
          {renderStars(item.rating)}
          <Text style={styles.ratingNumber}>{item.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Review Content */}
      {item.comment && (
        <Text style={styles.reviewText} numberOfLines={3}>
          {item.comment}
        </Text>
      )}

      {/* Status Footer */}
      <View style={styles.footer}>
        <View style={[
          styles.statusBadge,
          item.status === 'approved' ? styles.statusApproved : styles.statusPending
        ]}>
          <Icon
            name={item.status === 'approved' ? 'check-circle' : 'clock'}
            size={14}
            color={item.status === 'approved' ? COLORS.accentGreen : COLORS.accent}
          />
          <Text style={[
            styles.statusText,
            item.status === 'approved' ? styles.statusTextApproved : styles.statusTextPending
          ]}>
            {item.status === 'approved' ? 'Disetujui' : 'Menunggu Persetujuan'}
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={COLORS.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="message-circle" size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>Belum Ada Ulasan</Text>
      <Text style={styles.emptyText}>
        Berikan ulasan setelah menggunakan layanan barbershop untuk membantu pengguna lain
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.emptyButtonText}>Jelajahi Barbershop</Text>
        <Icon name="arrow-right" size={16} color={COLORS.surface} />
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ulasan Saya</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat ulasan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ulasan Saya</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Stats Summary */}
      {reviews.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Total Ulasan</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Rating Rata-rata</Text>
          </View>
        </View>
      )}

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.review_id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  headerPlaceholder: {
    width: 40,
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.lg,
  },

  // List Content
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  // Review Card - Modern Design
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },

  // Header Section
  headerSection: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  barbershopImage: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.borderLight,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  barbershopName: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  locationText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginLeft: 4,
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  serviceText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
    marginLeft: 4,
  },

  // Rating Section
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingNumber: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  dateText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  // Review Text
  reviewText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusApproved: {
    backgroundColor: COLORS.accentGreenBg,
  },
  statusPending: {
    backgroundColor: COLORS.accentBg,
  },
  statusText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.semibold,
    marginLeft: 6,
  },
  statusTextApproved: {
    color: COLORS.accentGreen,
  },
  statusTextPending: {
    color: COLORS.accent,
  },

  // Empty State - Modern Design
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.surface,
    marginRight: SPACING.sm,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  footerLoader: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
});

export default MyReviewsPage;