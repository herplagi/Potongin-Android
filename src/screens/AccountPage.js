// src/screens/AccountPage.js - COMPLETE REDESIGN
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme/theme';
import Card from '../components/Card';

const AccountPage = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Keluar dari Akun',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive', 
          onPress: () => logout() 
        },
      ]
    );
  };

  const menuSections = [
    {
      title: 'Akun',
      items: [
        {
          icon: 'user',
          title: 'Edit Profil',
          subtitle: 'Ubah nama dan nomor telepon',
          screen: 'EditProfile',
          iconBg: COLORS.primaryBg,
          iconColor: COLORS.primary,
        },
        {
          icon: 'lock',
          title: 'Ubah Password',
          subtitle: 'Perbarui kata sandi Anda',
          screen: 'ChangePassword',
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
        },
      ],
    },
    {
      title: 'Aktivitas',
      items: [
        {
          icon: 'star',
          title: 'Ulasan Saya',
          subtitle: 'Lihat semua ulasan Anda',
          screen: 'MyReviews',
          iconBg: '#DBEAFE',
          iconColor: '#1D4ED8',
        },
        {
          icon: 'bookmark',
          title: 'Favorit',
          subtitle: 'Barbershop favorit Anda',
          screen: null,
          iconBg: '#FEE2E2',
          iconColor: '#DC2626',
          comingSoon: true,
        },
      ],
    },
    {
      title: 'Lainnya',
      items: [
        {
          icon: 'help-circle',
          title: 'Bantuan & FAQ',
          subtitle: 'Pertanyaan yang sering diajukan',
          screen: null,
          iconBg: '#D1FAE5',
          iconColor: '#059669',
          comingSoon: true,
        },
        {
          icon: 'info',
          title: 'Tentang Aplikasi',
          subtitle: 'Versi 2.0.0',
          screen: null,
          iconBg: COLORS.surfaceAlt,
          iconColor: COLORS.textSecondary,
          comingSoon: true,
        },
      ],
    },
  ];

  const renderMenuItem = (item, index, sectionLength) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.menuItem,
        index === sectionLength - 1 && styles.menuItemLast,
      ]}
      onPress={() => {
        if (item.comingSoon) {
          Alert.alert('Coming Soon', 'Fitur ini akan segera hadir!');
        } else if (item.screen) {
          navigation.navigate(item.screen);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, { backgroundColor: item.iconBg }]}>
        <Icon name={item.icon} size={20} color={item.iconColor} />
      </View>
      
      <View style={styles.menuContent}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          {item.comingSoon && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Segera</Text>
            </View>
          )}
        </View>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      
      <Icon name="chevron-right" size={20} color={COLORS.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera" size={16} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          
          {user?.phone_number && (
            <View style={styles.phoneBadge}>
              <Icon name="phone" size={12} color={COLORS.primary} />
              <Text style={styles.phoneText}>{user.phone_number}</Text>
            </View>
          )}
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSections}>
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.menuSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Card variant="flat" noPadding style={styles.menuCard}>
                {section.items.map((item, itemIndex) =>
                  renderMenuItem(item, itemIndex, section.items.length)
                )}
              </Card>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icon name="log-out" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ by √∞
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.colored,
  },
  avatarText: {
    color: COLORS.surface,
    fontSize: TYPOGRAPHY.h1 + 4,
    fontWeight: TYPOGRAPHY.bold,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  profileName: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  phoneText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
  },
  menuSections: {
    paddingHorizontal: SPACING.xl,
  },
  menuSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  menuCard: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    gap: SPACING.md,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  comingSoonBadge: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  comingSoonText: {
    fontSize: TYPOGRAPHY.tiny,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  logoutSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  logoutText: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
});

export default AccountPage;