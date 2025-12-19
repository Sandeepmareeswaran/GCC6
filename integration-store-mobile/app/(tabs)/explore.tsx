import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function ExploreScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (err) {
              console.error('Logout error:', err);
            }
          }
        }
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#22c55e', dark: '#166534' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#15803d"
          name="person.circle.fill"
          style={styles.headerImage}
        />
      }>

      {/* User Profile Section */}
      <ThemedView style={styles.profileSection}>
        {user?.imageUrl && (
          <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
        )}
        <ThemedView style={styles.userInfo}>
          <ThemedText type="title" style={{ fontFamily: Fonts.rounded, fontSize: 22 }}>
            {user?.fullName || 'User'}
          </ThemedText>
          <ThemedText type="default" style={styles.email}>
            {user?.primaryEmailAddress?.emailAddress || 'No email'}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Account Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Account</ThemedText>

        <ThemedView style={styles.menuItem}>
          <IconSymbol name="envelope.fill" size={22} color="#6b7280" />
          <ThemedView style={styles.menuItemContent}>
            <ThemedText>Email</ThemedText>
            <ThemedText style={styles.menuItemValue}>
              {user?.primaryEmailAddress?.emailAddress || 'Not set'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.menuItem}>
          <IconSymbol name="person.fill" size={22} color="#6b7280" />
          <ThemedView style={styles.menuItemContent}>
            <ThemedText>User ID</ThemedText>
            <ThemedText style={styles.menuItemValue} numberOfLines={1}>
              {user?.id?.substring(0, 20) || 'N/A'}...
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <IconSymbol name="rectangle.portrait.and.arrow.right" size={22} color="#ef4444" />
        <ThemedText style={styles.logoutText}>Logout</ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#15803d',
    bottom: -60,
    left: -20,
    position: 'absolute',
    opacity: 0.3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e5e7eb',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  email: {
    color: '#6b7280',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: '#6b7280',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemValue: {
    color: '#9ca3af',
    fontSize: 13,
    maxWidth: 180,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 24,
  },
});
