import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
          useWarmUpBrowser();

          const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

          const handleGoogleLogin = async () => {
                    try {
                              const { createdSessionId, setActive } = await startOAuthFlow();

                              if (createdSessionId && setActive) {
                                        await setActive({ session: createdSessionId });
                              }
                    } catch (err) {
                              console.error('OAuth error:', err);
                    }
          };

          return (
                    <SafeAreaView style={styles.container}>
                              <View style={styles.content}>
                                        {/* Logo/Icon */}
                                        <View style={styles.logoContainer}>
                                                  <Text style={styles.logoEmoji}>🔗</Text>
                                                  <Text style={styles.appName}>Integration Store</Text>
                                                  <Text style={styles.tagline}>Connect all your tools in one place</Text>
                                        </View>

                                        {/* Login Card */}
                                        <View style={styles.card}>
                                                  <Text style={styles.welcomeText}>Welcome!</Text>
                                                  <Text style={styles.subtitle}>Sign in to continue</Text>

                                                  <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                                                            <Image
                                                                      source={{ uri: 'https://www.google.com/favicon.ico' }}
                                                                      style={styles.googleIcon}
                                                            />
                                                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                                                  </TouchableOpacity>

                                                  <Text style={styles.termsText}>
                                                            By signing in, you agree to our Terms of Service and Privacy Policy
                                                  </Text>
                                        </View>

                                        {/* Footer */}
                                        <Text style={styles.footer}>© 2025 Integration Store</Text>
                              </View>
                    </SafeAreaView>
          );
}

const styles = StyleSheet.create({
          container: {
                    flex: 1,
                    backgroundColor: '#f9fafb',
          },
          content: {
                    flex: 1,
                    justifyContent: 'center',
                    padding: 24,
          },
          logoContainer: {
                    alignItems: 'center',
                    marginBottom: 40,
          },
          logoEmoji: {
                    fontSize: 64,
                    marginBottom: 16,
          },
          appName: {
                    fontSize: 28,
                    fontWeight: '700',
                    color: '#1e1e2d',
                    marginBottom: 8,
          },
          tagline: {
                    fontSize: 16,
                    color: '#6b7280',
                    textAlign: 'center',
          },
          card: {
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 32,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
          },
          welcomeText: {
                    fontSize: 24,
                    fontWeight: '700',
                    color: '#1e1e2d',
                    textAlign: 'center',
                    marginBottom: 8,
          },
          subtitle: {
                    fontSize: 14,
                    color: '#6b7280',
                    textAlign: 'center',
                    marginBottom: 32,
          },
          googleButton: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    padding: 16,
                    gap: 12,
                    marginBottom: 20,
          },
          googleIcon: {
                    width: 20,
                    height: 20,
          },
          googleButtonText: {
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
          },
          termsText: {
                    fontSize: 12,
                    color: '#9ca3af',
                    textAlign: 'center',
                    lineHeight: 18,
          },
          footer: {
                    fontSize: 12,
                    color: '#9ca3af',
                    textAlign: 'center',
                    marginTop: 40,
          },
});
