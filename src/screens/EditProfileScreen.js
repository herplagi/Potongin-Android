// src/screens/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
const EditProfileScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone_number: user.phone_number || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validasi', 'Nama tidak boleh kosong');
      return;
    }

    if (!formData.phone_number.trim()) {
      Alert.alert('Validasi', 'Nomor telepon tidak boleh kosong');
      return;
    }

    if (formData.phone_number.length < 10) {
      Alert.alert('Validasi', 'Nomor telepon minimal 10 digit');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/users/profile', {
        name: formData.name,
        phone_number: formData.phone_number,
      });

      Alert.alert('Sukses', 'Profil berhasil diperbarui!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Gagal memperbarui profil',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.headerTitle}>Edit Profil</Text>
          <Text style={styles.headerSubtitle}>Perbarui informasi Anda</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Icon name="person" size={16} color="#1E1B4B" /> Nama Lengkap
            </Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor="#A7A6BB"
            />
          </View>

          {/* Email Input (Disabled) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Icon name="email" size={16} color="#1E1B4B" /> Email
            </Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={formData.email}
              editable={false}
              placeholderTextColor="#A7A6BB"
            />
            <Text style={styles.helperText}>Email tidak dapat diubah</Text>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Icon name="phone" size={16} color="#1E1B4B" /> Nomor Telepon
            </Text>
            <TextInput
              style={styles.input}
              value={formData.phone_number}
              onChangeText={text =>
                setFormData({ ...formData, phone_number: text })
              }
              placeholder="08xxxxxxxxxx"
              keyboardType="phone-pad"
              placeholderTextColor="#A7A6BB"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Icon
                  name="save"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.buttonText}>Simpan Perubahan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Change Password Link */}
        <TouchableOpacity
          style={styles.passwordCard}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <View style={styles.passwordCardContent}>
            <Icon name="lock" size={24} color="#7C3AED" />
            <View style={styles.passwordCardText}>
              <Text style={styles.passwordCardTitle}>Keamanan Akun</Text>
              <Text style={styles.passwordCardSubtitle}>
                Ubah password secara berkala
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#A7A6BB" />
          </View>
        </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B6A82',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 15,
    color: '#1E1B4B',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  helperText: {
    fontSize: 12,
    color: '#6B6A82',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: '700',
  },
  passwordCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  passwordCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordCardText: {
    flex: 1,
    marginLeft: 16,
  },
  passwordCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  passwordCardSubtitle: {
    fontSize: 13,
    color: '#6B6A82',
  },
});

export default EditProfileScreen;
