// src/screens/HomePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Alert, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import BarbershopCard from '../components/BarbershopCard';
import Geolocation from '@react-native-community/geolocation';
import { COLORS, SIZES } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomePage = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [barbershops, setBarbershops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [useMyLocation, setUseMyLocation] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log('📍 Lokasi pengguna diambil:', { latitude, longitude });
                setUserLocation({ latitude, longitude });
                setUseMyLocation(true);
            },
            (error) => {
                console.log('❌ Error getting location:', error);
                Alert.alert(
                    "Lokasi Gagal",
                    "Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi diberikan dan GPS aktif.",
                    [{ text: "OK" }]
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
                console.log('📍 Menggunakan lokasi pengguna untuk filter:', userLocation);
                params.push(`latitude=${userLocation.latitude}`);
                params.push(`longitude=${userLocation.longitude}`);
                params.push(`max_distance=20`);
            }

            if (params.length > 0) {
                url += '?' + params.join('&');
            }

            console.log('📡 Fetching barbershops dari URL:', `http://10.0.2.2:5000/api${url}`);

            const response = await api.get(url);
            console.log('📥 Data barbershop diterima:', response.data);
            setBarbershops(response.data);
        } catch (error) {
            console.error("❌ Gagal memuat barbershop:", error);
            if (error.response) {
                 console.error("Response ", error.response.data);
                 console.error("Response status:", error.response.status);
                 console.error("Response headers:", error.response.headers);
            }
            Alert.alert("Error", "Gagal memuat daftar barbershop.");
        } finally {
            setLoading(false);
        }
    }, [useMyLocation, userLocation]);

    useEffect(() => {
        setLoading(true);
        fetchBarbershops();
    }, [fetchBarbershops]);

    const renderHeader = () => (
        <>
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.greetingText}>Temukan Gayamu</Text>
                    <Text style={styles.userName}>Hai, {user?.name || 'Tamu'}!</Text>
                </View>
            </View>

            {/* --- CONTAINER UNTUK SEARCH SAJA --- */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Icon name="search" size={20} color={COLORS.textSecondary} />
                    <TextInput
                        placeholder="Cari barbershop atau layanan..."
                        placeholderTextColor={COLORS.textSecondary}
                        style={styles.searchInput}
                        editable={false}
                    />
                </View>
            </View>
            {/* ----------------------------------- */}

            {/* --- FILTER DITEMPATKAN DI BAWAH SEARCH --- */}
            <View style={styles.filterContainer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.locationChip,
                        useMyLocation && styles.locationChipActive,
                        pressed && styles.locationChipPressed
                    ]}
                    onPress={() => {
                        if (!useMyLocation) {
                            getCurrentLocation();
                        } else {
                            setUseMyLocation(false);
                            setUserLocation(null);
                        }
                    }}
                    android_ripple={{ color: useMyLocation ? '#10B98166' : '#4F46E566' }}
                >
                    <Icon
                        name={useMyLocation ? "location-on" : "location-off"}
                        size={20}
                        color={useMyLocation ? 'white' : COLORS.primary}
                    />
                    <Text style={[
                        styles.locationChipText,
                        useMyLocation && styles.locationChipTextActive
                    ]}>
                        {useMyLocation ? 'Terdekat' : 'Lihat Semua'}
                    </Text>
                </Pressable>
            </View>
            {/* ------------------------------------------ */}

            <Text style={styles.sectionTitle}>
                {useMyLocation ? 'Barbershop Terdekat' : 'Paling Populer'}
            </Text>
        </>
    );

    if (loading) {
        return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
    }

    return (
        <SafeAreaView style={styles.container}>
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
                contentContainerStyle={{ paddingHorizontal: SIZES.padding }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        paddingVertical: SIZES.padding,
        paddingHorizontal: SIZES.padding,
        marginBottom: 10, // Jarak ke search bar
    },
    greetingText: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    userName: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
    },
    // --- GAYA BARU UNTUK SEARCH ---
    searchContainer: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.margin / 2, // Jarak ke filter
    },
    searchInputWrapper: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.padding,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3, // Tambahkan bayangan ke search bar
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    // --- GAYA BARU UNTUK FILTER ---
    filterContainer: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.margin, // Jarak ke section title
        alignItems: 'flex-start', // Letakkan chip di sisi kiri
    },
    locationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: COLORS.primary,
        minWidth: 100,
        elevation: 3, // Tambahkan bayangan ke chip
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    locationChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    locationChipPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    locationChipText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: SIZES.caption,
        marginLeft: 6,
    },
    locationChipTextActive: {
        color: 'white',
    },
    // -----------------------------
    sectionTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SIZES.margin,
        paddingHorizontal: SIZES.padding,
    },
});

export default HomePage;