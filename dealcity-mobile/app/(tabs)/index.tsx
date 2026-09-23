import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Bell, Search, ShoppingBag, TrendingUp, Zap } from "lucide-react-native";
import { useRouter } from "expo-router";
import PostCard from "@/components/PostCard";
import { api, DealCityPost } from "@/services/api";

type FeedMode = "for-you" | "following";

export default function HomeScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<FeedMode>("for-you");
  const [posts, setPosts] = useState<DealCityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    try {
      setError(null);
      const data =
        mode === "for-you"
          ? await api.posts.getForYou()
          : await api.posts.getFollowing();
      setPosts(data.posts || []);
    } catch (err: any) {
      setError(
        err?.status === 401
          ? "Connecte-toi pour voir les vendeurs que tu suis."
          : "Impossible de charger DealCity pour le moment.",
      );
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode]);

  useEffect(() => {
    setLoading(true);
    loadFeed();
  }, [loadFeed]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed();
  }, [loadFeed]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.brandBars}>
            <View style={[styles.brandBar, { height: 16 }]} />
            <View style={[styles.brandBar, { height: 24 }]} />
            <View style={[styles.brandBar, { height: 32 }]} />
            <View style={[styles.brandBar, { height: 20 }]} />
          </View>
          <Text style={styles.logo}>DealCity</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/(tabs)/explore")}
          >
            <Search size={22} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={22} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroBrandLine}>
          <View style={styles.heroBars}>
            <View style={[styles.heroBar, { height: 14 }]} />
            <View style={[styles.heroBar, { height: 21 }]} />
            <View style={[styles.heroBar, { height: 28 }]} />
            <View style={[styles.heroBar, { height: 18 }]} />
          </View>
          <Text style={styles.heroBrand}>DealCity</Text>
          <View style={styles.countryBadge}>
            <Text style={styles.countryBadgeText}>CAMEROUN</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>
          La marketplace qui{"\n"}connecte vendeurs{"\n"}et acheteurs
        </Text>
        <Text style={styles.heroSubtitle}>
          Découvrez des milliers de produits · Discutez via WhatsApp · 100% Camerounais
        </Text>

        <View style={styles.heroStats}>
          <View style={styles.statChipBlue}>
            <ShoppingBag size={14} color="#3a81f3" />
            <Text style={styles.statChipBlueText}>Produits</Text>
          </View>
          <View style={styles.statChipGreen}>
            <TrendingUp size={14} color="#1aa04b" />
            <Text style={styles.statChipGreenText}>Vendeurs</Text>
          </View>
          <View style={styles.statChipGray}>
            <Zap size={14} color="#4b5563" />
            <Text style={styles.statChipGrayText}>Via WhatsApp</Text>
          </View>
        </View>

        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={styles.heroLogin}
            onPress={() => router.push("/auth")}
          >
            <Text style={styles.heroLoginText}>SE CONNECTER</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroSignup}
            onPress={() => router.push("/auth")}
          >
            <Text style={styles.heroSignupText}>S'INSCRIRE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchStrip}>
        <TouchableOpacity
          style={styles.searchPill}
          onPress={() => router.push("/(tabs)/explore")}
        >
          <Search size={18} color="#9ca3af" />
          <Text style={styles.searchPlaceholder}>
            Rechercher un produit, une boutique...
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.feedTabs}>
        <TouchableOpacity
          style={[styles.feedTab, mode === "for-you" && styles.feedTabActive]}
          onPress={() => setMode("for-you")}
        >
          <Text
            style={[
              styles.feedTabText,
              mode === "for-you" && styles.feedTabTextActive,
            ]}
          >
            POUR VOUS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.feedTab, mode === "following" && styles.feedTabActive]}
          onPress={() => setMode("following")}
        >
          <Text
            style={[
              styles.feedTabText,
              mode === "following" && styles.feedTabTextActive,
            ]}
          >
            ABONNEMENTS
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563eb"
            />
          }
          renderItem={({ item }) => <PostCard post={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {error || "Aucune annonce pour le moment."}
              </Text>
              {mode === "following" && error ? (
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => router.push("/auth")}
                >
                  <Text style={styles.loginButtonText}>SE CONNECTER</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    height: 58,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  brandBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 32,
  },
  brandBar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: "#4a90e2",
  },
  logo: {
    color: "#6ab344",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
    paddingBottom: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    backgroundColor: "#ffffff",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  heroBrandLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroBars: {
    height: 28,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  heroBar: {
    width: 4,
    backgroundColor: "#3a81f3",
    borderRadius: 3,
  },
  heroBrand: {
    marginLeft: 8,
    color: "#1aa04b",
    fontSize: 18,
    fontWeight: "900",
  },
  countryBadge: {
    marginLeft: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countryBadgeText: {
    color: "#3a81f3",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  heroTitle: {
    marginTop: 18,
    color: "#111827",
    fontSize: 27,
    lineHeight: 31,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  heroSubtitle: {
    marginTop: 9,
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  heroStats: {
    marginTop: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  statChipBlue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statChipBlueText: {
    color: "#3a81f3",
    fontSize: 9,
    fontWeight: "800",
  },
  statChipGreen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#d1fae5",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statChipGreenText: {
    color: "#1aa04b",
    fontSize: 9,
    fontWeight: "800",
  },
  statChipGray: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statChipGrayText: {
    color: "#4b5563",
    fontSize: 9,
    fontWeight: "800",
  },
  heroButtons: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },
  heroLogin: {
    flex: 1,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3a81f3",
  },
  heroLoginText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  heroSignup: {
    flex: 1,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1aa04b",
  },
  heroSignupText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  searchStrip: {
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#f3f4f6",
  },
  searchPill: {
    height: 44,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
  },
  feedTabs: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  feedTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  feedTabActive: {
    backgroundColor: "#10b981",
  },
  feedTabText: {
    color: "#4b5563",
    fontSize: 11,
    fontWeight: "900",
  },
  feedTabTextActive: {
    color: "#ffffff",
  },
  list: {
    paddingTop: 12,
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    padding: 30,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  loginButton: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 11,
  },
});
