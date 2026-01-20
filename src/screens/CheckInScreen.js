// Potongin/src/screens/CheckInScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme/theme';

const CheckInScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { booking } = route.params;

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkInMethod, setCheckInMethod] = useState('pin'); // 'pin' or 'qr'

  const handleCheckInWithPIN = async () => {
    if (pin.length !== 6) {
      Alert.alert('Error', 'PIN harus 6 digit');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/bookings/check-in/pin', {
        pin: pin,
        barbershopId: booking.barbershop_id,
      });

      Alert.alert(
        '✅ Check-in Berhasil!',
        response.data.message,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('History'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Check-in Gagal',
        error.response?.data?.message || 'Terjadi kesalahan'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInWithQR = async () => {
    // TODO: Implement QR scanner
    // For now, use the token directly
    setLoading(true);
    try {
      const response = await api.post('/bookings/check-in/qr', {
        qrToken: booking.qr_code_token,
      });

      Alert.alert(
        '✅ Check-in Berhasil!',
        response.data.message,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('History'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Check-in Gagal',
        error.response?.data?.message || 'Terjadi kesalahan'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Check-in</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Booking Info Card */}
          <View style={styles.bookingCard}>
            <View style={styles.iconCircle}>
              <Icon name="scissors" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.barbershopName}>
              {booking.Barbershop?.name}
            </Text>
            <Text style={styles.serviceName}>
              {booking.Service?.name}
            </Text>
            <View style={styles.timeContainer}>
              <Icon name="calendar" size={16} color={COLORS.textSecondary} />
              <Text style={styles.timeText}>{formatDate(booking.booking_time)}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Icon name="clock" size={16} color={COLORS.textSecondary} />
              <Text style={styles.timeText}>{formatTime(booking.booking_time)}</Text>
            </View>
          </View>

          {/* Method Selector */}
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                checkInMethod === 'pin' && styles.methodButtonActive,
              ]}
              onPress={() => setCheckInMethod('pin')}
            >
              <Icon
                name="key"
                size={20}
                color={checkInMethod === 'pin' ? COLORS.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.methodText,
                  checkInMethod === 'pin' && styles.methodTextActive,
                ]}
              >
                PIN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                checkInMethod === 'qr' && styles.methodButtonActive,
              ]}
              onPress={() => setCheckInMethod('qr')}
            >
              <Icon
                name="maximize"
                size={20}
                color={checkInMethod === 'qr' ? COLORS.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.methodText,
                  checkInMethod === 'qr' && styles.methodTextActive,
                ]}
              >
                QR Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* PIN Input */}
          {checkInMethod === 'pin' && (
            <View style={styles.pinContainer}>
              <Text style={styles.label}>Masukkan PIN Check-in</Text>
              <Text style={styles.hint}>
                PIN 6-digit yang Anda terima setelah pembayaran
              </Text>
              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={(text) => setPin(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="● ● ● ● ● ●"
                placeholderTextColor={COLORS.textTertiary}
              />
              <TouchableOpacity
                style={[styles.checkInButton, loading && styles.checkInButtonDisabled]}
                onPress={handleCheckInWithPIN}
                disabled={loading || pin.length !== 6}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.surface} />
                ) : (
                  <>
                    <Icon name="check-circle" size={20} color={COLORS.surface} />
                    <Text style={styles.checkInButtonText}>Check-in Sekarang</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* QR Code */}
          {checkInMethod === 'qr' && (
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                <Icon name="maximize" size={100} color={COLORS.primary} />
                <Text style={styles.qrText}>Tunjukkan QR ini ke Staff</Text>
              </View>
              <Text style={styles.qrHint}>
                atau scan QR di barbershop
              </Text>
              <TouchableOpacity
                style={[styles.scanButton, loading && styles.scanButtonDisabled]}
                onPress={handleCheckInWithQR}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <>
                    <Icon name="camera" size={20} color={COLORS.primary} />
                    <Text style={styles.scanButtonText}>Scan QR Code</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Info */}
          <View style={styles.infoCard}>
            <Icon name="info" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Anda bisa check-in 30 menit sebelum jadwal hingga 15 menit setelah jadwal
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  barbershopName: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  serviceName: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.base,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  timeText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  methodSelector: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  methodButtonActive: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
  },
  methodText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textSecondary,
  },
  methodTextActive: {
    color: COLORS.primary,
  },
  pinContainer: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  pinInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.weight.bold,
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  checkInButtonDisabled: {
    opacity: 0.6,
  },
  checkInButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.surface,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  qrPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.base,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  qrText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  qrHint: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginBottom: SPACING.lg,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.primary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default CheckInScreen;