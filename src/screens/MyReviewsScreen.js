// src/screens/MyReviewsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import api from '../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MyReviewsScreen = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/my-reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.starIcon}>
          {i <= rating ? '⭐' : '☆'}
        </Text>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.card}>
      {/* Barbershop Info */}
      <View style={styles.cardHeader}>
        <View style={styles.shopIcon}>
          <Icon name="store" size={24} color="#7C3AED" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.barbershopName}>{item.Barbershop?.name}</Text>
          <Text style={styles.cityText}>{item.Barbershop?.city}</Text>
        </View>
      </View>

      {/* Service Info */}
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.Booking?.Service?.name || 'Layanan'}</Text>
        <Text style={styles.bookingDate}>
          {new Date(item.Booking?.booking_time).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Rating */}
      <View style={styles.ratingSection}>
        {renderStars(item.rating)}
        <Text style={styles.ratingText}>{item.rating}/5</Text>
      </View>

      {/* Comment */}
      {item.comment && (
        <View style={styles.commentSection}>
          <Text style={styles.commentText}>{item.comment}</Text>
        </View>
      )}

      {/* Review Date */}
      <View style={styles.reviewFooter}>
        <Icon name="schedule" size={14} color="#A7A6BB" />
        <Text style={styles.reviewDate}>
          Direview pada{' '}
          {new Date(item.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Memuat ulasan Anda...</Text>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyIcon}>
          <Icon name="rate-review" size={64} color="#D1D5DB" />
        </View>
        <Text style={styles.emptyTitle}>Belum Ada Ulasan</Text>
        <Text style={styles.emptySubtitle}>
          Ulasan yang Anda berikan akan muncul di sini
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.review_id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
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
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  shopIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  barbershopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  cityText: {
    fontSize: 13,
    color: '#6B6A82',
  },
  serviceInfo: {
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4C4B63',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 13,
    color: '#A7A6BB',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  starIcon: {
    fontSize: 20,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },
  commentSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  commentText: {
    fontSize: 14,
    color: '#4C4B63',
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewDate: {
    fontSize: 12,
    color: '#A7A6BB',
  },
});

export default MyReviewsScreen;