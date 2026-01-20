// src/navigation/MainTabNavigator.js - FIXED
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import HomePage from '../screens/HomePage';
import HistoryPage from '../screens/HistoryPage';
import AccountPage from '../screens/AccountPage';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../theme/theme';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'Riwayat') {
            iconName = 'clock';
          } else if (route.name === 'Akun') {
            iconName = 'user';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: SPACING.sm,
          paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.sm,
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          ...SHADOWS.md, // ✅ FIXED: gunakan md bukan medium
        },
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.tiny,
          fontWeight: TYPOGRAPHY.semibold,
          marginTop: SPACING.xs - 2,
        },
        tabBarIconStyle: {
          marginTop: SPACING.xs,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomePage} 
        options={{ title: 'Beranda' }} 
      />
      <Tab.Screen 
        name="Riwayat" 
        component={HistoryPage}
        options={{ title: 'Riwayat' }}
      />
      <Tab.Screen 
        name="Akun" 
        component={AccountPage}
        options={{ title: 'Akun' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;