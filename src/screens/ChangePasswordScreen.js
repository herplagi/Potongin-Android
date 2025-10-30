import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChangePasswordScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const validateForm = () => {
        if (!formData.current_password) {
            Alert.alert('Validasi', 'Password lama wajib diisi');
            return false;
        }

        if (!formData.new_password) {
            Alert.alert('Validasi', 'Password baru wajib diisi');
            return false;
        }

        if (formData.new_password.length < 6) {
            Alert.alert('Validasi', 'Password baru minimal 6 karakter');
            return false;
        }

        if (formData.new_password !== formData.confirm_password) {
            Alert.alert('Validasi', 'Konfirmasi password tidak cocok');
            return false;
        }

        if (formData.current_password === formData.new_password) {
            Alert.alert('Validasi', 'Password baru tidak boleh sama dengan password lama');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await api.patch('/users/change-password', {
                current_password: formData.current_password,
                new_password: formData.new_password
            });

            Alert.alert(
                'Sukses',
                'Password berhasil diubah!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Change password error:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Gagal mengubah password'
            );
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        const password = formData.new_password;
        if (!password) return null;
        
        if (password.length < 6) return { text: 'Lemah', color: '#EF4444' };
        if (password.length < 8) return { text: 'Sedang', color: '#F59E0B' };
        return { text: 'Kuat', color: '#10B981' };
    };

    const strength = getPasswordStrength();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconWrapper}>
                        <Icon name="lock" size={40} color="#7C3AED" />
                    </View>
                    <Text style={styles.headerTitle}>Ubah Password</Text>
                    <Text style={styles.headerSubtitle}>
                        Pastikan password baru Anda kuat dan unik
                    </Text>
                </View>

                {/* Security Tips */}
                <View style={styles.tipsCard}>
                    <View style={styles.tipsHeader}>
                        <Icon name="shield" size={20} color="#3B82F6" />
                        <Text style={styles.tipsTitle}>Tips Keamanan Password:</Text>
                    </View>
                    <View style={styles.tipsList}>
                        <Text style={styles.tipItem}>• Gunakan minimal 8 karakter</Text>
                        <Text style={styles.tipItem}>• Kombinasi huruf besar, kecil, angka</Text>
                        <Text style={styles.tipItem}>• Jangan gunakan info pribadi</Text>
                        <Text style={styles.tipItem}>• Ubah password secara berkala</Text>
                    </View>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    {/* Current Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password Lama</Text>
                        <View style={styles.passwordInputWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                value={formData.current_password}
                                onChangeText={(text) => setFormData({ ...formData, current_password: text })}
                                placeholder="Masukkan password lama"
                                secureTextEntry={!showCurrentPassword}
                                placeholderTextColor="#A7A6BB"
                            />
                            <TouchableOpacity
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                style={styles.eyeButton}
                            >
                                <Icon
                                    name={showCurrentPassword ? 'visibility-off' : 'visibility'}
                                    size={20}
                                    color="#6B6A82"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* New Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password Baru</Text>
                        <View style={styles.passwordInputWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                value={formData.new_password}
                                onChangeText={(text) => setFormData({ ...formData, new_password: text })}
                                placeholder="Masukkan password baru"
                                secureTextEntry={!showNewPassword}
                                placeholderTextColor="#A7A6BB"
                            />
                            <TouchableOpacity
                                onPress={() => setShowNewPassword(!showNewPassword)}
                                style={styles.eyeButton}
                            >
                                <Icon
                                    name={showNewPassword ? 'visibility-off' : 'visibility'}
                                    size={20}
                                    color="#6B6A82"
                                />
                            </TouchableOpacity>
                        </View>
                        {strength && (
                            <View style={styles.strengthIndicator}>
                                <View style={[styles.strengthBar, { backgroundColor: strength.color }]} />
                                <Text style={[styles.strengthText, { color: strength.color }]}>
                                    {strength.text}
                                </Text>
                            </View>
                        )}
                        {formData.new_password && formData.new_password.length > 0 && (
                            <Text style={[
                                styles.helperText,
                                formData.new_password.length >= 6 ? styles.helperTextSuccess : styles.helperTextError
                            ]}>
                                {formData.new_password.length >= 6 ? '✓' : '✗'} Minimal 6 karakter
                            </Text>
                        )}
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Konfirmasi Password Baru</Text>
                        <View style={styles.passwordInputWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                value={formData.confirm_password}
                                onChangeText={(text) => setFormData({ ...formData, confirm_password: text })}
                                placeholder="Konfirmasi password baru"
                                secureTextEntry={!showConfirmPassword}
                                placeholderTextColor="#A7A6BB"
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeButton}
                            >
                                <Icon
                                    name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                                    size={20}
                                    color="#6B6A82"
                                />
                            </TouchableOpacity>
                        </View>
                        {formData.confirm_password && (
                            <Text style={[
                                styles.helperText,
                                formData.new_password === formData.confirm_password
                                    ? styles.helperTextSuccess
                                    : styles.helperTextError
                            ]}>
                                {formData.new_password === formData.confirm_password
                                    ? '✓ Password cocok'
                                    : '✗ Password tidak cocok'}
                            </Text>
                        )}
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.cancelButtonText}>Batal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.submitButtonText}>Ubah Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F5F3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
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
        textAlign: 'center',
    },
    tipsCard: {
        backgroundColor: '#EFF6FF',
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E3A8A',
        marginLeft: 8,
    },
    tipsList: {
        marginLeft: 28,
    },
    tipItem: {
        fontSize: 13,
        color: '#1E40AF',
        marginBottom: 4,
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
    passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1E1B4B',
    },
    eyeButton: {
        paddingHorizontal: 12,
    },
    strengthIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    strengthBar: {
        width: 60,
        height: 4,
        borderRadius: 2,
        marginRight: 8,
    },
    strengthText: {
        fontSize: 12,
        fontWeight: '600',
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
    },
    helperTextSuccess: {
        color: '#10B981',
    },
    helperTextError: {
        color: '#EF4444',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#6B6A82',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#7C3AED',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
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
    submitButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default ChangePasswordScreen;