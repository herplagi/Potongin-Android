// // src/screens/PaymentWebViewScreen.js
// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   View, 
//   StyleSheet, 
//   ActivityIndicator, 
//   Alert,
//   SafeAreaView,
//   TouchableOpacity,
//   Text,
//   Linking,
//   BackHandler
// } from 'react-native';
// import { WebView } from 'react-native-webview';
// import { useRoute, useNavigation } from '@react-navigation/native';

// const PaymentWebViewScreen = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { paymentUrl, bookingId } = route.params;
  
//   const [loading, setLoading] = useState(true);
//   const [canGoBack, setCanGoBack] = useState(false);
//   const webViewRef = useRef(null);
//   const hasNavigatedRef = useRef(false); // Prevent double navigation

//   console.log('💳 Payment WebView params:', { paymentUrl, bookingId });

//   // ✅ HANDLE ANDROID BACK BUTTON
//   useEffect(() => {
//     const backAction = () => {
//       handleBackPress();
//       return true; // Prevent default back behavior
//     };

//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       backAction
//     );

//     return () => backHandler.remove();
//   }, []);

//   // ✅ HANDLE DEEP LINK
//   useEffect(() => {
//     const handleDeepLink = ({ url }) => {
//       console.log('📱 Deep link received:', url);
      
//       if (hasNavigatedRef.current) {
//         console.log('⚠️ Already navigated, ignoring');
//         return;
//       }
      
//       if (url.includes('potong://payment/success') || url.includes('payment-success')) {
//         hasNavigatedRef.current = true;
//         handlePaymentSuccess();
//       } else if (url.includes('potong://payment/failed') || url.includes('payment-failed')) {
//         hasNavigatedRef.current = true;
//         handlePaymentFailed();
//       } else if (url.includes('potong://payment/pending') || url.includes('payment-pending')) {
//         hasNavigatedRef.current = true;
//         handlePaymentPending();
//       }
//     };

//     const subscription = Linking.addEventListener('url', handleDeepLink);

//     Linking.getInitialURL().then((url) => {
//       if (url) {
//         handleDeepLink({ url });
//       }
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, [navigation]);

//   const handlePaymentSuccess = () => {
//     Alert.alert(
//       '✅ Pembayaran Berhasil!',
//       'Terima kasih, pembayaran Anda telah dikonfirmasi.',
//       [
//         {
//           text: 'OK',
//           onPress: () => {
//             navigation.reset({
//               index: 0,
//               routes: [{ name: 'Main', params: { screen: 'Riwayat' } }],
//             });
//           }
//         }
//       ],
//       { cancelable: false }
//     );
//   };

//   const handlePaymentPending = () => {
//     Alert.alert(
//       '⏳ Pembayaran Tertunda',
//       'Pembayaran Anda masih diproses. Silakan cek riwayat booking.',
//       [
//         {
//           text: 'OK',
//           onPress: () => {
//             navigation.reset({
//               index: 0,
//               routes: [{ name: 'Main', params: { screen: 'Riwayat' } }],
//             });
//           }
//         }
//       ],
//       { cancelable: false }
//     );
//   };

//   const handlePaymentFailed = () => {
//     Alert.alert(
//       '❌ Pembayaran Gagal',
//       'Pembayaran dibatalkan atau gagal. Anda bisa mencoba lagi dari riwayat booking.',
//       [
//         {
//           text: 'OK',
//           onPress: () => {
//             navigation.navigate('Main', { screen: 'Riwayat' });
//           }
//         }
//       ],
//       { cancelable: false }
//     );
//   };

//   const handleNavigationStateChange = (navState) => {
//     const { url, loading: isLoading } = navState;
//     setCanGoBack(navState.canGoBack);
    
//     console.log('🔗 Navigation URL:', url);
//     console.log('📊 Loading:', isLoading);

//     if (hasNavigatedRef.current) {
//       return;
//     }
    
//     // ✅ DETEKSI BERBAGAI KEMUNGKINAN URL SUCCESS
//     const successPatterns = [
//       'potong://payment/success',
//       '/payment-success',
//       'status_code=200',
//       'transaction_status=settlement',
//       'transaction_status=capture',
//       'simulator.sandbox.midtrans.com/v2/success', // Midtrans simulator success page
//     ];

//     const pendingPatterns = [
//       'potong://payment/pending',
//       '/payment-pending',
//       'status_code=201',
//       'transaction_status=pending',
//     ];

//     const failedPatterns = [
//       'potong://payment/failed',
//       '/payment-failed',
//       'potong://payment/cancel',
//       '/payment-cancel',
//       'transaction_status=deny',
//       'transaction_status=cancel',
//       'transaction_status=expire',
//       'simulator.sandbox.midtrans.com/v2/failure',
//     ];

//     // Check success
//     if (successPatterns.some(pattern => url.includes(pattern))) {
//       console.log('✅ Success pattern detected');
//       hasNavigatedRef.current = true;
//       setLoading(false);
//       setTimeout(() => handlePaymentSuccess(), 500);
//       return;
//     }

//     // Check pending
//     if (pendingPatterns.some(pattern => url.includes(pattern))) {
//       console.log('⏳ Pending pattern detected');
//       hasNavigatedRef.current = true;
//       setLoading(false);
//       setTimeout(() => handlePaymentPending(), 500);
//       return;
//     }

//     // Check failed
//     if (failedPatterns.some(pattern => url.includes(pattern))) {
//       console.log('❌ Failed pattern detected');
//       hasNavigatedRef.current = true;
//       setLoading(false);
//       setTimeout(() => handlePaymentFailed(), 500);
//       return;
//     }

//     // ✅ SPECIAL: Detect jika stuck di halaman success Midtrans tapi belum redirect
//     if (url.includes('simulator.sandbox.midtrans.com') && !isLoading) {
//       // Inject JavaScript to check for success message
//       if (webViewRef.current) {
//         webViewRef.current.injectJavaScript(`
//           (function() {
//             const bodyText = document.body.innerText.toLowerCase();
//             if (bodyText.includes('success') || bodyText.includes('berhasil')) {
//               window.ReactNativeWebView.postMessage(JSON.stringify({
//                 type: 'PAYMENT_SUCCESS',
//                 url: window.location.href
//               }));
//             } else if (bodyText.includes('pending')) {
//               window.ReactNativeWebView.postMessage(JSON.stringify({
//                 type: 'PAYMENT_PENDING',
//                 url: window.location.href
//               }));
//             } else if (bodyText.includes('failed') || bodyText.includes('gagal')) {
//               window.ReactNativeWebView.postMessage(JSON.stringify({
//                 type: 'PAYMENT_FAILED',
//                 url: window.location.href
//               }));
//             }
//           })();
//         `);
//       }
//     }
//   };

//   // ✅ HANDLE MESSAGE dari WebView JavaScript
//   const handleWebViewMessage = (event) => {
//     try {
//       const data = JSON.parse(event.nativeEvent.data);
//       console.log('📨 Message from WebView:', data);

//       if (hasNavigatedRef.current) {
//         return;
//       }

//       if (data.type === 'PAYMENT_SUCCESS') {
//         hasNavigatedRef.current = true;
//         handlePaymentSuccess();
//       } else if (data.type === 'PAYMENT_PENDING') {
//         hasNavigatedRef.current = true;
//         handlePaymentPending();
//       } else if (data.type === 'PAYMENT_FAILED') {
//         hasNavigatedRef.current = true;
//         handlePaymentFailed();
//       }
//     } catch (error) {
//       console.log('⚠️ Failed to parse WebView message:', error);
//     }
//   };

//   const handleError = (syntheticEvent) => {
//     const { nativeEvent } = syntheticEvent;
//     console.error('❌ WebView error:', nativeEvent);
    
//     // Jangan langsung error, mungkin callback sudah berhasil via webhook
//     if (nativeEvent.description?.includes('ERR_CONNECTION_REFUSED')) {
//       console.log('ℹ️ Connection refused - payment might still be processing');
//       Alert.alert(
//         'Info',
//         'Halaman callback tidak dapat diakses, tapi pembayaran mungkin sudah berhasil. Silakan cek riwayat booking.',
//         [
//           {
//             text: 'Cek Riwayat',
//             onPress: () => {
//               navigation.reset({
//                 index: 0,
//                 routes: [{ name: 'Main', params: { screen: 'Riwayat' } }],
//               });
//             }
//           },
//           {
//             text: 'Tetap Di Sini',
//             style: 'cancel'
//           }
//         ]
//       );
//       return;
//     }

//     Alert.alert(
//       'Error',
//       'Terjadi kesalahan saat memuat halaman pembayaran.',
//       [
//         {
//           text: 'Tutup',
//           onPress: () => navigation.goBack()
//         },
//         {
//           text: 'Coba Lagi',
//           onPress: () => {
//             if (webViewRef.current) {
//               webViewRef.current.reload();
//             }
//           }
//         }
//       ]
//     );
//   };

//   const handleBackPress = () => {
//     if (hasNavigatedRef.current) {
//       return;
//     }

//     Alert.alert(
//       '⚠️ Batalkan Pembayaran?',
//       'Apakah Anda yakin ingin keluar? Pembayaran belum selesai. Anda masih bisa melanjutkan pembayaran dari riwayat booking.',
//       [
//         { text: 'Tidak', style: 'cancel' },
//         { 
//           text: 'Ya, Keluar', 
//           onPress: () => {
//             hasNavigatedRef.current = true;
//             navigation.goBack();
//           },
//           style: 'destructive'
//         }
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={handleBackPress}
//         >
//           <Text style={styles.backButtonText}>← Kembali</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Pembayaran</Text>
//         <View style={{ width: 80 }} />
//       </View>

//       {loading && (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4F46E5" />
//           <Text style={styles.loadingText}>Memuat halaman pembayaran...</Text>
//         </View>
//       )}

//       {paymentUrl ? (
//         <WebView
//           ref={webViewRef}
//           source={{ uri: paymentUrl }}
//           onLoadStart={() => {
//             console.log('🔄 WebView loading started');
//             setLoading(true);
//           }}
//           onLoadEnd={() => {
//             console.log('✅ WebView loaded');
//             setLoading(false);
//           }}
//           onNavigationStateChange={handleNavigationStateChange}
//           onMessage={handleWebViewMessage}
//           onError={handleError}
//           onHttpError={(syntheticEvent) => {
//             const { nativeEvent } = syntheticEvent;
//             console.log('⚠️ HTTP Error:', nativeEvent);
//           }}
//           startInLoadingState={true}
//           javaScriptEnabled={true}
//           domStorageEnabled={true}
//           scalesPageToFit={true}
//           style={styles.webview}
//           userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36"
//           originWhitelist={['https://*', 'http://*', 'potong://*']}
//           // ✅ Allow redirect
//           setSupportMultipleWindows={false}
//           allowsBackForwardNavigationGestures={true}
//         />
//       ) : (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>URL pembayaran tidak tersedia</Text>
//           <TouchableOpacity 
//             style={styles.errorButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.errorButtonText}>Kembali</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     backgroundColor: '#4F46E5',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   backButton: {
//     padding: 8,
//     minWidth: 80,
//   },
//   backButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   headerTitle: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//     flex: 1,
//     textAlign: 'center',
//   },
//   loadingContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     zIndex: 10,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: '#64748B',
//   },
//   webview: {
//     flex: 1,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#EF4444',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   errorButton: {
//     backgroundColor: '#4F46E5',
//     paddingHorizontal: 32,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   errorButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
// });

// export default PaymentWebViewScreen;

// src/screens/PaymentWebViewScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Linking,
  BackHandler
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';

const PaymentWebViewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { paymentUrl, bookingId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);
  const hasNavigatedRef = useRef(false);

  console.log('💳 Payment WebView params:', { paymentUrl, bookingId });

  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      console.log('📱 Deep link received:', url);
      
      if (hasNavigatedRef.current) {
        console.log('⚠️ Already navigated, ignoring');
        return;
      }
      
      if (url.includes('potong://payment/success') || url.includes('payment-success')) {
        hasNavigatedRef.current = true;
        handlePaymentSuccess();
      } else if (url.includes('potong://payment/failed') || url.includes('payment-failed')) {
        hasNavigatedRef.current = true;
        handlePaymentFailed();
      } else if (url.includes('potong://payment/pending') || url.includes('payment-pending')) {
        hasNavigatedRef.current = true;
        handlePaymentPending();
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  const handlePaymentSuccess = () => {
    Alert.alert(
      '✅ Pembayaran Berhasil!',
      'Terima kasih, pembayaran Anda telah dikonfirmasi.',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Riwayat' } }],
            });
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handlePaymentPending = () => {
    Alert.alert(
      '⏳ Pembayaran Tertunda',
      'Pembayaran Anda masih diproses. Silakan cek riwayat booking.',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Riwayat' } }],
            });
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handlePaymentFailed = () => {
    Alert.alert(
      '❌ Pembayaran Gagal',
      'Pembayaran dibatalkan atau gagal. Anda bisa mencoba lagi dari riwayat booking.',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Main', { screen: 'Riwayat' });
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleNavigationStateChange = (navState) => {
    const { url, loading: isLoading } = navState;
    setCanGoBack(navState.canGoBack);
    
    console.log('🔗 Navigation URL:', url);
    console.log('📊 Loading:', isLoading);

    if (hasNavigatedRef.current) {
      return;
    }
    
    // ✅ DETEKSI DEEP LINK SCHEME
    if (url.startsWith('potong://')) {
      console.log('🔍 Deep link detected:', url);
      
      if (url.includes('payment/success')) {
        hasNavigatedRef.current = true;
        setLoading(false);
        setTimeout(() => handlePaymentSuccess(), 300);
        return;
      } else if (url.includes('payment/pending')) {
        hasNavigatedRef.current = true;
        setLoading(false);
        setTimeout(() => handlePaymentPending(), 300);
        return;
      } else if (url.includes('payment/failed')) {
        hasNavigatedRef.current = true;
        setLoading(false);
        setTimeout(() => handlePaymentFailed(), 300);
        return;
      }
    }

    // ✅ DETEKSI URL SUCCESS PATTERNS
    const successPatterns = [
      '/payment-success',
      'status_code=200',
      'transaction_status=settlement',
      'transaction_status=capture',
      'simulator.sandbox.midtrans.com/v2/success',
    ];

    const pendingPatterns = [
      '/payment-pending',
      'status_code=201',
      'transaction_status=pending',
    ];

    const failedPatterns = [
      '/payment-failed',
      '/payment-cancel',
      'transaction_status=deny',
      'transaction_status=cancel',
      'transaction_status=expire',
      'simulator.sandbox.midtrans.com/v2/failure',
    ];

    if (successPatterns.some(pattern => url.includes(pattern))) {
      console.log('✅ Success pattern detected');
      hasNavigatedRef.current = true;
      setLoading(false);
      setTimeout(() => handlePaymentSuccess(), 500);
      return;
    }

    if (pendingPatterns.some(pattern => url.includes(pattern))) {
      console.log('⏳ Pending pattern detected');
      hasNavigatedRef.current = true;
      setLoading(false);
      setTimeout(() => handlePaymentPending(), 500);
      return;
    }

    if (failedPatterns.some(pattern => url.includes(pattern))) {
      console.log('❌ Failed pattern detected');
      hasNavigatedRef.current = true;
      setLoading(false);
      setTimeout(() => handlePaymentFailed(), 500);
      return;
    }

    if (url.includes('simulator.sandbox.midtrans.com') && !isLoading) {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          (function() {
            const bodyText = document.body.innerText.toLowerCase();
            if (bodyText.includes('success') || bodyText.includes('berhasil')) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_SUCCESS',
                url: window.location.href
              }));
            } else if (bodyText.includes('pending')) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_PENDING',
                url: window.location.href
              }));
            } else if (bodyText.includes('failed') || bodyText.includes('gagal')) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_FAILED',
                url: window.location.href
              }));
            }
          })();
        `);
      }
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📨 Message from WebView:', data);

      if (hasNavigatedRef.current) {
        return;
      }

      if (data.type === 'PAYMENT_SUCCESS') {
        hasNavigatedRef.current = true;
        handlePaymentSuccess();
      } else if (data.type === 'PAYMENT_PENDING') {
        hasNavigatedRef.current = true;
        handlePaymentPending();
      } else if (data.type === 'PAYMENT_FAILED') {
        hasNavigatedRef.current = true;
        handlePaymentFailed();
      }
    } catch (error) {
      console.log('⚠️ Failed to parse WebView message:', error);
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('❌ WebView error:', nativeEvent);
    
    // ✅ HANDLE ERR_UNKNOWN_URL_SCHEME (Deep Link)
    if (nativeEvent.description?.includes('ERR_UNKNOWN_URL_SCHEME')) {
      const url = nativeEvent.url;
      console.log('🔗 Handling deep link from error:', url);
      
      // Cek apakah ini deep link potong://
      if (url && url.startsWith('potong://')) {
        if (url.includes('payment/success')) {
          handlePaymentSuccess();
        } else if (url.includes('payment/pending')) {
          handlePaymentPending();
        } else if (url.includes('payment/failed')) {
          handlePaymentFailed();
        }
        return; // Jangan tampilkan alert error
      }
    }
    
    if (nativeEvent.description?.includes('ERR_CONNECTION_REFUSED')) {
      console.log('ℹ️ Connection refused - payment might still be processing');
      Alert.alert(
        'Info',
        'Halaman callback tidak dapat diakses, tapi pembayaran mungkin sudah berhasil. Silakan cek riwayat booking.',
        [
          {
            text: 'Cek Riwayat',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Riwayat' } }],
              });
            }
          },
          {
            text: 'Tetap Di Sini',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    Alert.alert(
      'Error',
      'Terjadi kesalahan saat memuat halaman pembayaran.',
      [
        {
          text: 'Tutup',
          onPress: () => navigation.goBack()
        },
        {
          text: 'Coba Lagi',
          onPress: () => {
            if (webViewRef.current) {
              webViewRef.current.reload();
            }
          }
        }
      ]
    );
  };

  const handleBackPress = () => {
    if (hasNavigatedRef.current) {
      return;
    }

    Alert.alert(
      '⚠️ Batalkan Pembayaran?',
      'Apakah Anda yakin ingin keluar? Pembayaran belum selesai. Anda masih bisa melanjutkan pembayaran dari riwayat booking.',
      [
        { text: 'Tidak', style: 'cancel' },
        { 
          text: 'Ya, Keluar', 
          onPress: () => {
            hasNavigatedRef.current = true;
            navigation.goBack();
          },
          style: 'destructive'
        }
      ]
    );
  };

  // ✅ CUSTOM shouldStartLoadWithRequest untuk intercept deep links
  const handleShouldStartLoad = (request) => {
    const { url } = request;
    console.log('🔄 Should start load:', url);

    // Jika URL adalah deep link potong://, handle manual
    if (url.startsWith('potong://')) {
      console.log('🚫 Blocking deep link navigation, handling manually');
      
      // Handle deep link
      if (url.includes('payment/success')) {
        hasNavigatedRef.current = true;
        handlePaymentSuccess();
      } else if (url.includes('payment/pending')) {
        hasNavigatedRef.current = true;
        handlePaymentPending();
      } else if (url.includes('payment/failed')) {
        hasNavigatedRef.current = true;
        handlePaymentFailed();
      }
      
      return false; // Block WebView dari loading URL ini
    }

    return true; // Allow load untuk URL lainnya
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembayaran</Text>
        <View style={{ width: 80 }} />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat halaman pembayaran...</Text>
        </View>
      )}

      {paymentUrl ? (
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onLoadStart={() => {
            console.log('🔄 WebView loading started');
            setLoading(true);
          }}
          onLoadEnd={() => {
            console.log('✅ WebView loaded');
            setLoading(false);
          }}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleWebViewMessage}
          onError={handleError}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log('⚠️ HTTP Error:', nativeEvent);
          }}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={true}
          style={styles.webview}
          userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36"
          originWhitelist={['https://*', 'http://*', 'potong://*']}
          setSupportMultipleWindows={false}
          allowsBackForwardNavigationGestures={true}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>URL pembayaran tidak tersedia</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#4F46E5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    minWidth: 80,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default PaymentWebViewScreen;