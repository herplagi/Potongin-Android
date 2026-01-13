// src/screens/OrdersPage.js
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES } from '../theme/theme';

const OrdersPage = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="receipt-long" size={80} color={COLORS.primary} />
        <Text style={styles.title}>Pesanan</Text>
        <Text style={styles.subtitle}>
          Fitur pesanan akan segera hadir
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default OrdersPage;
