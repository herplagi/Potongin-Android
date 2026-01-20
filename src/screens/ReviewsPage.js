// src/screens/ReviewsPage.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import api from '../services/api';

const COLORS = {
  primary: '#7C3AED',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  warning: '#F59E0B',
};

const ReviewsPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { barbershopId, barbershopName, reviewStats: initialStats } = route.params;

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(initialStats || {});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1

  useEffect(() => {
    fetchReviews();
  }, [barbershopId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/public/barbershop/${barbershopId}`);
      setReviews(response.data.reviews || []);
      setReviewStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
    return `${Math.floor(diffDays / 365)} tahun lalu`;
  };

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filter));

  const getRatingCount = (rating) => {
    return reviews.filter(r => r.rating === rating).length;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ulasan</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Ratings Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryScore}>
              {reviewStats.averageRating ? Number(reviewStats.averageRating).toFixed(1) : '0.0'}
            </Text>
            <View style={styles.summaryStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Icon
                  key={star}
                  name="star"
                  size={18}
                  color={
                    star <= Math.round(reviewStats.averageRating || 0)
                      ? COLORS.warning
                      : COLORS.border
                  }
                  style={{ marginRight: 3 }}
                />
              ))}
            </View>
            <Text style={styles.summaryText}>
              {reviewStats.totalReviews || 0} ulasan
            </Text>
          </View>

          {/* Rating Breakdown */}
          <View style={styles.ratingBreakdown}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = getRatingCount(star);
              const percentage = reviewStats.totalReviews > 0 
                ? (count / reviewStats.totalReviews) * 100 
                : 0;
              
              return (
                <TouchableOpacity
                  key={star}
                  style={styles.ratingRow}
                  onPress={() => setFilter(star.toString())}
                >
                  <Text style={styles.ratingLabel}>{star}</Text>
                  <Icon name="star" size={12} color={COLORS.warning} />
                  <View style={styles.ratingBar}>
                    <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.ratingCount}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
                Semua ({reviews.length})
              </Text>
            </TouchableOpacity>
            {[5, 4, 3, 2, 1].map((star) => (
              <TouchableOpacity
                key={star}
                style={[styles.filterTab, filter === star.toString() && styles.filterTabActive]}
                onPress={() => setFilter(star.toString())}
              >
                <Icon name="star" size={14} color={filter === star.toString() ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.filterTabText, filter === star.toString() && styles.filterTabTextActive]}>
                  {star} ({getRatingCount(star)})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <View key={review.review_id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerInitial}>
                        {review.customer?.name?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View style={styles.reviewerDetails}>
                      <Text style={styles.reviewerName}>
                        {review.customer?.name || 'Anonymous'}
                      </Text>
                      <View style={styles.reviewMeta}>
                        <View style={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Icon
                              key={star}
                              name="star"
                              size={14}
                              color={
                                star <= review.rating
                                  ? COLORS.warning
                                  : COLORS.border
                              }
                              style={{ marginRight: 2 }}
                            />
                          ))}
                        </View>
                        <Text style={styles.reviewDate}>
                          • {formatDate(review.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>
                    {review.comment}
                  </Text>
                )}
                {review.service_name && (
                  <View style={styles.reviewServiceBadge}>
                    <Icon name="scissors" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.reviewServiceText}>
                      {review.service_name}
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="message-circle" size={64} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>Tidak ada ulasan untuk filter ini</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 20,
    marginBottom: 16,
  },
  summaryLeft: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  summaryScore: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  summaryStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  ratingBreakdown: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    width: 12,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 30,
    textAlign: 'right',
  },
  filterTabs: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: '#F5F3FF',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.primary,
  },
  reviewsList: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  reviewServiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  reviewServiceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textTertiary,
    marginTop: 16,
    fontWeight: '500',
  },
});

export default ReviewsPage;