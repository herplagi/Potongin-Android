// src/screens/HomePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import BarbershopCard from '../components/BarbershopCard';
import { COLORS, SIZES } from '../theme/theme';
// Ganti dengan library ikon Anda, misal: import Icon from 'react-native-vector-icons/Feather';

const HomePage = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [barbershops, setBarbershops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBarbershops = async () => {
            try {
                const response = await api.get('/barbershops');
                setBarbershops(response.data);
            } catch (error) {
                console.error("Gagal memuat barbershop:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBarbershops();
    }, []);

    const renderHeader = () => (
        <>
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.greetingText}>Temukan Gayamu</Text>
                    <Text style={styles.userName}>Hai, {user?.name || 'Tamu'}!</Text>
                </View>
                {/* Di sini bisa ditambahkan ikon notifikasi atau profil */}
            </View>
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    {/* <Icon name="search" size={20} color={COLORS.textSecondary} /> */}
                    <TextInput
                        placeholder="Cari barbershop atau layanan..."
                        placeholderTextColor={COLORS.textSecondary}
                        style={styles.searchInput}
                    />
                </View>
            </View>
            <Text style={styles.sectionTitle}>Paling Populer</Text>
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
        marginBottom: 30, // Memberi ruang untuk search bar
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
    searchContainer: {
        position: 'absolute',
        top: 100, // Sesuaikan posisi ini
        left: SIZES.padding,
        right: SIZES.padding,
        zIndex: 1,
    },
    searchInputWrapper: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.padding,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 40, // Ruang setelah search bar
        marginBottom: SIZES.margin,
    },
});

export default HomePage;