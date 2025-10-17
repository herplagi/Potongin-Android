import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';

const AccountPage = () => {
    const { user, logout } = useAuth();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Akun Saya</Text>
            <Text style={styles.email}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={{ marginTop: 20 }}>
                <Button title="Logout" onPress={logout} color="#EF4444" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    email: { fontSize: 16, color: 'gray' }
});

export default AccountPage;