import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowLeft, BadgeCheck, MapPin, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import PostCard from "@/components/PostCard";
import { api, DealCityPost, DealCityUser } from "@/services/api";

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<DealCityPost[]>([]);
  const [users, setUsers] = useState<DealCityUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setPosts([]);
      setUsers([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.search.query(trimmed);
        setPosts(data.posts || []);
        setUsers(data.users || []);
      } catch {
        setPosts([]);
        setUsers([]);
        setError("La recherche est momentanément indisponible.");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Search size={19} color="#9ca3af" />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Produit, boutique, ville, quartier..."
            placeholderTextColor="#9ca3af"
            style={styles.input}
            returnKeyType="search"
          />
        </View>
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
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {users.length > 0 ? (
                <View style={styles.shopsSection}>
                  <Text style={styles.sectionTitle}>BOUTIQUES</Text>
                  {users.map((user) => (
                    <View key={user.id} style={styles.shopRow}>
                      {user.avatarUrl ? (
                        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarText}>
                            {(user.businessName || user.displayName || user.username)
                              .slice(0, 1)
                              .toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.shopInfo}>
                        <View style={styles.shopNameRow}>
                          <Text style={styles.shopName}>
                            {user.businessName || user.displayName || user.username}
                          </Text>
                          {user.isVerified ? (
                            <BadgeCheck size={15} color="#2563eb" />
                          ) : null}
                        </View>
                        {(user.city || user.neighborhood) && (
                          <View style={styles.locationRow}>
                            <MapPin size={12} color="#9ca3af" />
                            <Text style={styles.shopLocation}>
                              {[user.neighborhood, user.city].filter(Boolean).join(", ")}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}

              {query.trim().length >= 2 && posts.length > 0 ? (
                <Text style={styles.sectionTitle}>ANNONCES</Text>
              ) : null}
            </>
          }
          renderItem={({ item }) => <PostCard post={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {error ||
                  (query.trim().length < 2
                    ? "Commence à saisir au moins 2 caractères."
                    : users.length
                      ? "Aucune annonce correspondante."
                      : "Aucun résultat trouvé.")}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  searchBox: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  input: { flex: 1, marginLeft: 8, color: "#111827", fontSize: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 12, paddingBottom: 30 },
  shopsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: "900",
    color: "#6b7280",
    marginBottom: 10,
  },
  shopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#2563eb", fontWeight: "900", fontSize: 17 },
  shopInfo: { flex: 1, marginLeft: 10 },
  shopNameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  shopName: { color: "#111827", fontWeight: "900", fontSize: 14 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  shopLocation: { color: "#9ca3af", fontSize: 11, fontWeight: "600" },
  empty: { paddingVertical: 40, paddingHorizontal: 24, alignItems: "center" },
  emptyText: { color: "#6b7280", fontSize: 14, textAlign: "center" },
});
