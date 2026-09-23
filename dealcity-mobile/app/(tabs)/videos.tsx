import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PlayCircle } from "lucide-react-native";
import PostCard from "@/components/PostCard";
import { api, DealCityPost } from "@/services/api";

export default function VideosScreen() {
  const [posts, setPosts] = useState<DealCityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await api.posts.getVideos();
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
      setError("Impossible de charger les vidéos DealCity.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>VIDÉOS DEALS</Text>
          <Text style={styles.subtitle}>Découvre les produits en vidéo</Text>
        </View>
        <PlayCircle size={28} color="#2563eb" />
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
          renderItem={({ item }) => <PostCard post={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor="#2563eb"
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>
                {error || "Aucune vidéo Deal disponible pour le moment."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    minHeight: 70,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { color: "#111827", fontSize: 20, fontWeight: "900" },
  subtitle: { color: "#6b7280", fontSize: 11, marginTop: 2 },
  list: { padding: 12, paddingBottom: 30 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  empty: { color: "#6b7280", textAlign: "center" },
});
