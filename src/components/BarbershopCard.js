// src/components/BarbershopCard.js - GAYA KREATIF & IMMERSIVE
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BarbershopCard = ({ shop, onPress }) => {
  const imageUri = shop.main_image_url
    ? shop.main_image_url.startsWith('http')
      ? shop.main_image_url
      : `http://10.0.2.2:5000${shop.main_image_url}`
    : 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=300&fit=crop';

  // Format distance if available
  const formatDistance = (distance) => {
    if (!distance) return null;
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  // Format price range
  const formatPrice = () => {
    if (shop.min_price && shop.max_price) {
      return `Rp ${shop.min_price.toLocaleString('id-ID')} - ${shop.max_price.toLocaleString('id-ID')}`;
    } else if (shop.min_price) {
      return `Mulai dari Rp ${shop.min_price.toLocaleString('id-ID')}`;
    }
    return 'Harga bervariasi';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {shop.name}
        </Text>
        <Text style={styles.city} numberOfLines={1}>
          {shop.city}
        </Text>
        
        <View style={styles.detailsRow}>
          {shop.distance && (
            <View style={styles.detailItem}>
              <Icon name="location-on" size={14} color="#10B981" />
              <Text style={styles.detailText}>{formatDistance(shop.distance)}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Icon name="access-time" size={14} color="#6366F1" />
            <Text style={styles.detailText}>{shop.operating_hours || '09:00 - 21:00'}</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{formatPrice()}</Text>
        </View>

        <View style={styles.ratingRow}>
          <Icon name="star" size={16} color="#F59E0B" />
          <Text style={styles.rating}>
            {shop.average_rating?.toFixed(1) || '0.0'}
          </Text>
          <Text style={styles.reviewCount}>
            ({shop.review_count || 0} ulasan)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3F4F6',
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  city: {
    fontSize: 14,
    color: '#6B6A82',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B6A82',
    marginLeft: 4,
    fontWeight: '600',
  },
  priceRow: {
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B6A82',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default BarbershopCard;