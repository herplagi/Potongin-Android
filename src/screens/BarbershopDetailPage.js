// src/screens/BarbershopDetailPage.js - UPDATED dengan Staff Section
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

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/barbershops/detail/${barbershopId}`);
        console.log('📥 Barbershop detail:', response.data);
        setBarbershop(response.data);
      } catch (error) {
        console.error('Gagal memuat detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [barbershopId]);

  const getImageUrl = () => {
    if (!barbershop) return null;
    
    if (barbershop.main_image_url) {
      if (barbershop.main_image_url.startsWith('http')) {
        return barbershop.main_image_url;
      } else {
        return `http://10.0.2.2:5000${barbershop.main_image_url}`;
      }
    }
    
    return `https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=300&fit=crop`;
  };

  const getStaffImageUrl = (picture) => {
    if (!picture) return null;
    if (picture.startsWith('http')) {
      return picture;
    }
    return `http://10.0.2.2:5000${picture}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Memuat detail barbershop...</Text>
      </View>
    );
  }

  if (!barbershop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Barbershop tidak ditemukan.</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Filter hanya staff yang aktif
  const activeStaff = barbershop.staff?.filter(s => s.is_active) || [];

  return (
    <ScrollView style={styles.container}>
      {/* Hero Image */}
      <Image
        source={{ uri: getImageUrl() }}
        style={styles.heroImage}
        onError={(error) => {
          console.log('❌ Image load error:', error.nativeEvent.error);
          setImageError(true);
        }}
        onLoad={() => {
          console.log('✅ Image loaded successfully');
          setImageError(false);
        }}
      />
      
      {imageError && (
        <View style={[styles.heroImage, styles.placeholderContainer]}>
          <Text style={styles.placeholderText}>📷</Text>
          <Text style={styles.placeholderSubtext}>Foto tidak tersedia</Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        {/* Title & Address */}
        <Text style={styles.title}>{barbershop.name}</Text>
        <Text style={styles.address}>
          {barbershop.address}, {barbershop.city}
        </Text>

        {/* Rating Section */}
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ 4.8</Text>
          <Text style={styles.reviews}>(251 ulasan)</Text>
        </View>

        {/* Deskripsi */}
        {barbershop.description && (
          <View style={styles.descriptionSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderIcon}>ℹ️</Text>
              <Text style={styles.sectionHeaderText}>Tentang Barbershop</Text>
            </View>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                {barbershop.description}
              </Text>
            </View>
          </View>
        )}

        {/* ✅ NEW: Staff Section */}
        {activeStaff.length > 0 && (
          <View style={styles.staffSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderIcon}>👨‍💼</Text>
              <Text style={styles.sectionHeaderText}>Tim Kapster Kami</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.staffScrollView}
            >
              {activeStaff.map((staff) => (
                <View key={staff.staff_id} style={styles.staffCard}>
                  {staff.picture ? (
                    <Image
                      source={{ uri: getStaffImageUrl(staff.picture) }}
                      style={styles.staffPhoto}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.staffPhotoPlaceholder}>
                      <Text style={styles.staffPhotoPlaceholderText}>
                        {staff.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.staffName}>{staff.name}</Text>
                  {staff.specialty && (
                    <Text style={styles.staffSpecialty}>{staff.specialty}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Services Section */}
        <Text style={styles.sectionTitle}>Pilih Layanan</Text>
        {barbershop.services && barbershop.services.length > 0 ? (
          barbershop.services.map(service => (
            <View key={service.service_id} style={styles.serviceCard}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDesc}>{service.description}</Text>
                <Text style={styles.serviceDuration}>
                  ⏱️ Durasi: {service.duration_minutes} menit
                </Text>
              </View>
              <View style={styles.serviceAction}>
                <Text style={styles.servicePrice}>
                  Rp {Number(service.price).toLocaleString('id-ID')}
                </Text>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() =>
                    navigation.navigate('Booking', {
                      service: service,
                      barbershop: barbershop,
                    })
                  }
                >
                  <Text style={styles.bookButtonText}>Pesan</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noServiceContainer}>
            <Text style={styles.noServiceText}>
              Belum ada layanan yang tersedia.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'white' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'white'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: { 
    textAlign: 'center', 
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  heroImage: { 
    width: '100%', 
    height: 250,
    backgroundColor: '#E5E7EB'
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  contentContainer: { 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1E293B' 
  },
  address: { 
    fontSize: 16, 
    color: '#64748B', 
    marginTop: 4 
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  reviews: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  
  // Deskripsi Styles
  descriptionSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  descriptionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },

  // ✅ NEW: Staff Styles
  staffSection: {
    marginBottom: 24,
  },
  staffScrollView: {
    marginTop: 12,
  },
  staffCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  staffPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#4F46E5',
    backgroundColor: '#E5E7EB',
  },
  staffPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  staffPhotoPlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  staffName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
  },
  staffSpecialty: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceInfo: { 
    flex: 1, 
    marginRight: 10 
  },
  serviceName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#334155' 
  },
  serviceDesc: { 
    fontSize: 14, 
    color: '#64748B', 
    marginTop: 4 
  },
  serviceDuration: { 
    fontSize: 12, 
    color: '#94A3B8', 
    marginTop: 8 
  },
  serviceAction: { 
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  servicePrice: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1E293B' 
  },
  bookButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  bookButtonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  noServiceContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noServiceText: { 
    color: '#64748B',
    fontSize: 14,
  },
});

export default BarbershopDetailPage;