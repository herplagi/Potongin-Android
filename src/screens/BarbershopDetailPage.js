// src/screens/BarbershopDetailPage.js - VERSI KREATIF
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';

const BarbershopDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { barbershopId } = route.params;

  const [barbershop, setBarbershop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch detail barbershop
        const detailRes = await api.get(`/barbershops/detail/${barbershopId}`);
        setBarbershop(detailRes.data);

        // Fetch review stats
        const reviewRes = await api.get(
          `/reviews/public/barbershop/${barbershopId}`,
        );
        setReviewStats(
          reviewRes.data.stats || { averageRating: 0, totalReviews: 0 },
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [barbershopId]);

  const getImageUrl = () => {
    if (!barbershop) return null;
    if (barbershop.main_image_url) {
      return barbershop.main_image_url.startsWith('http')
        ? barbershop.main_image_url
        : `http://10.0.2.2:5000${barbershop.main_image_url}`;
    }
    return 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=300&fit=crop';
  };

  const getStaffImageUrl = picture => {
    if (!picture) return null;
    return picture.startsWith('http')
      ? picture
      : `http://10.0.2.2:5000${picture}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Menyiapkan pengalaman Anda...</Text>
      </View>
    );
  }

  if (!barbershop) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Barbershop tidak ditemukan.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeStaff = barbershop.staff?.filter(s => s.is_active) || [];

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section with Overlay */}
      <View style={styles.heroWrapper}>
        {imageError ? (
          <View style={[styles.heroImage, styles.heroFallback]}>
            <Text style={styles.heroFallbackText}>✂️</Text>
          </View>
        ) : (
          <Image
            source={{ uri: getImageUrl() }}
            style={styles.heroImage}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        )}
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{barbershop.name}</Text>
          <View style={styles.heroMeta}>
            <Text style={styles.heroLocation}>📍 {barbershop.city}</Text>
            <Text style={styles.heroRating}>
              ⭐ {reviewStats.averageRating || '0.0'} (
              {reviewStats.totalReviews || 0})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* About */}
        {barbershop.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tentang Kami</Text>
            <Text style={styles.cardText}>{barbershop.description}</Text>
          </View>
        )}

        {/* Staff Highlight */}
        {activeStaff.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Meet the Artists</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.staffScroll}
            >
              {activeStaff.map(staff => (
                <View key={staff.staff_id} style={styles.staffProfile}>
                  {staff.picture ? (
                    <Image
                      source={{ uri: getStaffImageUrl(staff.picture) }}
                      style={styles.staffImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.staffImage, styles.staffInitialBg]}>
                      <Text style={styles.staffInitial}>
                        {staff.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.staffName}>{staff.name}</Text>
                  {staff.specialty && (
                    <Text style={styles.staffTag}>{staff.specialty}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Services */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Layanan Unggulan</Text>
          {barbershop.services && barbershop.services.length > 0 ? (
            barbershop.services.map(service => (
              <View key={service.service_id} style={styles.serviceRow}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                  <Text style={styles.serviceTime}>
                    ⏱️ {service.duration_minutes} menit
                  </Text>
                </View>
                <View style={styles.serviceAction}>
                  <Text style={styles.servicePrice}>
                    Rp{Number(service.price).toLocaleString('id-ID')}
                  </Text>
                  <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={() =>
                      navigation.navigate('Booking', { service, barbershop })
                    }
                  >
                    <Text style={styles.ctaText}>Pesan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Belum ada layanan tersedia.</Text>
          )}
        </View>

        {/* Sticky CTA (Opsional: bisa diimplementasi dengan useScrollToTop atau sticky header) */}
      </View>
    </ScrollView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#7C3AED',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },

  // HERO
  heroWrapper: {
    position: 'relative',
    height: 240,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFallbackText: {
    fontSize: 50,
    color: '#D1D5DB',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 0,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  heroLocation: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  heroRating: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },

  // CONTENT
  content: {
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4C4B63',
  },

  // STAFF
  staffScroll: {
    flexDirection: 'row',
  },
  staffProfile: {
    alignItems: 'center',
    marginRight: 24,
    width: 90,
  },
  staffImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    marginBottom: 10,
  },
  staffInitialBg: {
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffInitial: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
  },
  staffName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
    textAlign: 'center',
  },
  staffTag: {
    fontSize: 12,
    color: '#7C3AED',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },

  // SERVICES
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  serviceRowLast: {
    borderBottomWidth: 0,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  serviceDesc: {
    fontSize: 13,
    color: '#6B6A82',
    marginTop: 4,
  },
  serviceTime: {
    fontSize: 12,
    color: '#A7A6BB',
    marginTop: 4,
  },
  serviceAction: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 6,
  },
  ctaButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ctaText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyText: {
    fontSize: 14,
    color: '#A7A6BB',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default BarbershopDetailPage;
