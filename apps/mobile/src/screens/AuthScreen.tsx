import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import { palette } from '../theme';

export function AuthScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Haiku</Text>
        <Text style={styles.subtitle}>Welcome to a calmer way to connect.</Text>

        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Main')}>
          <Text style={styles.buttonText}>Create account</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Continue with Google</Text>
        </Pressable>

        <Text style={styles.link}>Already have an account? Sign in</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.white
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: palette.white
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: palette.tealDark,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    color: palette.ink,
    marginBottom: 28
  },
  primaryButton: {
    backgroundColor: palette.teal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12
  },
  secondaryButton: {
    backgroundColor: palette.mint,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12
  },
  buttonText: {
    color: palette.white,
    fontWeight: '600',
    fontSize: 16
  },
  secondaryText: {
    color: palette.tealDark,
    fontWeight: '600',
    fontSize: 16
  },
  link: {
    color: palette.teal,
    textAlign: 'center',
    marginTop: 8
  }
});
