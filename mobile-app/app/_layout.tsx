import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { PlanLimitsProvider } from '../context/PlanLimitsContext';
import { ToastProvider } from '../components/ui/ToastProvider';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Expo Go'da native modüller olmadığı için importu güvenli hale getirme
let mobileAds: any = null;
try {
  mobileAds = require('react-native-google-mobile-ads').default;
} catch (e) {
  console.log('Google Ads module not found');
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (mobileAds) {
      try {
        mobileAds()
          .initialize()
          .then((adapterStatuses: any) => {
            console.log('Ads SDK initialized');
          })
          .catch((e: any) => console.log('Mobile Ads initialization error:', e));
      } catch (e) {
        console.log('Mobile Ads SDK not available (probably Expo Go)');
      }
    }
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    'IndieFlower': require('../assets/fonts/IndieFlower-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (isAuthLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/welcome-selection');
    } else if (user && inAuthGroup) {
      router.replace('/dashboard');
    }
  }, [user, isAuthLoading, segments, fontsLoaded]);

  if (isAuthLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF1F2' }}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ title: 'Giriş & Kayıt' }} />
      <Stack.Screen name="(drawer)" options={{ title: 'Ana Sayfa' }} />
      <Stack.Screen name="quiz-answers/[id]" options={{ title: 'Quiz Cevapları' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PlanLimitsProvider>
          <ToastProvider>
            <RootLayoutNav />
          </ToastProvider>
        </PlanLimitsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
