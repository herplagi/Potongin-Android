// Potongin/src/screens/HomePage.js - WITH DISTANCE OPTIONS
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  Pressable,
  StatusBar,
  RefreshControl,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import BarbershopCard from '../components/BarbershopCard';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../theme/theme';

const HomePage = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [barbershops, setBarbershops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [profilePicture, setProfilePicture] = useState(null);
  const [maxDistance, setMaxDistance] = useState(0.5); // ✅ TAMBAH state untuk jarak

  const searchTimeoutRef = useRef(null);

  const categories = [
    { id: 'all', label: 'Semua', icon: 'grid' },
    { id: 'nearby', label: 'Terdekat', icon: 'navigation' },
    { id: 'popular', label: 'Populer', icon: 'trending-up' },
    { id: 'top-rated', label: 'Rating Tinggi', icon: 'star' },
  ];

  // ✅ Opsi jarak dalam kilometer
  const distanceOptions = [
    { value: 0.1, label: '100 m', displayKm: false },
    { value: 0.3, label: '300 m', displayKm: false },
    { value: 0.5, label: '500 m', displayKm: false },
    { value: 1, label: '1 km', displayKm: true },
  ];

  useFocusEffect(
    useCallback(() => {
      const fetchUserProfile = async () => {
        try {
          const response = await api.get('/users/profile');
          console.log('Profile response:', response.data);
          if (response.data.profile_picture) {
            setProfilePicture(response.data.profile_picture);
            console.log('Profile picture set:', response.data.profile_picture);
          }
        } catch (error) {
          console.log(
            'Failed to fetch profile picture:',
            error.response?.data || error.message,
          );
        }
      };

      if (user) {
        fetchUserProfile();
      }
    }, [user]),
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setUseMyLocation(true);
        setFilterCategory('nearby');
      },
      error => {
        Alert.alert(
          'Lokasi Gagal',
          'Pastikan izin lokasi diberikan dan GPS aktif.',
        );
        setUseMyLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const fetchBarbershops = useCallback(
    async (isRefreshing = false) => {
      try {
        if (!isRefreshing) setLoading(true);

        let url = '/barbershops';
        const params = [];

        if (useMyLocation && userLocation) {
          params.push(`latitude=${userLocation.latitude}`);
          params.push(`longitude=${userLocation.longitude}`);
          params.push(`max_distance=${maxDistance}`); // ✅ Gunakan state maxDistance
        }

        if (filterCategory === 'popular') {
          params.push('sort=popular');
        } else if (filterCategory === 'top-rated') {
          params.push('sort=rating');
        }

        if (debouncedSearchQuery.trim()) {
          params.push(
            `search=${encodeURIComponent(debouncedSearchQuery.trim())}`,
          );
        }

        if (params.length > 0) url += '?' + params.join('&');

        const response = await api.get(url);
        setBarbershops(response.data);
      } catch (error) {
        Alert.alert('Error', 'Gagal memuat daftar barbershop.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      useMyLocation,
      userLocation,
      filterCategory,
      debouncedSearchQuery,
      maxDistance,
    ],
  ); // ✅ Tambah maxDistance dependency

  useEffect(() => {
    fetchBarbershops();
  }, [fetchBarbershops]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBarbershops(true);
  };

  const handleCategoryPress = categoryId => {
    if (categoryId === 'nearby') {
      if (!userLocation) {
        getCurrentLocation();
      } else {
        setUseMyLocation(true);
        setFilterCategory(categoryId);
      }
    } else {
      setUseMyLocation(false);
      setFilterCategory(categoryId);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  const getProfileImageUrl = () => {
    if (!profilePicture) return null;
    const url = profilePicture.startsWith('http')
      ? profilePicture
      : `http://10.0.2.2:5000${profilePicture}`;
    console.log('Profile image URL:', url);
    return url;
  };

  // ✅ Handler untuk ubah jarak
  const handleDistanceChange = distance => {
    setMaxDistance(distance);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <Text style={styles.greetingText}>
            Halo, {user?.name?.split(' ')[0] || 'Tamu'} 👋
          </Text>
          <Text style={styles.subtitleText}>
            Temukan barbershop terbaik untukmu
          </Text>
        </View>
        <Pressable
          style={styles.profileButton}
          onPress={() => navigation.navigate('Akun')}
        >
          {profilePicture ? (
            <Image
              key={profilePicture}
              source={{ uri: getProfileImageUrl() }}
              style={styles.profileImage}
              onError={e => {
                console.log('Image load error:', e.nativeEvent.error);
                setProfilePicture(null);
              }}
            />
          ) : (
            <View style={styles.profileCircle}>
              <Text style={styles.profileInitial}>
                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          placeholder="Cari barbershop atau layanan..."
          placeholderTextColor={COLORS.textTertiary}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={handleClearSearch} hitSlop={8}>
            <Icon name="x-circle" size={18} color={COLORS.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Search Indicator */}
      {searchQuery !== debouncedSearchQuery && searchQuery.length > 0 && (
        <View style={styles.searchingIndicator}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.searchingText}>Mencari...</Text>
        </View>
      )}

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        {categories.map(category => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryPill,
              filterCategory === category.id && styles.categoryPillActive,
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Icon
              name={category.icon}
              size={14}
              color={
                filterCategory === category.id
                  ? COLORS.textInverse
                  : COLORS.textSecondary
              }
            />
            <Text
              style={[
                styles.categoryText,
                filterCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ✅ Distance Options - Hanya tampil jika filter "Terdekat" aktif */}
      {filterCategory === 'nearby' && useMyLocation && (
        <View style={styles.distanceSection}>
          <View style={styles.distanceHeader}>
            <Icon name="map-pin" size={14} color={COLORS.textSecondary} />
            <Text style={styles.distanceLabel}>Radius Pencarian:</Text>
          </View>
          <View style={styles.distanceOptions}>
            {distanceOptions.map(option => (
              <Pressable
                key={option.value}
                style={[
                  styles.distanceChip,
                  maxDistance === option.value && styles.distanceChipActive,
                ]}
                onPress={() => handleDistanceChange(option.value)}
              >
                <Text
                  style={[
                    styles.distanceChipText,
                    maxDistance === option.value &&
                      styles.distanceChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle} numberOfLines={1}>
          {debouncedSearchQuery.trim()
            ? `Hasil "${debouncedSearchQuery}"`
            : filterCategory === 'nearby' && useMyLocation
            ? `Di Sekitarmu (${
                maxDistance >= 1
                  ? `${maxDistance} km`
                  : `${maxDistance * 1000} m`
              })`
            : filterCategory === 'popular'
            ? 'Paling Populer'
            : filterCategory === 'top-rated'
            ? 'Rating Tertinggi'
            : 'Semua Barbershop'}
        </Text>
        <Text style={styles.resultsCount}>{barbershops.length} tempat</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Mencari barbershop terbaik...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <FlatList
        data={barbershops}
        keyExtractor={item => item.barbershop_id}
        renderItem={({ item }) => (
          <BarbershopCard
            shop={item}
            onPress={() =>
              navigation.navigate('BarbershopDetail', {
                barbershopId: item.barbershop_id,
              })
            }
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>Tidak ada barbershop</Text>
            <Text style={styles.emptySubtitle}>
              {debouncedSearchQuery
                ? 'Coba kata kunci lain'
                : filterCategory === 'nearby'
                ? `Tidak ada barbershop dalam radius ${
                    maxDistance >= 1
                      ? `${maxDistance} km`
                      : `${maxDistance * 1000} m`
                  }`
                : 'Belum ada barbershop terdaftar'}
            </Text>
          </View>
        )}
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
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  headerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  welcomeContent: {
    flex: 1,
  },
  greetingText: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitleText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  profileButton: {
    marginLeft: SPACING.md,
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.borderLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileInitial: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
    paddingVertical: SPACING.xs,
    height: 40,
  },
  searchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  searchingText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    fontWeight: TYPOGRAPHY.medium,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.md,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  categoryTextActive: {
    color: COLORS.textInverse,
  },

  // ✅ Distance Options Styles
  distanceSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  distanceLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  distanceChip: {
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  distanceChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  distanceChipText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textSecondary,
  },
  distanceChipTextActive: {
    color: COLORS.textInverse,
  },

  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultsTitle: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  resultsCount: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default HomePage;
