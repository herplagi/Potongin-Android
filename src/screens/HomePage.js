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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); // ✅ TAMBAH state untuk debounced search
  const [filterCategory, setFilterCategory] = useState('all');
  
  // ✅ TAMBAH useRef untuk debounce timer
  const searchTimeoutRef = useRef(null);

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'Semua', icon: 'grid' },
    { id: 'nearby', label: 'Terdekat', icon: 'navigation' },
    { id: 'popular', label: 'Populer', icon: 'trending-up' },
    { id: 'top-rated', label: 'Rating Tinggi', icon: 'star' },
  ];

  // ✅ TAMBAH useEffect untuk debounce search query
  useEffect(() => {
    // Clear timeout sebelumnya
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set timeout baru - tunggu 500ms setelah user berhenti mengetik
    searchTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Debounced search:', searchQuery);
      setDebouncedSearchQuery(searchQuery);
    }, 800); // ✅ 500ms delay, bisa disesuaikan (300-800ms)

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setUseMyLocation(true);
        setFilterCategory('nearby');
      },
      (error) => {
        Alert.alert('Lokasi Gagal', 'Pastikan izin lokasi diberikan dan GPS aktif.');
        setUseMyLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchBarbershops = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      
      let url = '/barbershops';
      const params = [];
      
      // Location filter
      if (useMyLocation && userLocation) {
        params.push(`latitude=${userLocation.latitude}`);
        params.push(`longitude=${userLocation.longitude}`);
        params.push(`max_distance=5`);
      }
      
      // Category filter
      if (filterCategory === 'popular') {
        params.push('sort=popular');
      } else if (filterCategory === 'top-rated') {
        params.push('sort=rating');
      }
      
      // Search filter - ✅ GUNAKAN debouncedSearchQuery
      if (debouncedSearchQuery.trim()) {
        params.push(`search=${encodeURIComponent(debouncedSearchQuery.trim())}`);
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
  }, [useMyLocation, userLocation, filterCategory, debouncedSearchQuery]); // ✅ GANTI searchQuery dengan debouncedSearchQuery

  useEffect(() => {
    fetchBarbershops();
  }, [fetchBarbershops]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBarbershops(true);
  };

  const handleCategoryPress = (categoryId) => {
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

  // ✅ TAMBAH fungsi untuk handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery(''); // Clear immediately
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
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Search Bar - ✅ HAPUS Pressable wrapper yang disable input */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          placeholder="Cari barbershop atau layanan..."
          placeholderTextColor={COLORS.textTertiary}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search" // ✅ TAMBAH untuk keyboard
          autoCorrect={false} // ✅ TAMBAH
          autoCapitalize="none" // ✅ TAMBAH
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={handleClearSearch}>
            <Icon name="x-circle" size={18} color={COLORS.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* ✅ TAMBAH Search Indicator */}
      {searchQuery !== debouncedSearchQuery && searchQuery.length > 0 && (
        <View style={styles.searchingIndicator}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.searchingText}>Mencari...</Text>
        </View>
      )}

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
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
              color={filterCategory === category.id ? COLORS.textInverse : COLORS.textSecondary}
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

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {debouncedSearchQuery.trim() ? `Hasil pencarian "${debouncedSearchQuery}"` :
           filterCategory === 'nearby' && useMyLocation
            ? 'Di Sekitarmu'
            : filterCategory === 'popular'
            ? 'Paling Populer'
            : filterCategory === 'top-rated'
            ? 'Rating Tertinggi'
            : 'Semua Barbershop'}
        </Text>
        <Text style={styles.resultsCount}>
          {barbershops.length} tempat
        </Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <FlatList
        data={barbershops}
        keyExtractor={(item) => item.barbershop_id}
        renderItem={({ item }) => (
          <BarbershopCard
            shop={item}
            onPress={() => navigation.navigate('BarbershopDetail', { barbershopId: item.barbershop_id })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>Tidak ada barbershop</Text>
            <Text style={styles.emptySubtitle}>
              {debouncedSearchQuery ? 'Coba kata kunci lain' : 'Belum ada barbershop terdaftar'}
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

// ✅ TAMBAH styles untuk searching indicator
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
    marginTop: SPACING.base,
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  headerContainer: {
    paddingHorizontal: SPACING.screenPadding,
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
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitleText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  profileButton: {
    marginLeft: SPACING.base,
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  profileInitial: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textInverse,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.base,
    height: 52,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm, // ✅ Ubah dari base ke sm
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  // ✅ TAMBAH style baru
  searchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  searchingText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.textInverse,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  resultsTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
  },
  resultsCount: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.base,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default HomePage;