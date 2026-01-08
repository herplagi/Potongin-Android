// src/screens/ResetPasswordScreen.js
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
  
  // Get token from navigation params or deep link
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
        'Berhasil',
        'Password Anda telah berhasil direset. Silakan login dengan password baru.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      console.error('Reset password error:', error);
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.response) {
        errorMessage = error.response.data?.message || 'Token tidak valid atau sudah kadaluarsa. Silakan minta link reset password baru.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Koneksi timeout. Silakan coba lagi.';
      }
      Alert.alert('Gagal', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Masukkan password baru untuk akun Anda
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password Baru</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholderTextColor="#A7A6BB"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
                disabled={loading}
              >
                <Icon
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#6B6A82"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konfirmasi Password Baru</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#A7A6BB"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Icon
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#6B6A82"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>Kembali ke Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6A82',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1E1B4B',
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#C4B5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ResetPasswordScreen;
