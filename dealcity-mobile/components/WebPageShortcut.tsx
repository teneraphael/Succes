import React from 'react';
import { Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SITE_URL } from '@/services/api';

type Props = { title: string; description: string; path: string; buttonLabel: string };

export default function WebPageShortcut({ title, description, path, buttonLabel }: Props) {
  const open = async () => {
    try {
      await Linking.openURL(`${SITE_URL}${path}`);
    } catch {
      // The URL remains visible for users whose device has no browser configured.
    }
  };

  return <SafeAreaView style={styles.screen}>
    <View style={styles.card}>
      <Text style={styles.brand}>DealCity</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={open}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
      <Text selectable style={styles.url}>{SITE_URL}{path}</Text>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 20, gap: 16 },
  brand: { color: '#4a90e2', fontSize: 24, fontWeight: '900' },
  title: { color: '#111827', fontSize: 20, fontWeight: '800' },
  description: { color: '#4b5563', fontSize: 15, lineHeight: 23 },
  button: { backgroundColor: '#4a90e2', borderRadius: 12, padding: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  url: { color: '#6b7280', fontSize: 12 },
});
