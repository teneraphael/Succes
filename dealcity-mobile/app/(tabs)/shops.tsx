import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BadgeCheck, MapPin, Store } from "lucide-react-native";
import { api, Shop } from "@/services/api";

export default function ShopsScreen() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setShops(await api.shops.getAll());
    } catch {
      setShops([]);
      setError("Impossible de charger les boutiques DealCity.");
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
          <Text style={styles.title}>BOUTIQUES</Text>
          <Text style={styles.subtitle}>Les vendeurs présents sur DealCity</Text>
        </View>
        <Store size={27} color="#2563eb" />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
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
          renderItem={({ item }) => {
            const previews =
              item.posts
                ?.flatMap((post) => post.attachments || [])
                .filter((media) => media.type === "IMAGE")
                .slice(0, 2) || [];

            return (
              <View style={styles.card}>
                {item.coverUrl ? (
                  <Image source={{ uri: item.coverUrl }} style={styles.cover} />
                ) : (
                  <View style={styles.coverFallback} />
                )}

                <View style={styles.body}>
                  <View style={styles.profileRow}>
                    {item.avatarUrl ? (
                      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Store size={22} color="#2563eb" />
                      </View>
                    )}

                    <View style={styles.info}>
                      <View style={styles.nameRow}>
                        <Text style={styles.name}>
                          {item.businessName || item.displayName || item.username}
                        </Text>
                        {item.isVerified ? (
                          <BadgeCheck size={16} color="#2563eb" />
                        ) : null}
                      </View>
                      <Text style={styles.username}>@{item.username}</Text>
                      {(item.city || item.neighborhood) && (
                        <View style={styles.locationRow}>
                          <MapPin size={12} color="#9ca3af" />
                          <Text style={styles.location}>
                            {[item.neighborhood, item.city].filter(Boolean).join(", ")}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.followers}>
                      <Text style={styles.followersNumber}>
                        {item._count?.followers || 0}
                      </Text>
                      <Text style={styles.followersLabel}>ABONNÉS</Text>
                    </View>
                  </View>

                  {item.businessDomain ? (
                    <Text style={styles.domain}>{item.businessDomain}</Text>
                  ) : null}

                  {previews.length ? (
                    <View style={styles.previewRow}>
                      {previews.map((media, index) => (
                        <Image
                          key={`${media.url}-${index}`}
                          source={{ uri: media.url }}
                          style={styles.preview}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>
                {error || "Aucune boutique disponible pour le moment."}
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
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cover: { width: "100%", height: 105 },
  coverFallback: { width: "100%", height: 72, backgroundColor: "#dbeafe" },
  body: { padding: 13 },
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, marginLeft: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  name: { color: "#111827", fontWeight: "900", fontSize: 15 },
  username: { color: "#6b7280", fontSize: 11, marginTop: 1 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  location: { color: "#9ca3af", fontSize: 10, fontWeight: "600" },
  followers: { alignItems: "center", marginLeft: 8 },
  followersNumber: { color: "#111827", fontWeight: "900", fontSize: 15 },
  followersLabel: { color: "#9ca3af", fontSize: 8, fontWeight: "900" },
  domain: { marginTop: 10, color: "#4b5563", fontSize: 12 },
  previewRow: { flexDirection: "row", gap: 6, marginTop: 12 },
  preview: { flex: 1, height: 120, borderRadius: 12, backgroundColor: "#f3f4f6" },
});
