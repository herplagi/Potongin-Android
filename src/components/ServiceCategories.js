// src/components/ServiceCategories.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/theme';

const categories = [
  { id: 'potong', name: 'Potong', icon: 'content-cut' },
  { id: 'cukur', name: 'Cukur', icon: 'face' },
  { id: 'massage', name: 'Massage', icon: 'spa' },
  { id: 'warna', name: 'Warna', icon: 'palette' },
  { id: 'paket', name: 'Paket', icon: 'card-giftcard' },
];

const ServiceCategories = ({ onSelectCategory }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => onSelectCategory && onSelectCategory(category.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon name={category.icon} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingRight: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ServiceCategories;
