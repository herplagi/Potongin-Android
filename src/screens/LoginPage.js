// Lokasi: src/screens/LoginPage.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigation = useNavigation();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Input Tidak Valid", "Email dan password tidak boleh kosong.");
            return;
        }
        setLoading(true);
        try {
            await login(email, password);
            // Navigasi akan ditangani secara otomatis oleh AppNavigator
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Periksa kembali email dan password Anda.";
            Alert.alert("Login Gagal", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Selamat Datang</Text>
            
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
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Belum punya akun? Daftar di sini</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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

export default LoginPage;