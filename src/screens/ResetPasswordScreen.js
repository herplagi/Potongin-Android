// src/screens/ResetPasswordScreen.js - MODERN DESIGN WITHOUT EXTERNAL LIBS
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { resetPassword } from '../services/authService';

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();
  const route = useRoute();
  const token = route.params?.token || '';

  const validateInputs = () => {
    if (!newPassword) {
      Alert.alert('Validasi', 'Password baru tidak boleh kosong');
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validasi', 'Password minimal 6 karakter');
      return false;
    }

    if (!confirmPassword) {
      Alert.alert('Validasi', 'Konfirmasi password tidak boleh kosong');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validasi', 'Password dan konfirmasi password harus sama');
      return false;
    }

    if (!token) {
      Alert.alert('Error', 'Token reset password tidak valid');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      Alert.alert(
        '✅ Berhasil',
        'Password Anda telah berhasil direset. Silakan login dengan password baru.',
        [
          {
            text: 'Login Sekarang',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      console.error('Reset password error:', error);
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.response) {
        errorMessage = error.response.data?.message || 'Token tidak valid atau sudah kadaluarsa.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Tidak dapat terhubung ke server.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Koneksi timeout. Silakan coba lagi.';
      }
      Alert.alert('Gagal', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.gradientBackground}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Icon name="shield-checkmark" size={50} color="#FFF" />
                </View>
              </View>
              
              <Text style={styles.headerTitle}>Reset Password</Text>
              <Text style={styles.headerSubtitle}>
                Buat password baru yang kuat untuk akun Anda
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              {/* New Password */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Icon name="lock-closed-outline" size={22} color="#10B981" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password Baru"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholderTextColor="#9CA3AF"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                >
                  <Icon
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Icon name="lock-open-outline" size={22} color="#10B981" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Konfirmasi Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#9CA3AF"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <Icon
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsBox}>
                <Icon name="information-circle-outline" size={20} color="#6B7280" />
                <Text style={styles.requirementsText}>Password minimal 6 karakter</Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <View style={styles.submitButtonContent}>
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Reset Password</Text>
                      <Icon name="checkmark-done-circle" size={24} color="#FFF" />
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* Back to Login */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
                style={styles.backToLoginContainer}
              >
                <Text style={styles.backToLoginText}>Kembali ke Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    borderRadius: 30,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingRight: 16,
  },
  inputIconContainer: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 4,
  },
  requirementsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  requirementsText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#A7F3D0',
    opacity: 0.7,
  },
  submitButtonContent: {
    flexDirection: 'row',
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  backToLoginContainer: {
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ResetPasswordScreen;