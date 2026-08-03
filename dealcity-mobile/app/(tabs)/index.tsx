import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Linking, ActivityIndicator, RefreshControl, Image, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { MessageCircle, Bell, Search } from 'lucide-react-native';
import { supabase } from '@/services/supabase';

const { width } = Dimensions.get('window');

export default function TabOneScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPostsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_media (*)
        `)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      if (data) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Erreur chargement posts :', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPostsFromSupabase();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPostsFromSupabase();
  }, []);

  const openWhatsApp = (username: string, content: string) => {
    const message = encodeURIComponent(`Salut @${username}, je viens de voir ton annonce "${content}" sur DealCity. C'est toujours disponible ?`);
    const url = `https://wa.me/?text=${message}`;
    
    Linking.openURL(url).catch(() => {
      alert("Impossible d'ouvrir WhatsApp sur cet appareil.");
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête DealCity fidèle à tes maquettes */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>DEALCITY</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={22} color="#1f2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={22} color="#1f2937" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Barre de sous-titre / fil d'actualité */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderTitle}>Fil d'actualité & Deals</Text>
      </View>

      {/* Chargement initial */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
          }
          renderItem={({ item }: { item: any }) => {
            const postImage = item.post_media && item.post_media.length > 0 ? item.post_media[0].url || item.post_media[0].image_url : null;
            const mediaCount = item.post_media ? item.post_media.length : 0;

            return (
              <View style={styles.card}>
                {/* Image principale de l'article avec badge du nombre de photos additionnelles */}
                {postImage && (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: postImage }} 
                      style={styles.postImage} 
                      resizeMode="cover"
                    />
                    {mediaCount > 1 && (
                      <View style={styles.mediaCountBadge}>
                        <Text style={styles.mediaCountText}>+{mediaCount - 1}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Corps de la carte */}
                <View style={styles.cardBody}>
                  <Text style={styles.productTitle} numberOfLines={1}>{item.title || item.content || 'ARTICLE'}</Text>
                  
                  {/* Badge de stock inspiré de tes maquettes */}
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockText}>DISPONIBLE EN STOCK</Text>
                  </View>

                  <Text style={styles.description} numberOfLines={2}>{item.content}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{item.price ? `${item.price} FCFA` : 'Prix non spécifié'}</Text>
                  </View>

                  {/* Pied de carte : Vendeur & Bouton WhatsApp */}
                  <View style={styles.cardFooter}>
                    <View style={styles.vendorInfo}>
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{(item.username || 'V')[0].toUpperCase()}</Text>
                      </View>
                      <Text style={styles.username} numberOfLines={1}>@{item.username || 'vendeur'}</Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.whatsappButton} 
                      onPress={() => openWhatsApp(item.username || 'Vendeur', item.title || item.content || 'Annonce')}
                    >
                      <MessageCircle size={14} color="#ffffff" />
                      <Text style={styles.whatsappText}>Discuter</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.loaderContainer}>
              <Text style={{ color: '#6b7280' }}>Aucune annonce pour le moment.</Text>
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
    backgroundColor: '#f4f6f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563eb',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  iconButton: {
    padding: 6,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  subHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  subHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: 'transparent',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
    backgroundColor: 'transparent',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  mediaCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mediaCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 14,
    backgroundColor: 'transparent',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  description: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 18,
  },
  priceRow: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: 'transparent',
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3730a3',
  },
  username: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  whatsappText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});