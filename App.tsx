// App.tsx atau App.js
import React from 'react';
import { Linking } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // <-- 1. Impor
import { useEffect as ReactUseEffect } from 'react';

function App(): React.JSX.Element {
  useEffect(() => {
    // ✅ Handle deep link saat app dibuka
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log('📱 Deep link opened:', url);
      // Deep link akan di-handle oleh PaymentWebViewScreen
    };

    // Listen untuk deep link
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check jika app dibuka dari deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('📱 Initial deep link:', url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  return (
    // 2. Bungkus AuthProvider dengan SafeAreaProvider
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
function useEffect(effect: () => void | (() => void), deps: React.DependencyList) {
  ReactUseEffect(effect, deps);
}
