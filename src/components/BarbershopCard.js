// src/components/BarbershopCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SIZES } from '../theme/theme';
// Ganti dengan library ikon Anda, misal: import Icon from 'react-native-vector-icons/MaterialIcons';

const BarbershopCard = ({ shop, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1622288432454-2072387e4115?w=500' }} // Placeholder gambar yang lebih bagus
                style={styles.image} 
            />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{shop.name}</Text>
                <Text style={styles.address}>{shop.city}</Text>
                <View style={styles.ratingContainer}>
                    {/* <Icon name="star" size={16} color={COLORS.accent} /> */}
                    <Text style={styles.rating}>⭐ 4.8</Text> 
                    <Text style={styles.reviews}>(251 ulasan)</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.margin,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: SIZES.radius,
        borderTopRightRadius: SIZES.radius,
    },
    infoContainer: {
        padding: SIZES.padding,
    },
    name: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    address: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    rating: {
        fontSize: SIZES.caption,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginLeft: 4,
    },
    reviews: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        marginLeft: 6,
    }
});

export default BarbershopCard;