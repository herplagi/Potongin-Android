// src/screens/ReviewScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';

const ReviewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { booking } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Peringatan', 'Silakan pilih rating terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/reviews', {
        booking_id: booking.booking_id,
        rating,
        comment: comment.trim() || null,
      });

      console.log('✅ Review submitted:', response.data);

      Alert.alert(
        '⭐ Terima Kasih!',
        'Review Anda telah berhasil dikirim.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('❌ Submit review error:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Gagal mengirim review. Silakan coba lagi.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starButton}
        >
          <Text style={styles.starIcon}>{i <= rating ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return 'Sangat Buruk';
      case 2:
        return 'Buruk';
      case 3:
        return 'Cukup';
      case 4:
        return 'Baik';
      case 5:
        return 'Sangat Baik';
      default:
        return 'Pilih Rating';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Info */}
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingTitle}>Review untuk:</Text>
          <Text style={styles.serviceName}>{booking.Service?.name}</Text>
          <Text style={styles.barbershopName}>
            {booking.Barbershop?.name}
          </Text>
          <Text style={styles.dateText}>
            {new Date(booking.booking_time).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Bagaimana pengalaman Anda?</Text>
          <View style={styles.starsContainer}>{renderStars()}</View>
          <Text style={styles.ratingText}>{getRatingText()}</Text>
        </View>

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>
            Ceritakan pengalaman Anda (Opsional)
          </Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tulis review Anda di sini..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={6}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>
            Review Anda akan membantu customer lain
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitReview}
          disabled={rating === 0 || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? '⏳ Mengirim...' : '✅ Kirim Review'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContainer: {
    padding: 20,
  },
  bookingInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bookingTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  barbershopName: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
  },
  ratingSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  starIcon: {
    fontSize: 40,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  commentSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  commentInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    elevation: 1,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewScreen;