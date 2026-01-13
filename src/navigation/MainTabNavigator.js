import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Impor halaman-halaman Anda
import HomePage from '../screens/HomePage';
import OrdersPage from '../screens/OrdersPage';
import ExplorePage from '../screens/ExplorePage';
import AccountPage from '../screens/AccountPage';

const Tab = createBottomTabNavigator();

const getIconName = (routeName, focused) => {
  const icons = {
    HomeTab: focused ? 'home' : 'home-outline',
    Pesanan: focused ? 'receipt' : 'receipt-outline',
    Explore: focused ? 'compass' : 'compass-outline',
    Profil: focused ? 'person' : 'person-outline',
  };
  return icons[routeName] || 'home-outline';
};

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    const iconName = getIconName(route.name, focused);
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#4F46E5',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
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