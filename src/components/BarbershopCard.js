// src/components/BarbershopCard.js - GAYA KREATIF & IMMERSIVE
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const BarbershopCard = ({ shop, onPress }) => {
  const imageUri = shop.main_image_url
    ? shop.main_image_url.startsWith('http')
      ? shop.main_image_url
      : `http://10.0.2.2:5000${shop.main_image_url}`
    : 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=300&fit=crop';

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
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>
            ⭐ {shop.average_rating?.toFixed(1) || '0.0'}
          </Text>
          <Text style={styles.reviewCount}>
            ({shop.review_count || 0})
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
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  reviewCount: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default BarbershopCard;