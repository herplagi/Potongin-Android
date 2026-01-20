// src/components/BarbershopCard.js - FIXED STATUS BADGE
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../theme/theme';

const BarbershopCard = ({ shop, onPress }) => {
  const imageUri = shop.main_image_url
    ? shop.main_image_url.startsWith('http')
      ? shop.main_image_url
      : `http://10.0.2.2:5000${shop.main_image_url}`
    : 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=300&fit=crop';

  // Calculate distance if available
  const distance = shop.distance ? `${shop.distance.toFixed(1)} km` : null;
  
  // ✅ FIX: Use is_open from backend (already calculated based on schedule)
  const isOpen = shop.is_open === true; // Ensure boolean comparison

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.95}
    >
      {/* Image Container with Overlay Badge */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, !isOpen && styles.closedBadge]}>
          <View style={[styles.statusDot, !isOpen && styles.closedDot]} />
          <Text style={[styles.statusText, !isOpen && styles.closedText]}>
            {isOpen ? 'Buka' : 'Tutup'}
          </Text>
        </View>

        {/* Distance Badge (if available) */}
        {distance && (
          <View style={styles.distanceBadge}>
            <Icon name="navigation" size={10} color={COLORS.textInverse} />
            <Text style={styles.distanceText}>{distance}</Text>
          </View>
        )}
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        {/* Name and City */}
        <Text style={styles.name} numberOfLines={1}>
          {shop.name}
        </Text>
        <View style={styles.locationRow}>
          <Icon name="map-pin" size={12} color={COLORS.textSecondary} />
          <Text style={styles.city} numberOfLines={1}>
            {shop.city}
          </Text>
        </View>

        {/* Rating and Reviews */}
        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color={COLORS.accent} fill={COLORS.accent} />
            <Text style={styles.rating}>
              {shop.average_rating?.toFixed(1) || '0.0'}
            </Text>
            <Text style={styles.reviewCount}>
              ({shop.review_count || 0})
            </Text>
          </View>

          {/* Quick Info */}
          {shop.service_count && (
            <View style={styles.serviceTag}>
              <Icon name="scissors" size={10} color={COLORS.primary} />
              <Text style={styles.serviceCount}>
                {shop.service_count} Layanan
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.base,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.borderLight,
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success.bg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  closedBadge: {
    backgroundColor: COLORS.error.bg,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success.text,
  },
  closedDot: {
    backgroundColor: COLORS.error.text,
  },
  statusText: {
    fontSize: TYPOGRAPHY.tiny,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.success.text,
  },
  closedText: {
    color: COLORS.error.text,
  },
  distanceBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.tiny,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textInverse,
  },
  infoContainer: {
    padding: SPACING.base,
  },
  name: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.md,
  },
  city: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  serviceCount: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.primary,
  },
});

export default BarbershopCard;