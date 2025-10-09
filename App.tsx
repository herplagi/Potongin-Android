// App.tsx atau App.js
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // <-- 1. Impor

function App(): React.JSX.Element {
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