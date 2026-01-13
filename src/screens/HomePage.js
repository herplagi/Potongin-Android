// src/screens/HomePage.js - GAYA KREATIF & IMMERSIVE
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import BarbershopCard from '../components/BarbershopCard';
import ServiceCategories from '../components/ServiceCategories';
import UpcomingScheduleCard from '../components/UpcomingScheduleCard';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Palet warna utama (sesuai dengan desain sebelumnya)
const COLORS = {
  primary: '#4F46E5',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  textPrimary: '#1E1B4B',
  textSecondary: '#6B6A82',
};

const SIZES = {
  padding: 16,
  margin: 20,
  radius: 16,
  h1: 28,
  h2: 20,
  body: 15,
  caption: 13,
};

const HomePage = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [barbershops, setBarbershops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [upcomingBooking, setUpcomingBooking] = useState(null);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setUseMyLocation(true);
      },
      (error) => {
        console.log('❌ Error getting location:', error);
        Alert.alert(
          'Lokasi Gagal',
          'Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi diberikan dan GPS aktif.',
          [{ text: 'OK' }]
        );
        setUseMyLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchBarbershops = useCallback(async () => {
    try {
      let url = '/barbershops';
      const params = [];

      if (useMyLocation && userLocation) {
        params.push(`latitude=${userLocation.latitude}`);
        params.push(`longitude=${userLocation.longitude}`);
        params.push(`max_distance=0.5`); // 500 meter
      }

      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const response = await api.get(url);
      setBarbershops(response.data);
    } catch (error) {
      console.error('❌ Gagal memuat barbershop:', error);
      Alert.alert('Error', 'Gagal memuat daftar barbershop.');
    } finally {
      setLoading(false);
    }
  }, [useMyLocation, userLocation]);

  const fetchUpcomingBooking = useCallback(async () => {
    try {
      const response = await api.get('/bookings/upcoming');
      if (response.data && response.data.length > 0) {
        setUpcomingBooking(response.data[0]);
      }
    } catch (error) {
      // Silently fail - upcoming booking is optional
      console.log('No upcoming bookings found');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBarbershops();
    fetchUpcomingBooking();
  }, [fetchBarbershops, fetchUpcomingBooking]);

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      {/* Greeting with Notification Icon */}
      <View style={styles.topBar}>
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>Hi, {user?.name || 'Tamu'} 👋</Text>
          <Text style={styles.locationText}>📍 {user?.city || 'Jakarta'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="notifications" size={24} color={COLORS.textPrimary} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            placeholder="Cari barbershop..."
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
            editable={false}
          />
        </View>
      </View>

      {/* Service Categories */}
      <ServiceCategories onSelectCategory={() => {}} />

      {/* Upcoming Schedule */}
      {upcomingBooking && (
        <UpcomingScheduleCard 
          booking={upcomingBooking}
          onDetailPress={() => navigation.navigate('Riwayat')}
        />
      )}

      {/* Location Filter Chip */}
      <View style={styles.filterContainer}>
        <Pressable
          style={[
            styles.locationChip,
            useMyLocation && styles.locationChipActive,
          ]}
          onPress={() => {
            if (!useMyLocation) {
              getCurrentLocation();
            } else {
              setUseMyLocation(false);
              setUserLocation(null);
            }
          }}
          android_ripple={{ color: useMyLocation ? '#E0D6FF' : '#D1C4E9' }}
        >
          <Icon
            name={useMyLocation ? 'location-on' : 'location-off'}
            size={18}
            color={useMyLocation ? 'white' : COLORS.primary}
          />
          <Text
            style={[
              styles.locationChipText,
              useMyLocation && styles.locationChipTextActive,
            ]}
          >
            {useMyLocation ? 'Terdekat' : 'Lihat Semua'}
          </Text>
        </Pressable>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>
        {useMyLocation ? 'Rekomendasi Terdekat' : 'Barbershop Populer'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Menemukan barbershop terbaik untuk Anda...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={barbershops}
        keyExtractor={(item) => item.barbershop_id}
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerWrapper: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  locationText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputWrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  filterContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  locationChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  locationChipText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: SIZES.caption,
    marginLeft: 8,
  },
  locationChipTextActive: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
});

export default HomePage;