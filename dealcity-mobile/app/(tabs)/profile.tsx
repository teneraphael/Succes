import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BadgeCheck,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Store,
  User,
  Users,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { api, ApiError, DealCityUser } from "@/services/api";
import { clearSessionToken } from "@/services/session";

type ProfileUser = DealCityUser & {
  email?: string | null;
  businessName?: string | null;
  _count?: {
    posts?: number;
    followers?: number;
    sales?: number;
  };
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await api.auth.me();
      setUser(data.user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearSessionToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // On efface tout de même la session locale.
    } finally {
      await clearSessionToken();
      setUser(null);
      Alert.alert("Déconnexion", "Tu es maintenant déconnecté de DealCity.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guest}>
          <View style={styles.guestIcon}>
            <User size={38} color="#2563eb" />
          </View>
          <Text style={styles.guestTitle}>TON PROFIL DEALCITY</Text>
          <Text style={styles.guestText}>
            Connecte-toi pour publier, suivre des boutiques, enregistrer des annonces
            et retrouver ton compte DealCity.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/auth")}
          >
            <LogIn size={18} color="#ffffff" />
            <Text style={styles.loginText}>SE CONNECTER / S'INSCRIRE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProfile();
            }}
            tintColor="#2563eb"
          />
        }
      >
        {user.coverUrl ? (
          <Image source={{ uri: user.coverUrl }} style={styles.cover} />
        ) : (
          <View style={styles.coverFallback} />
        )}

        <View style={styles.profileCard}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <User size={35} color="#2563eb" />
            </View>
          )}

          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {user.businessName || user.displayName || user.username}
            </Text>
            {user.isVerified ? <BadgeCheck size={18} color="#2563eb" /> : null}
          </View>

          <Text style={styles.username}>@{user.username}</Text>

          {(user.city || user.neighborhood) && (
            <View style={styles.locationRow}>
              <MapPin size={13} color="#6b7280" />
              <Text style={styles.location}>
                {[user.neighborhood, user.city].filter(Boolean).join(", ")}
              </Text>
            </View>
          )}

          {user.isSeller ? (
            <View style={styles.sellerBadge}>
              <Store size={13} color="#059669" />
              <Text style={styles.sellerBadgeText}>VENDEUR DEALCITY</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Package size={20} color="#2563eb" />
            <Text style={styles.statValue}>{user._count?.posts || 0}</Text>
            <Text style={styles.statLabel}>ANNONCES</Text>
          </View>
          <View style={styles.stat}>
            <Users size={20} color="#2563eb" />
            <Text style={styles.statValue}>{user._count?.followers || 0}</Text>
            <Text style={styles.statLabel}>ABONNÉS</Text>
          </View>
          <View style={styles.stat}>
            <Store size={20} color="#2563eb" />
            <Text style={styles.statValue}>{user._count?.sales || 0}</Text>
            <Text style={styles.statLabel}>VENTES</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logout} onPress={logout}>
          <LogOut size={18} color="#dc2626" />
          <Text style={styles.logoutText}>SE DÉCONNECTER</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  guest: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  guestIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  guestTitle: { marginTop: 18, color: "#111827", fontSize: 19, fontWeight: "900" },
  guestText: {
    marginTop: 9,
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  loginButton: {
    marginTop: 22,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginText: { color: "#ffffff", fontWeight: "900", fontSize: 11 },
  content: { paddingBottom: 30 },
  cover: { width: "100%", height: 150 },
  coverFallback: { width: "100%", height: 110, backgroundColor: "#dbeafe" },
  profileCard: {
    alignItems: "center",
    marginTop: -35,
    marginHorizontal: 14,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: "#ffffff",
  },
  avatarFallback: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#eff6ff",
    borderWidth: 4,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  name: { color: "#111827", fontSize: 18, fontWeight: "900" },
  username: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  location: { color: "#6b7280", fontSize: 11 },
  sellerBadge: {
    marginTop: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "#ecfdf5",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sellerBadgeText: { color: "#059669", fontSize: 9, fontWeight: "900" },
  stats: {
    margin: 14,
    paddingVertical: 17,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: "#111827", fontSize: 17, fontWeight: "900", marginTop: 5 },
  statLabel: { color: "#9ca3af", fontSize: 8, fontWeight: "900", marginTop: 2 },
  logout: {
    marginHorizontal: 14,
    minHeight: 50,
    backgroundColor: "#fff1f2",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fecdd3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: "#dc2626", fontSize: 11, fontWeight: "900" },
});
