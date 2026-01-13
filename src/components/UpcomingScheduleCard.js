// src/components/UpcomingScheduleCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/theme';

const UpcomingScheduleCard = ({ booking, onDetailPress }) => {
  if (!booking) {
    return null;
  }

  // Format date and time
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Oct', 'Nov', 'Des'];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const dateTime = formatDateTime(booking.booking_date);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jadwal Mendatang</Text>
        <TouchableOpacity onPress={onDetailPress} style={styles.detailButton}>
          <Text style={styles.detailText}>Detail</Text>
          <Icon name="chevron-right" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.dateSection}>
          <Text style={styles.dayText}>{dateTime.day}</Text>
          <Text style={styles.dateText}>{dateTime.date}</Text>
          <Text style={styles.monthText}>{dateTime.month}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Icon name="store" size={18} color="#FFFFFF" />
            <Text style={styles.barbershopName} numberOfLines={1}>
              {booking.barbershop_name || 'Barbershop'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="access-time" size={18} color="#FFFFFF" />
            <Text style={styles.timeText}>{dateTime.time}</Text>
          </View>
          {booking.service_name && (
            <View style={styles.infoRow}>
              <Icon name="content-cut" size={18} color="#FFFFFF" />
              <Text style={styles.serviceText} numberOfLines={1}>
                {booking.service_name}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  dateSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 20,
  },
  dayText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  monthText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: '#FFFFFF40',
    marginHorizontal: 16,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barbershopName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});

export default UpcomingScheduleCard;
