// Lokasi: src/screens/RegisterPage.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { register } from '../services/authService';

const RegisterPage = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !phoneNumber || !password) {
            Alert.alert("Input Tidak Valid", "Semua kolom wajib diisi.");
            return;
        }
        setLoading(true);
        try {
            const userData = { name, email, phoneNumber, password };
            await register(userData);
            
            Alert.alert("Sukses!", "Akun Anda berhasil dibuat. Silakan login.", [
                { text: "OK", onPress: () => navigation.navigate('Login') }
            ]);

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Registrasi gagal. Silakan coba lagi.";
            Alert.alert("Registrasi Gagal", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Buat Akun Baru</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Nama Lengkap"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94A3B8"
            />
            <TextInput
                style={styles.input}
                placeholder="Alamat Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
            />
            <TextInput
                style={styles.input}
                placeholder="Nomor Telepon"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Daftar</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sudah punya akun? Login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1, // Memastikan container bisa scroll jika konten lebih panjang
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#F1F5F9', // slate-100
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1E293B', // slate-800
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 16,
        fontSize: 16,
        borderColor: '#CBD5E1', // slate-300
        borderWidth: 1,
        color: '#1E293B',
    },
    button: {
        backgroundColor: '#4F46E5', // indigo-600
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        elevation: 2, // Shadow for Android
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    linkText: {
        marginTop: 24,
        color: '#4F46E5', // indigo-600
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default RegisterPage;