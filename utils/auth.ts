import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const register = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', { email, password });
  const { token, user } = response.data;
  // Use your existing storage key
  await AsyncStorage.setItem('auth_token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
  return { token, user };
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data;
  await AsyncStorage.setItem('auth_token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
  return { token, user };
};

export const logout = async () => {
  await AsyncStorage.multiRemove(['auth_token', 'user']);
};

export const getCurrentUser  = async (): Promise<User | null> => {
  const userStr = await AsyncStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  return !!(await AsyncStorage.getItem('auth_token'));
};