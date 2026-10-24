import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette } from '../theme';

export function FriendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <Text style={styles.empty}>No friend requests yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white, padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: palette.tealDark, marginBottom: 12 },
  empty: { color: palette.ink, fontSize: 16 }
});
