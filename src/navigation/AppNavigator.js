// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import LoginPage from '../screens/LoginPage';
import RegisterPage from '../screens/RegisterPage';
import HomePage from '../screens/HomePage';
import BarbershopDetailPage from '../screens/BarbershopDetailPage';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

// Tumpukan halaman sebelum login
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterPage} />
    </Stack.Navigator>
);

// Tumpukan halaman setelah login
const AppStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
        {/* --- TAMBAHKAN RUTE BARU DI SINI --- */}
        <Stack.Screen 
            name="BarbershopDetail" // Nama ini harus cocok dengan di navigation.navigate
            component={BarbershopDetailPage} 
            options={{ title: 'Detail Barbershop' }} // Judul di header
        />
    </Stack.Navigator>
);

const AppNavigator = () => {
    const { token, loading } = useAuth();

    // Tampilkan indikator loading saat context sedang memeriksa token
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {/* Pilih tumpukan halaman berdasarkan status token */}
            {token ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;