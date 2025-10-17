// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Linking, Alert } from 'react-native';
// import api from '../services/api';
// import { useFocusEffect } from '@react-navigation/native';

// const HistoryPage = () => {
//     const [bookings, setBookings] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [refreshing, setRefreshing] = useState(false);

//     const fetchBookings = async () => {
//         try {
//             const response = await api.get('/bookings/my-bookings');
//             setBookings(response.data);
//         } catch (error) {
//             console.error('Gagal memuat booking:', error);
//         } finally {
//             setLoading(false);
//             setRefreshing(false);
//         }
//     };

//     useFocusEffect(
//         useCallback(() => {
//             fetchBookings();
//         }, [])
//     );

//     const onRefresh = () => {
//         setRefreshing(true);
//         fetchBookings();
//     };

//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'pending_payment': return '#EAB308';
//             case 'confirmed': return '#3B82F6';
//             case 'completed': return '#10B981';
//             case 'cancelled': return '#EF4444';
//             default: return '#6B7280';
//         }
//     };

//     const getPaymentStatusColor = (status) => {
//         switch (status) {
//             case 'paid': return '#10B981';
//             case 'pending': return '#EAB308';
//             case 'failed': return '#EF4444';
//             case 'expired': return '#EF4444';
//             default: return '#6B7280';
//         }
//     };

//     const handlePayNow = async (booking) => {
//         if (booking.payment_url) {
//             const supported = await Linking.canOpenURL(booking.payment_url);
//             if (supported) {
//                 await Linking.openURL(booking.payment_url);
//             } else {
//                 Alert.alert('Error', 'Tidak dapat membuka halaman pembayaran');
//             }
//         } else {
//             Alert.alert('Error', 'URL pembayaran tidak tersedia');
//         }
//     };

//     const renderBookingItem = ({ item }) => (
//         <View style={styles.bookingCard}>
//             <View style={styles.cardHeader}>
//                 <Text style={styles.serviceName}>{item.Service?.name}</Text>
//                 <Text style={styles.price}>
//                     Rp {Number(item.total_price).toLocaleString('id-ID')}
//                 </Text>
//             </View>

//             <View style={styles.cardBody}>
//                 <Text style={styles.barbershopName}>{item.Barbershop?.name}</Text>
//                 <Text style={styles.dateTime}>
//                     {new Date(item.booking_time).toLocaleDateString('id-ID', {
//                         weekday: 'long',
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric',
//                     })}
//                 </Text>
//                 <Text style={styles.time}>
//                     {new Date(item.booking_time).toLocaleTimeString('id-ID', {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                     })}
//                 </Text>
//                 {item.Staff && (
//                     <Text style={styles.staff}>Kapster: {item.Staff.name}</Text>
//                 )}
//             </View>

//             <View style={styles.cardFooter}>
//                 <View style={styles.statusContainer}>
//                     <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
//                         <Text style={styles.statusText}>
//                             {item.status.replace('_', ' ').toUpperCase()}
//                         </Text>
//                     </View>
//                     <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(item.payment_status) }]}>
//                         <Text style={styles.statusText}>
//                             {item.payment_status === 'paid' ? '✓ DIBAYAR' : 'BELUM BAYAR'}
//                         </Text>
//                     </View>
//                 </View>

//                 {item.payment_status === 'pending' && item.status === 'pending_payment' && (
//                     <TouchableOpacity
//                         style={styles.payButton}
//                         onPress={() => handlePayNow(item)}
//                     >
//                         <Text style={styles.payButtonText}>Bayar Sekarang</Text>
//                     </TouchableOpacity>
//                 )}
//             </View>
//         </View>
//     );

//     if (loading) {
//         return (
//             <View style={styles.centerContainer}>
//                 <Text>Memuat riwayat booking...</Text>
//             </View>
//         );
//     }

//     if (bookings.length === 0) {
//         return (
//             <View style={styles.centerContainer}>
//                 <Text style={styles.emptyText}>Belum ada riwayat booking</Text>
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             <FlatList
//                 data={bookings}
//                 renderItem={renderBookingItem}
//                 keyExtractor={item => item.booking_id}
//                 contentContainerStyle={styles.listContainer}
//                 refreshControl={
//                     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//                 }
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#F1F5F9' },
//     centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     listContainer: { padding: 16 },
//     bookingCard: {
//         backgroundColor: 'white',
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 16,
//         elevation: 3,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     cardHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 12,
//         paddingBottom: 12,
//         borderBottomWidth: 1,
//         borderBottomColor: '#E5E7EB',
//     },
//     serviceName: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#1F2937',
//         flex: 1,
//     },
//     price: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#4F46E5',
//     },
//     cardBody: {
//         marginBottom: 12,
//     },
//     barbershopName: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#374151',
//         marginBottom: 4,
//     },
//     dateTime: {
//         fontSize: 14,
//         color: '#6B7280',
//         marginBottom: 2,
//     },
//     time: {
//         fontSize: 14,
//         color: '#6B7280',
//         marginBottom: 4,
//     },
//     staff: {
//         fontSize: 13,
//         color: '#9CA3AF',
//     },
//     cardFooter: {
//         gap: 12,
//     },
//     statusContainer: {
//         flexDirection: 'row',
//         gap: 8,
//     },
//     statusBadge: {
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 6,
//     },
//     statusText: {
//         color: 'white',
//         fontSize: 11,
//         fontWeight: 'bold',
//     },
//     payButton: {
//         backgroundColor: '#10B981',
//         paddingVertical: 12,
//         borderRadius: 8,
//         alignItems: 'center',
//     },
//     payButtonText: {
//         color: 'white',
//         fontSize: 14,
//         fontWeight: 'bold',
//     },
//     emptyText: {
//         fontSize: 16,
//         color: '#6B7280',
//     },
// });

// export default HistoryPage;

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import api from '../services/api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const HistoryPage = () => {
    const navigation = useNavigation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/my-bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Gagal memuat booking:', error);
            Alert.alert('Error', 'Gagal memuat riwayat booking');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending_payment': return '#EAB308';
            case 'confirmed': return '#3B82F6';
            case 'completed': return '#10B981';
            case 'cancelled': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return '#10B981';
            case 'pending': return '#EAB308';
            case 'failed': return '#EF4444';
            case 'expired': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const handlePayNow = async (booking) => {
        console.log('💳 Attempting to pay for booking:', booking.booking_id);
        
        // ✅ VALIDASI PAYMENT URL
        if (!booking.payment_url) {
            Alert.alert(
                'Error', 
                'URL pembayaran tidak tersedia. Silakan hubungi customer service.',
                [
                    {
                        text: 'OK',
                        onPress: () => console.log('No payment URL available')
                    }
                ]
            );
            return;
        }

        // ✅ CEK APAKAH PAYMENT SUDAH EXPIRED
        const bookingDate = new Date(booking.booking_time);
        const now = new Date();
        const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);
        
        if (hoursDiff < 0) {
            Alert.alert(
                'Pembayaran Tidak Tersedia',
                'Waktu booking sudah lewat. Silakan buat booking baru.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            // ✅ NAVIGASI KE PAYMENT WEBVIEW
            console.log('🔗 Navigating to payment with URL:', booking.payment_url);
            
            navigation.navigate('PaymentWebView', {
                paymentUrl: booking.payment_url,
                bookingId: booking.booking_id,
            });
        } catch (error) {
            console.error('❌ Navigation error:', error);
            Alert.alert(
                'Error',
                'Tidak dapat membuka halaman pembayaran. Silakan coba lagi.',
                [{ text: 'OK' }]
            );
        }
    };

    const renderBookingItem = ({ item }) => (
        <View style={styles.bookingCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.serviceName}>{item.Service?.name || 'Layanan'}</Text>
                <Text style={styles.price}>
                    Rp {Number(item.total_price).toLocaleString('id-ID')}
                </Text>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.barbershopName}>
                    {item.Barbershop?.name || 'Barbershop'}
                </Text>
                <Text style={styles.dateTime}>
                    {new Date(item.booking_time).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Text>
                <Text style={styles.time}>
                    {new Date(item.booking_time).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
                {item.Staff && (
                    <Text style={styles.staff}>Kapster: {item.Staff.name}</Text>
                )}
                
                {/* ✅ TAMPILKAN BOOKING ID */}
                <Text style={styles.bookingId}>ID: {item.booking_id}</Text>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>
                            {item.status.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(item.payment_status) }]}>
                        <Text style={styles.statusText}>
                            {item.payment_status === 'paid' ? '✓ DIBAYAR' : 'BELUM BAYAR'}
                        </Text>
                    </View>
                </View>

                {/* ✅ TOMBOL BAYAR SEKARANG - DENGAN VALIDASI LENGKAP */}
                {item.payment_status === 'pending' && 
                 item.status === 'pending_payment' && 
                 item.payment_url && (
                    <TouchableOpacity
                        style={styles.payButton}
                        onPress={() => handlePayNow(item)}
                    >
                        <Text style={styles.payButtonText}>💳 Bayar Sekarang</Text>
                    </TouchableOpacity>
                )}

                {/* ✅ TAMPILKAN PESAN JIKA PAYMENT URL TIDAK ADA */}
                {item.payment_status === 'pending' && 
                 item.status === 'pending_payment' && 
                 !item.payment_url && (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            ⚠️ URL pembayaran tidak tersedia. Hubungi customer service.
                        </Text>
                    </View>
                )}

                {/* ✅ TAMPILKAN PESAN UNTUK PAYMENT EXPIRED */}
                {item.payment_status === 'expired' && (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            ⏰ Pembayaran sudah kadaluarsa. Silakan buat booking baru.
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Text>Memuat riwayat booking...</Text>
            </View>
        );
    }

    if (bookings.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>📋 Belum ada riwayat booking</Text>
                <Text style={styles.emptySubtext}>
                    Booking Anda akan muncul di sini
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={item => item.booking_id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    centerContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#1F2937',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
    },
    listContainer: { padding: 16 },
    bookingCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    serviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    cardBody: {
        marginBottom: 12,
    },
    barbershopName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    dateTime: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    time: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    staff: {
        fontSize: 13,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    bookingId: {
        fontSize: 11,
        color: '#9CA3AF',
        fontFamily: 'monospace',
        marginTop: 4,
    },
    cardFooter: {
        gap: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    statusText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    payButton: {
        backgroundColor: '#10B981',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    payButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoBox: {
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    infoText: {
        fontSize: 12,
        color: '#92400E',
        textAlign: 'center',
    },
});

export default HistoryPage;