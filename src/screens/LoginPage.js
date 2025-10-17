// src/screens/LoginPage.js

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
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigation = useNavigation();

  // Validasi input email & password
  const validateInputs = () => {
    if (!email.trim()) {
      Alert.alert('Validasi', 'Email tidak boleh kosong');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validasi', 'Format email tidak valid');
      return false;
    }

    if (!password) {
      Alert.alert('Validasi', 'Password tidak boleh kosong');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Validasi', 'Password minimal 6 karakter');
      return false;
    }

    return true;
  };

  // Fungsi handle login
  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    console.log('Attempting login with:', { email });

    try {
      await login(email, password);
      console.log('Login successful');
      // Navigasi akan di-handle otomatis oleh AppNavigator
    } catch (error) {
      console.error('Login error:', error);

      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';

      if (error.response) {
        // Jika server mengembalikan respon error
        errorMessage =
          error.response.data?.message ||
          'Login gagal. Periksa email dan password Anda.';
      } else if (error.message === 'Network Error') {
        errorMessage =
          'Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Koneksi timeout. Silakan coba lagi.';
      }

      Alert.alert('Login Gagal', errorMessage);
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
          <Text style={styles.title}>Selamat Datang</Text>
          <Text style={styles.subtitle}>Login untuk melanjutkan</Text>
        </View>

        {/* Form Login */}
        <View style={styles.formContainer}>
          {/* Input Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="contoh@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#94A3B8"
              editable={!loading}
            />
          </View>

          {/* Input Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#94A3B8"
              editable={!loading}
            />
          </View>

          {/* Tombol Login */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Link ke halaman register */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              Belum punya akun?{' '}
              <Text style={styles.linkTextBold}>Daftar di sini</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#1E293B',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#64748B',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
});

export default LoginPage;
