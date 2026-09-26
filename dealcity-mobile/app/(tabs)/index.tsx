import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PostCard from '@/components/PostCard';
import { getForYouPage, PublicPost } from '@/services/api';

export default function HomeScreen() {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const loadFirstPage = useCallback(async (refresh = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const page = await getForYouPage();
      setPosts(page.posts);
      setCursor(page.nextCursor);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de charger les annonces.');
    } finally {
      inFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!cursor || inFlight.current) return;
    inFlight.current = true;
    setLoadingMore(true);
    try {
      const page = await getForYouPage(cursor);
      setPosts(previous => {
        const ids = new Set(previous.map(post => post.id));
        return [...previous, ...page.posts.filter(post => !ids.has(post.id))];
      });
      setCursor(page.nextCursor);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de charger la suite.');
    } finally {
      inFlight.current = false;
      setLoadingMore(false);
    }
  }, [cursor]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}><Text style={styles.title}>DealCity</Text><Text style={styles.subtitle}>Pour vous</Text></View>
      {loading && posts.length === 0 ? <ActivityIndicator style={styles.center} size="large" color="#4a90e2" /> : (
        <FlatList
          data={posts}
          keyExtractor={post => post.id}
          renderItem={({ item }) => <PostCard post={item} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadFirstPage(true)} />}
          ListEmptyComponent={!error ? <Text style={styles.message}>Aucune annonce disponible.</Text> : null}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} color="#4a90e2" /> : null}
        />
      )}
      {error && <View style={styles.error}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => posts.length ? void loadMore() : void loadFirstPage()}><Text style={styles.retry}>Réessayer</Text></TouchableOpacity></View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#fff', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10 },
  title: { color: '#4a90e2', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#6b7280', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  center: { flex: 1 },
  footer: { padding: 16 },
  message: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
  error: { backgroundColor: '#fff1f2', padding: 14, alignItems: 'center' },
  errorText: { color: '#9f1239' },
  retry: { color: '#2563eb', fontWeight: '700', marginTop: 6 },
});
