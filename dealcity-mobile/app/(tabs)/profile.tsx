import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { User, Phone, MapPin, ShieldCheck, Package, LogOut } from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Rediriger vers l'écran de connexion si non connecté
        router.replace('/auth');
      } else {
        setUser(session.user);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* En-tête Profil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={40} color="#4a90e2" />
          </View>
          <Text style={styles.username}>{user?.email || 'Vendeur DealCity'}</Text>
          <View style={styles.badgeTrust}>
            <ShieldCheck size={14} color="#10b981" />
            <Text style={styles.badgeTrustText}>Vendeur Vérifié 🇨🇲</Text>
          </View>
        </View>

        {/* Infos de contact */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Phone size={18} color="#6b7280" />
            <Text style={styles.infoText}>+237 699 00 00 00</Text>
          </View>
          <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 10, paddingTop: 10 }]}>
            <MapPin size={18} color="#6b7280" />
            <Text style={styles.infoText}>Douala / Yaoundé, Cameroun</Text>
          </View>
        </View>

        {/* Bouton de déconnexion */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <LogOut size={18} color="#ef4444" />
            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  username: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  badgeTrust: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    gap: 4,
  },
  badgeTrustText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  logoutButton: {
    borderColor: '#fee2e2',
    backgroundColor: '#fff5f5',
  },
});