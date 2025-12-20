import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

// This catches the OAuth callback and redirects appropriately
export default function CatchAllRoute() {
          const router = useRouter();
          const { isLoaded, isSignedIn } = useAuth();

          useEffect(() => {
                    if (!isLoaded) return;

                    // Small delay to ensure auth state is fully updated
                    const timer = setTimeout(() => {
                              if (isSignedIn) {
                                        router.replace('/(tabs)');
                              } else {
                                        router.replace('/login');
                              }
                    }, 500);

                    return () => clearTimeout(timer);
          }, [isLoaded, isSignedIn]);

          return (
                    <View style={styles.container}>
                              <ActivityIndicator size="large" color="#22c55e" />
                    </View>
          );
}

const styles = StyleSheet.create({
          container: {
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f9fafb',
          },
});
