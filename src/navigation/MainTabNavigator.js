import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // Pilih set ikon

// Impor halaman-halaman Anda
import HomePage from '../screens/HomePage';
import HistoryPage from '../screens/HistoryPage';
import AccountPage from '../screens/AccountPage';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Riwayat') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Akun') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#4F46E5', // Warna ikon aktif
                tabBarInactiveTintColor: 'gray',   // Warna ikon tidak aktif
                headerShown: false, // Kita sembunyikan header default tab
            })}
        >
            <Tab.Screen name="HomeTab" component={HomePage} options={{ title: 'Home' }} />
            <Tab.Screen name="Riwayat" component={HistoryPage} />
            <Tab.Screen name="Akun" component={AccountPage} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;