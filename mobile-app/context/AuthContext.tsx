import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '../utils/notificationConfig';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signIn: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load stored user on mount
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Try to register push token if we have a user
        if (parsedUser.accessToken) {
          registerPushToken(parsedUser.accessToken);
        }
      }
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setIsLoading(false);
    }
  };

  const registerPushToken = async (token: string) => {
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await authApi.registerPushToken(pushToken, token);
        console.log('Push token registered successfully');
      }
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  };

  const signIn = async (userData: any) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      // Register push token on sign in
      if (userData.accessToken) {
        registerPushToken(userData.accessToken);
      }
    } catch (e) {
      console.error('Failed to save user', e);
    }
  };

  const updateUser = async (userData: any) => {
    try {
      // Perform a deeper merge for coupleId to prevent losing storageLimit
      const updatedUser = { 
        ...user, 
        ...userData,
        coupleId: userData.coupleId 
          ? { ...user.coupleId, ...userData.coupleId }
          : user.coupleId
      };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (e) {
      console.error('Failed to update user', e);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (e) {
      console.error('Failed to remove user', e);
    }
  };

  const refreshUser = async () => {
    if (!user?.accessToken) return;
    try {
      const response = await authApi.getMe(user.accessToken);
      if (response.success) {
        const updatedUser = {
          ...user,
          ...response.data.user,
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
