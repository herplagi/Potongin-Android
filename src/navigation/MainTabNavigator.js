import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // Pilih set ikon

// Impor halaman-halaman Anda
import HomePage from '../screens/HomePage';
import HistoryPage from '../screens/HistoryPage';
import OrdersPage from '../screens/OrdersPage';
import ExplorePage from '../screens/ExplorePage';
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
                    } else if (route.name === 'Pesanan') {
                        iconName = focused ? 'receipt' : 'receipt-outline';
                    } else if (route.name === 'Explore') {
                        iconName = focused ? 'compass' : 'compass-outline';
                    } else if (route.name === 'Profil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#4F46E5', // Warna ikon aktif
                tabBarInactiveTintColor: 'gray',   // Warna ikon tidak aktif
                headerShown: false, // Kita sembunyikan header default tab
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            })}
        >
            <Tab.Screen name="HomeTab" component={HomePage} options={{ title: 'BERANDA' }} />
            <Tab.Screen name="Pesanan" component={OrdersPage} options={{ title: 'PESANAN' }} />
            <Tab.Screen name="Explore" component={ExplorePage} options={{ title: 'EXPLORE' }} />
            <Tab.Screen name="Profil" component={AccountPage} options={{ title: 'PROFIL' }} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;