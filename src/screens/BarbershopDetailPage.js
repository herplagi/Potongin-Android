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
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../services/api';

const BarbershopDetailPage = () => {
  const route = useRoute();
  const { barbershopId } = route.params; // Mengambil ID yang dikirim dari homepage

  const [barbershop, setBarbershop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // --- PERBAIKI URL DI SINI ---
        const response = await api.get(`/barbershops/detail/${barbershopId}`);
        setBarbershop(response.data);
      } catch (error) {
        console.error('Gagal memuat detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [barbershopId]);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
    );
  }
  if (!barbershop) {
    return <Text style={styles.errorText}>Barbershop tidak ditemukan.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri:
            'https://via.placeholder.com/400x200.png?text=' + barbershop.name,
        }}
        style={styles.heroImage}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{barbershop.name}</Text>
        <Text style={styles.address}>
          {barbershop.address}, {barbershop.city}
        </Text>

        <Text style={styles.sectionTitle}>Pilih Layanan</Text>
        {barbershop.services && barbershop.services.length > 0 ? (
          barbershop.services.map(service => (
            <View key={service.service_id} style={styles.serviceCard}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDesc}>{service.description}</Text>
                <Text style={styles.serviceDuration}>
                  Durasi: {service.duration_minutes} menit
                </Text>
              </View>
              <View style={styles.serviceAction}>
                <Text style={styles.servicePrice}>
                  Rp {Number(service.price).toLocaleString('id-ID')}
                </Text>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Pesan</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noServiceText}>
            Belum ada layanan yang tersedia.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { textAlign: 'center', marginTop: 20 },
  heroImage: { width: '100%', height: 220 },
  contentContainer: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  address: { fontSize: 16, color: '#64748B', marginTop: 4 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
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
  serviceInfo: { flex: 1, marginRight: 10 },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  serviceDesc: { fontSize: 14, color: '#64748B', marginTop: 4 },
  serviceDuration: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
  serviceAction: { alignItems: 'flex-end' },
  servicePrice: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  bookButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  bookButtonText: { color: 'white', fontWeight: 'bold' },
  noServiceText: { color: '#64748B' },
});

export default BarbershopDetailPage;
