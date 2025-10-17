// src/screens/AccountPage.js (pastikan pathnya sesuai dengan lokasi file kamu)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native'; // Tambahkan import hook ini

const AccountPage = () => {
    const navigation = useNavigation(); // Gunakan hook untuk mendapatkan navigation
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

    // Fungsi untuk menavigasi ke halaman lain
    const navigateTo = (screenName) => {
        // Karena AccountPage ada di Tab, kita bisa langsung navigate
        navigation.navigate(screenName);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileSection}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>
                <Text style={styles.profileName}>{user?.name || 'Nama Tidak Tersedia'}</Text>
                <Text style={styles.profileDetail}>{user?.email}</Text>
                <Text style={styles.profileDetail}>{user?.phone_number || 'Nomor Telepon Tidak Tersedia'}</Text>
                {/* Contoh navigasi ke Edit Profile */}
                {/* Karena Edit Profile mungkin halaman kecil, bisa saja dibuka sebagai Modal */}
                {/* <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigateTo('EditProfile')}
                >
                    <Text style={styles.editButtonText}>Edit Profil</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => Alert.alert("Info", "Fitur edit profil akan segera hadir!")}
                >
                    <Text style={styles.editButtonText}>Edit Profil</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.menuSection}>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigateTo('MyBookings')} // Navigasi ke Stack 'MyBookings' di Tab
                >
                    <View style={styles.menuIcon}>
                        <Text>📋</Text>
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>Riwayat Booking</Text>
                        <Text style={styles.menuSubText}>Lihat semua pesanan Anda</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigateTo('MyReviews')} // Navigasi ke Stack 'MyReviews' di Tab
                >
                    <View style={styles.menuIcon}>
                        <Text>⭐</Text>
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>Ulasan Saya</Text>
                        <Text style={styles.menuSubText}>Lihat ulasan yang telah Anda berikan</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigateTo('Settings')} // Navigasi ke Stack 'Settings' di Tab
                >
                    <View style={styles.menuIcon}>
                        <Text>⚙️</Text>
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>Pengaturan Akun</Text>
                        <Text style={styles.menuSubText}>Ubah password, notifikasi, dll</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigateTo('HelpCenter')} // Navigasi ke Stack 'HelpCenter' di Tab
                >
                    <View style={styles.menuIcon}>
                        <Text>❓</Text>
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>Pusat Bantuan</Text>
                        <Text style={styles.menuSubText}>FAQ & Hubungi Admin</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigateTo('AboutApp')} // Navigasi ke Stack 'AboutApp' di Tab
                >
                    <View style={styles.menuIcon}>
                        <Text>ℹ️</Text>
                    </View>
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>Tentang Aplikasi</Text>
                        <Text style={styles.menuSubText}>Versi, Kebijakan Privasi, Syarat & Ketentuan</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.logoutSection}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Keluar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    profileSection: {
        backgroundColor: 'white',
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    profileDetail: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 5,
    },
    editButton: {
        marginTop: 10,
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    editButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    menuSection: {
        backgroundColor: 'white',
        marginTop: 10,
        marginHorizontal: 15,
        borderRadius: 8,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    // Komentar ini tidak berlaku untuk StyleSheet, hapus saja
    // menuItem:lastChild: { ... } // CSS-only, tidak bisa di StyleSheet React Native
    // Sebagai gantinya, kita bisa menangani ini secara logis atau menggunakan View terpisah jika diperlukan
    // Untuk saat ini, kita abaikan agar tetap sederhana, atau tambahkan View kosong jika perlu.
    menuIcon: {
        width: 30,
        alignItems: 'center',
    },
    menuTextContainer: {
        flex: 1,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
    },
    menuSubText: {
        fontSize: 12,
        color: 'gray',
    },
    arrow: {
        fontSize: 18,
        color: '#ccc',
    },
    logoutSection: {
        padding: 20,
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default AccountPage;