import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Clerk token cache using SecureStore
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env');
}

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Auth wrapper to handle navigation
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Wait for navigation state to be ready
    if (!navigationState?.key) return;
    if (!isLoaded) return;
    if (hasNavigated) return;

    const inAuthGroup = segments[0] === 'login';

    // Small delay to ensure navigation is ready
    const timer = setTimeout(() => {
      if (isSignedIn && inAuthGroup) {
        // Redirect to home if signed in and on login page
        setHasNavigated(true);
        router.replace('/(tabs)');
      } else if (!isSignedIn && !inAuthGroup) {
        // Redirect to login if not signed in and not on login page
        setHasNavigated(true);
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isSignedIn, isLoaded, segments, navigationState?.key]);

  // Reset hasNavigated when auth state changes
  useEffect(() => {
    if (isLoaded) {
      setHasNavigated(false);
    }
  }, [isSignedIn]);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthWrapper>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="login" />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
            </Stack>
          </AuthWrapper>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
