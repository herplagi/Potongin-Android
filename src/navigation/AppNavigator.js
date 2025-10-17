// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import LoginPage from '../screens/LoginPage';
import RegisterPage from '../screens/RegisterPage';
import HomePage from '../screens/HomePage';
import BarbershopDetailPage from '../screens/BarbershopDetailPage';
import BookingPage from '../screens/BookingPage';
import PaymentWebViewScreen from '../screens/PaymentWebViewScreen'; // ✅ TAMBAHKAN INI
import { View, ActivityIndicator } from 'react-native';
import MainTabNavigator from './MainTabNavigator';

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
    {/* Halaman utama sekarang adalah seluruh Tab Navigator */}
    <Stack.Screen 
      name="Main" 
      component={MainTabNavigator} 
      options={{ headerShown: false }} 
    />

    {/* Halaman lain yang bukan bagian dari tab */}
    <Stack.Screen 
      name="BarbershopDetail" 
      component={BarbershopDetailPage} 
      options={{ title: 'Detail Barbershop' }}
    />
    <Stack.Screen 
      name="Booking" 
      component={BookingPage} 
      options={{ title: 'Pilih Jadwal' }} 
    />
    {/* ✅ TAMBAHKAN SCREEN PAYMENT WEBVIEW */}
    <Stack.Screen 
      name="PaymentWebView" 
      component={PaymentWebViewScreen} 
      options={{ 
        headerShown: false,
        presentation: 'modal' // Tampil sebagai modal di iOS
      }} 
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;