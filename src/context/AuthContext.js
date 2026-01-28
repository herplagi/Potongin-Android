import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import * as authService from '../services/authService'; // <-- Impor service yang baru
import api from '../services/api'; // Tetap butuh ini untuk mengatur header
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          const decodedToken = jwtDecode(storedToken);
          if (decodedToken.exp * 1000 < Date.now()) {
            await AsyncStorage.removeItem('token');
          } else {
            setToken(storedToken);
            api.defaults.headers.common[
              'Authorization'
            ] = `Bearer ${storedToken}`;
            setUser(decodedToken);
          }
        }
      } catch (e) {
        console.error('Gagal memuat token:', e);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = useCallback(async (email, password) => {
    // --- PERUBAHAN DI SINI ---
    // Panggil fungsi login dari authService
    const response = await authService.login(email, password);
    const { token: receivedToken } = response.data;

    await AsyncStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    setUser(jwtDecode(receivedToken));
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const updateUser = userData => {
    setUser(userData);
  };

  const value = { user, token, loading, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
