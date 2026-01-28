// src/screens/BarbershopDetailPage.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import api from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Modern Color Palette
const COLORS = {
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

// Facility Icons Mapping
const FACILITY_ICONS = {
  WiFi: 'wifi',
  AC: 'wind',
  Parkir: 'truck',
  Toilet: 'droplet',
  Mushola: 'compass',
  TV: 'tv',
  Minuman: 'coffee',
  Kasir: 'credit-card',
  'Ruang Tunggu': 'home',
  Charging: 'battery-charging',
  Musik: 'music',
  Majalah: 'book-open',
};

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
  const [reviews, setReviews] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    fetchData();
  }, [barbershopId]);

  const fetchData = async () => {
    try {
      // Fetch detail barbershop
      const detailRes = await api.get(`/barbershops/detail/${barbershopId}`);
      setBarbershop(detailRes.data);

      // Fetch facilities
      if (
        detailRes.data.facilities &&
        Array.isArray(detailRes.data.facilities)
      ) {
        setFacilities(detailRes.data.facilities);
      }

      // Fetch review stats and reviews
      const reviewRes = await api.get(
        `/reviews/public/barbershop/${barbershopId}`,
      );
      setReviewStats(
        reviewRes.data.stats || { averageRating: 0, totalReviews: 0 },
      );
      // Get top 3 reviews for preview
      setReviews(reviewRes.data.reviews?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = imageUrl => {
    if (!imageUrl) return null;
    return imageUrl.startsWith('http')
      ? imageUrl
      : `http://10.0.2.2:5000${imageUrl}`;
  };

  const getStaffImageUrl = picture => {
    if (!picture) return null;
    return picture.startsWith('http')
      ? picture
      : `http://10.0.2.2:5000${picture}`;
  };

  const getFacilityIcon = facilityName => {
    // Try to match facility name with icon mapping
    for (const [key, icon] of Object.entries(FACILITY_ICONS)) {
      if (facilityName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return 'check-circle'; // default icon
  };

  const formatDate = dateString => {
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

  // Helper functions for operating hours
  const getDayName = dayIndex => {
    const days = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ];
    return days[dayIndex];
  };

  const getCurrentDaySchedule = openingHours => {
    try {
      if (!openingHours) return null;
      const schedule =
        typeof openingHours === 'string'
          ? JSON.parse(openingHours)
          : openingHours;
      const today = getDayName(new Date().getDay());
      return schedule[today];
    } catch (error) {
      console.error('Error parsing schedule:', error);
      return null;
    }
  };

  const isCurrentlyOpen = openingHours => {
    try {
      const todaySchedule = getCurrentDaySchedule(openingHours);
      if (!todaySchedule || !todaySchedule.aktif) return false;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [openHour, openMin] = todaySchedule.buka.split(':').map(Number);
      const [closeHour, closeMin] = todaySchedule.tutup.split(':').map(Number);

      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    } catch (error) {
      return false;
    }
  };

  // Animated header opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat detail...</Text>
      </View>
    );
  }

  if (!barbershop) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Barbershop tidak ditemukan</Text>
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
  const images = barbershop.images || [
    { image_url: barbershop.main_image_url },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Floating Header with Back Button */}
      <Animated.View
        style={[styles.floatingHeader, { opacity: headerOpacity }]}
      >
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {barbershop.name}
        </Text>
        <View style={styles.headerPlaceholder} />
      </Animated.View>

      {/* Back Button Overlay on Hero */}
      <TouchableOpacity
        style={styles.heroBackButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image Gallery */}
        <View style={styles.heroSection}>
          {imageError ? (
            <View style={[styles.heroImage, styles.heroFallback]}>
              <Icon name="image" size={64} color={COLORS.textTertiary} />
            </View>
          ) : (
            <Image
              source={{
                uri: getImageUrl(
                  images[selectedImageIndex]?.image_url ||
                    barbershop.main_image_url,
                ),
              }}
              style={styles.heroImage}
              onError={() => setImageError(true)}
              resizeMode="cover"
            />
          )}

          {/* Image Gallery Dots */}
          {images.length > 1 && (
            <View style={styles.galleryDots}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.dot,
                    selectedImageIndex === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Main Content Card */}
        <View style={styles.contentContainer}>
          {/* Header Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.barbershopName}>{barbershop.name}</Text>
                <View style={styles.locationRow}>
                  <Icon name="map-pin" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.location}>{barbershop.city}</Text>
                </View>
              </View>

              {/* Rating Badge */}
              <View style={styles.ratingBadge}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingText}>
                  {reviewStats && reviewStats.averageRating
                    ? Number(reviewStats.averageRating).toFixed(1)
                    : '0.0'}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="message-circle" size={18} color={COLORS.primary} />
                <Text style={styles.statValue}>
                  {reviewStats.totalReviews || 0}
                </Text>
                <Text style={styles.statLabel}>Ulasan</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Icon name="users" size={18} color={COLORS.primary} />
                <Text style={styles.statValue}>{activeStaff.length}</Text>
                <Text style={styles.statLabel}>Staff</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Icon name="scissors" size={18} color={COLORS.primary} />
                <Text style={styles.statValue}>
                  {barbershop.services?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Layanan</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="phone" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Hubungi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Icon name="navigation" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Petunjuk Arah</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Icon name="share-2" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Bagikan</Text>
            </TouchableOpacity>
          </View> */}

          {/* About Section */}
          {barbershop.description && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="info" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Tentang Kami</Text>
              </View>
              <Text style={styles.description}>{barbershop.description}</Text>
            </View>
          )}

          {/* Operating Hours Section - FIXED WITH DATABASE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="clock" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Jam Operasional</Text>
            </View>
            <View style={styles.scheduleContainer}>
              {barbershop.opening_hours ? (
                (() => {
                  try {
                    const schedule =
                      typeof barbershop.opening_hours === 'string'
                        ? JSON.parse(barbershop.opening_hours)
                        : barbershop.opening_hours;

                    const days = [
                      'Senin',
                      'Selasa',
                      'Rabu',
                      'Kamis',
                      'Jumat',
                      'Sabtu',
                      'Minggu',
                    ];
                    const currentDay = getDayName(new Date().getDay());

                    return days.map(day => {
                      const daySchedule = schedule[day];
                      const isToday = day === currentDay;

                      if (!daySchedule || !daySchedule.aktif) {
                        return (
                          <View
                            key={day}
                            style={[
                              styles.scheduleRow,
                              isToday && styles.scheduleTodayRow,
                            ]}
                          >
                            <Text
                              style={[
                                styles.scheduleDay,
                                isToday && styles.scheduleTodayText,
                              ]}
                            >
                              {day}
                              {isToday && ' (Hari ini)'}
                            </Text>
                            <Text
                              style={[
                                styles.scheduleTimeClosed,
                                isToday && styles.scheduleTodayText,
                              ]}
                            >
                              Tutup
                            </Text>
                          </View>
                        );
                      }

                      return (
                        <View
                          key={day}
                          style={[
                            styles.scheduleRow,
                            isToday && styles.scheduleTodayRow,
                          ]}
                        >
                          <Text
                            style={[
                              styles.scheduleDay,
                              isToday && styles.scheduleTodayText,
                            ]}
                          >
                            {day}
                            {isToday && ' (Hari ini)'}
                          </Text>
                          <Text
                            style={[
                              styles.scheduleTime,
                              isToday && styles.scheduleTodayText,
                            ]}
                          >
                            {daySchedule.buka} - {daySchedule.tutup}
                          </Text>
                        </View>
                      );
                    });
                  } catch (error) {
                    console.error('Error rendering schedule:', error);
                    return (
                      <Text style={styles.scheduleError}>
                        Tidak dapat menampilkan jadwal
                      </Text>
                    );
                  }
                })()
              ) : (
                <Text style={styles.scheduleError}>Jadwal tidak tersedia</Text>
              )}

              <View
                style={[
                  styles.statusBadge,
                  !isCurrentlyOpen(barbershop.opening_hours) &&
                    styles.statusBadgeClosed,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    !isCurrentlyOpen(barbershop.opening_hours) &&
                      styles.statusDotClosed,
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    !isCurrentlyOpen(barbershop.opening_hours) &&
                      styles.statusTextClosed,
                  ]}
                >
                  {isCurrentlyOpen(barbershop.opening_hours)
                    ? 'Buka Sekarang'
                    : 'Tutup Sekarang'}
                </Text>
              </View>
            </View>
          </View>

          {/* Staff Section */}
          {activeStaff.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="users" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Tim Profesional Kami</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.staffContainer}
              >
                {activeStaff.map(staff => (
                  <View key={staff.staff_id} style={styles.staffCard}>
                    {staff.picture ? (
                      <Image
                        source={{ uri: getStaffImageUrl(staff.picture) }}
                        style={styles.staffAvatar}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.staffAvatar,
                          styles.staffAvatarPlaceholder,
                        ]}
                      >
                        <Text style={styles.staffInitial}>
                          {staff.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.staffName} numberOfLines={1}>
                      {staff.name}
                    </Text>
                    {staff.specialty && (
                      <View style={styles.specialtyBadge}>
                        <Text style={styles.specialtyText}>
                          {staff.specialty}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Services Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="scissors" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Layanan Tersedia</Text>
            </View>

            {barbershop.services && barbershop.services.length > 0 ? (
              <View style={styles.servicesContainer}>
                {barbershop.services.map((service, index) => (
                  <View
                    key={service.service_id}
                    style={[
                      styles.serviceCard,
                      index === barbershop.services.length - 1 &&
                        styles.serviceCardLast,
                    ]}
                  >
                    <View style={styles.serviceHeader}>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        {service.description && (
                          <Text
                            style={styles.serviceDescription}
                            numberOfLines={2}
                          >
                            {service.description}
                          </Text>
                        )}
                        <View style={styles.serviceMeta}>
                          <View style={styles.metaItem}>
                            <Icon
                              name="clock"
                              size={12}
                              color={COLORS.textSecondary}
                            />
                            <Text style={styles.metaText}>
                              {service.duration_minutes} menit
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.servicePriceContainer}>
                        <Text style={styles.servicePrice}>
                          Rp{Number(service.price).toLocaleString('id-ID')}
                        </Text>
                        <TouchableOpacity
                          style={styles.bookButton}
                          onPress={() =>
                            navigation.navigate('Booking', {
                              service,
                              barbershop,
                            })
                          }
                        >
                          <Text style={styles.bookButtonText}>Pesan</Text>
                          <Icon name="arrow-right" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="scissors" size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>Belum ada layanan tersedia</Text>
              </View>
            )}
          </View>

          {/* Facilities Section - FROM DATABASE */}
          {facilities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="check-circle" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Fasilitas</Text>
              </View>
              <View style={styles.facilitiesGrid}>
                {facilities.map((facility, index) => (
                  <View key={index} style={styles.facilityItem}>
                    <Icon
                      name={getFacilityIcon(facility.name)}
                      size={18}
                      color={COLORS.primary}
                    />
                    <Text style={styles.facilityText}>{facility.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews Section - DETAILED WITH PREVIEW */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="message-circle" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Ulasan Pelanggan</Text>
            </View>

            {/* Rating Summary */}
            <View style={styles.ratingsSummary}>
              <View style={styles.ratingScoreContainer}>
                <Text style={styles.ratingScore}>
                  {reviewStats && reviewStats.averageRating
                    ? Number(reviewStats.averageRating).toFixed(1)
                    : '0.0'}
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Icon
                      key={star}
                      name="star"
                      size={16}
                      color={
                        star <= Math.round(reviewStats?.averageRating || 0)
                          ? COLORS.warning
                          : COLORS.border
                      }
                      style={{ marginRight: 3 }}
                    />
                  ))}
                </View>
                <Text style={styles.reviewsTotalCount}>
                  Berdasarkan {reviewStats.totalReviews} ulasan
                </Text>
              </View>
            </View>

            {/* Reviews List Preview */}
            {reviews.length > 0 ? (
              <View style={styles.reviewsList}>
                {reviews.map(review => (
                  <View key={review.review_id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerInfo}>
                        <View style={styles.reviewerAvatar}>
                          <Text style={styles.reviewerInitial}>
                            {review.customer?.name?.charAt(0).toUpperCase() ||
                              'U'}
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
                                  size={12}
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
                      <Text style={styles.reviewComment} numberOfLines={3}>
                        {review.comment}
                      </Text>
                    )}
                    {review.service_name && (
                      <View style={styles.reviewServiceBadge}>
                        <Icon
                          name="scissors"
                          size={10}
                          color={COLORS.textSecondary}
                        />
                        <Text style={styles.reviewServiceText}>
                          {review.service_name}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}

                {/* View All Reviews Button */}
                {reviewStats.totalReviews > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllReviewsButton}
                    onPress={() =>
                      navigation.navigate('ReviewsPage', {
                        barbershopId,
                        barbershopName: barbershop.name,
                        reviewStats,
                      })
                    }
                  >
                    <Text style={styles.viewAllReviewsText}>
                      Lihat Semua {reviewStats.totalReviews} Ulasan
                    </Text>
                    <Icon
                      name="chevron-right"
                      size={18}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon
                  name="message-circle"
                  size={48}
                  color={COLORS.textTertiary}
                />
                <Text style={styles.emptyText}>Belum ada ulasan</Text>
              </View>
            )}
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={styles.stickyBottom}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>Mulai dari</Text>
          <Text style={styles.priceValue}>
            Rp
            {barbershop.services && barbershop.services.length > 0
              ? Math.min(
                  ...barbershop.services.map(s => Number(s.price)),
                ).toLocaleString('id-ID')
              : '0'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => {
            if (barbershop.services && barbershop.services.length > 0) {
              navigation.navigate('Booking', {
                service: barbershop.services[0],
                barbershop,
              });
            }
          }}
        >
          <Text style={styles.ctaButtonText}>Pilih Layanan</Text>
          <Icon name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  // Floating Header
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerPlaceholder: {
    width: 40,
  },

  // Hero Section
  heroSection: {
    position: 'relative',
    height: 320,
    backgroundColor: COLORS.surface,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
  },
  heroFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBackButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  galleryDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#FFFFFF',
  },

  // Content Container
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  barbershopName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginTop: 6,
    fontWeight: '600',
  },

  // Sections
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },

  // Schedule
  scheduleContainer: {
    gap: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  scheduleDay: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  scheduleTime: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  scheduleTodayRow: {
    backgroundColor: '#F0F9FF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  scheduleTodayText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  scheduleTimeClosed: {
    fontSize: 15,
    color: COLORS.error,
    fontWeight: '600',
  },
  scheduleError: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusBadgeClosed: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  statusDotClosed: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '600',
  },
  statusTextClosed: {
    color: COLORS.error,
  },

  // Staff
  staffContainer: {
    paddingRight: 20,
  },
  staffCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  staffAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.border,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#F5F3FF',
  },
  staffAvatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffInitial: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  staffName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  specialtyBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Services
  servicesContainer: {
    gap: 12,
  },
  serviceCard: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  serviceCardLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  servicePriceContainer: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Facilities
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  facilityText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // Reviews Detailed
  ratingsSummary: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  ratingScoreContainer: {
    alignItems: 'center',
  },
  ratingScore: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewsTotalCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  reviewsList: {
    gap: 16,
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
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
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  reviewServiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  reviewServiceText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  viewAllReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  viewAllReviewsText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 8,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginTop: 12,
    fontWeight: '500',
  },

  // Sticky Bottom CTA
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default BarbershopDetailPage;