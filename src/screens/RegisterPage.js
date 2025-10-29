// src/screens/RegisterPage.js - GAYA KREATIF & IMMERSIVE
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { register } from '../services/authService';

const RegisterPage = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!name.trim()) {
      Alert.alert('Validasi', 'Nama lengkap wajib diisi');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Validasi', 'Email wajib diisi');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validasi', 'Format email tidak valid');
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Validasi', 'Nomor telepon wajib diisi');
      return false;
    }
    if (phoneNumber.length < 10) {
      Alert.alert('Validasi', 'Nomor telepon minimal 10 digit');
      return false;
    }
    if (!password) {
      Alert.alert('Validasi', 'Password wajib diisi');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Validasi', 'Password minimal 6 karakter');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const userData = { name, email, phoneNumber, password };
      const response = await register(userData);

      Alert.alert(
        '🎉 Sukses!',
        'Akun Anda berhasil dibuat. Silakan login untuk melanjutkan.',
        [
          {
            text: 'OK',
            onPress: () => {
              setName('');
              setEmail('');
              setPhoneNumber('');
              setPassword('');
              navigation.navigate('Login');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage =
        error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
      Alert.alert('❌ Registrasi Gagal', errorMessage);
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
          <Text style={styles.title}>Buat Akun Baru</Text>
          <Text style={styles.subtitle}>Bergabung untuk menemukan barbershop terbaik</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lengkap"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor="#A7A6BB"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alamat Email</Text>
            <TextInput
              style={styles.input}
              placeholder="contoh@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#A7A6BB"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <TextInput
              style={styles.input}
              placeholder="08xxxxxxxxxx"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#A7A6BB"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#A7A6BB"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>Daftar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              Sudah punya akun?{' '}
              <Text style={styles.linkTextBold}>Masuk sekarang</Text>
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
  input: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    fontSize: 16,
    color: '#1E1B4B',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#6B6A82',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#7C3AED',
    fontWeight: '700',
  },
});

export default RegisterPage;