// src/screens/AccountPage.js - GAYA KREATIF & IMMERSIVE
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const AccountPage = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Keluar",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Keluar", style: "destructive", onPress: () => logout() }
      ]
    );
  };

  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Nama Tidak Tersedia'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <Text style={styles.profilePhone}>
            {user?.phone_number || 'Nomor telepon tidak tersedia'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => Alert.alert("Info", "Fitur edit profil akan segera hadir!")}
        >
          <Text style={styles.editButtonText}>Edit Profil</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {[
          { icon: '📋', title: 'Riwayat Booking', subtitle: 'Lihat semua pesanan Anda', screen: 'MyBookings' },
          { icon: '⭐', title: 'Ulasan Saya', subtitle: 'Lihat ulasan yang telah Anda berikan', screen: 'MyReviews' },
          { icon: '⚙️', title: 'Pengaturan Akun', subtitle: 'Ubah password, notifikasi, dll', screen: 'Settings' },
          { icon: '❓', title: 'Pusat Bantuan', subtitle: 'FAQ & Hubungi Admin', screen: 'HelpCenter' },
          { icon: 'ℹ️', title: 'Tentang Aplikasi', subtitle: 'Versi, Kebijakan Privasi, Syarat & Ketentuan', screen: 'AboutApp' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigateTo(item.screen)}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    minWidth: 150,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#4C4B63',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },

  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B6A82',
  },
  menuArrow: {
    fontSize: 22,
    color: '#A7A6BB',
  },

  logoutContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: '#B91C1C',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AccountPage;