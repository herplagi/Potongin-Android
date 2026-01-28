// src/components/BarbershopCard.js - FINAL FIX
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

  const distance = shop.distance ? `${shop.distance.toFixed(1)} km` : null;
  const isOpen = shop.is_open === true;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        
        <View style={[styles.statusBadge, !isOpen && styles.closedBadge]}>
          <View style={[styles.statusDot, !isOpen && styles.closedDot]} />
          <Text style={[styles.statusText, !isOpen && styles.closedText]}>
            {isOpen ? 'Buka' : 'Tutup'}
          </Text>
        </View>

        {distance ? (
          <View style={styles.distanceBadge}>
            <Icon name="navigation" size={10} color={COLORS.textInverse} />
            <Text style={styles.distanceText}>{distance}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {shop.name || 'Barbershop'}
        </Text>
        <View style={styles.locationRow}>
          <Icon name="map-pin" size={12} color={COLORS.textSecondary} />
          <Text style={styles.city} numberOfLines={1}>
            {shop.address || shop.city || 'Lokasi tidak tersedia'}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color={COLORS.accent} fill={COLORS.accent} />
            <Text style={styles.rating}>
              {shop.average_rating ? shop.average_rating.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.reviewCount}>
              ({shop.review_count || 0})
            </Text>
          </View>

          {(shop.service_count !== null && shop.service_count !== undefined) ? (
            <View style={styles.serviceTag}>
              <Icon name="scissors" size={10} color={COLORS.primary} />
              <Text style={styles.serviceCount}>
                {shop.service_count} Layanan
              </Text>
            </View>
          ) : null}
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
    backgroundColor: '#ECFDF5',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  closedBadge: {
    backgroundColor: '#FEF2F2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginRight: 4,
  },
  closedDot: {
    backgroundColor: '#DC2626',
  },
  statusText: {
    fontSize: TYPOGRAPHY.tiny,
    fontWeight: TYPOGRAPHY.semibold,
    color: '#059669',
  },
  closedText: {
    color: '#DC2626',
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
  },
  distanceText: {
    fontSize: TYPOGRAPHY.tiny,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textInverse,
    marginLeft: 4,
  },
  infoContainer: {
    padding: SPACING.base,
  },
  name: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  city: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  serviceCount: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.primary,
    marginLeft: 4,
  },
});

export default BarbershopCard;