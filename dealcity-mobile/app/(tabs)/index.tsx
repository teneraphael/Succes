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
import { Bell, Search } from "lucide-react-native";
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
        <Text style={styles.logo}>DEALCITY</Text>
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
  logo: {
    color: "#2563eb",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
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
  feedTabs: {
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
    padding: 12,
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
