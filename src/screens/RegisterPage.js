// Lokasi: src/screens/RegisterPage.js

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
    Platform
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
        // Validasi format email sederhana
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
        // Validasi input
        if (!validateInputs()) {
            return;
        }

        setLoading(true);
        try {
            const userData = { name, email, phoneNumber, password };
            const response = await register(userData);
            
            console.log('Register success:', response.data);
            
            // Tampilkan alert sukses
            Alert.alert(
                '🎉 Sukses!',
                'Akun Anda berhasil dibuat. Silakan login untuk melanjutkan.',
                [
                    { 
                        text: 'OK', 
                        onPress: () => {
                            // Reset form
                            setName('');
                            setEmail('');
                            setPhoneNumber('');
                            setPassword('');
                            // Navigate ke Login
                            navigation.navigate('Login');
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('Register error:', error);
            const errorMessage = error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
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
                <View style={styles.header}>
                    <Text style={styles.title}>Buat Akun Baru</Text>
                    <Text style={styles.subtitle}>Daftar untuk memulai</Text>
                </View>
                
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nama Lengkap</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukkan nama lengkap"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            placeholderTextColor="#94A3B8"
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
                            placeholderTextColor="#94A3B8"
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
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Minimal 6 karakter"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleRegister} 
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Daftar</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Login')}
                        style={styles.linkContainer}
                    >
                        <Text style={styles.linkText}>
                            Sudah punya akun? <Text style={styles.linkTextBold}>Login</Text>
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

export default RegisterPage;