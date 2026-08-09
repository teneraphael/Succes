import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Linking, ActivityIndicator, RefreshControl, Image, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { MessageCircle, Bell, Search, Heart, MessageSquare, Bookmark, MoreHorizontal, UserPlus, Check } from 'lucide-react-native';
import { supabase } from '@/services/supabase';

const { width } = Dimensions.get('window');

export default function TabOneScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({});

  const fetchPostsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_media (*),
          user:users (*)
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

  const openWhatsApp = (phone: string, username: string, title: string, price: any) => {
    if (!phone) {
      alert("Numéro WhatsApp indisponible pour ce vendeur.");
      return;
    }
    const cleanNumber = phone.replace(/\D/g, "");
    const message = encodeURIComponent(`Bonjour ! 👋\nJe suis intéressé(e) par votre produit sur *DealCity* :\n\n*${title}*\nPrix : *${price ? price + ' FCFA' : 'Sur devis'}*\n\nEst-ce que ce produit est toujours disponible ? Merci !`);
    const url = `https://wa.me/${cleanNumber}?text=${message}`;
    
    Linking.openURL(url).catch(() => {
      alert("Impossible d'ouvrir WhatsApp sur cet appareil.");
    });
  };

  const toggleFollow = (userId: string) => {
    setFollowingState(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête DealCity */}
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

      {/* Onglets : POUR VOUS / ABONNEMENTS */}
      <View style={styles.tabsContainer}>
        <View style={styles.activeTabButton}>
          <Text style={styles.activeTabText}>POUR VOUS</Text>
        </View>
        <TouchableOpacity style={styles.inactiveTabButton}>
          <Text style={styles.inactiveTabText}>ABONNEMENTS</Text>
        </TouchableOpacity>
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
            const mediaList = item.post_media || [];
            const vendorUsername = item.user?.username || item.username || 'Presy Services';
            const vendorPhone = item.user?.phone || item.user?.phoneNumber || item.phone || '';
            const isFollowed = followingState[item.user_id || '1'] || false;
            
            // Formatage de la date (ex: 29 JUIL.)
            const postDate = item.createdAt 
              ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase() 
              : '29 JUIL.';

            return (
              <View style={styles.card}>
                
                {/* 1. EN-TÊTE DU POST (Vendeur, Suivre, Options) */}
                <View style={styles.postHeader}>
                  <View style={styles.vendorInfoRow}>
                    {item.user?.avatarUrl ? (
                      <Image source={{ uri: item.user.avatarUrl }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{vendorUsername[0].toUpperCase()}</Text>
                      </View>
                    )}
                    <View>
                      <View style={styles.usernameRow}>
                        <Text style={styles.vendorName}>{vendorUsername}</Text>
                        <Text style={styles.ratingStars}> ★★★★★</Text>
                      </View>
                      <View style={styles.subVendorRow}>
                        <TouchableOpacity 
                          style={[styles.followButton, isFollowed && styles.followingButton]}
                          onPress={() => toggleFollow(item.user_id || '1')}
                        >
                          {isFollowed ? (
                            <>
                              <Check size={12} color="#059669" />
                              <Text style={styles.followingText}>SUIVI !</Text>
                            </>
                          ) : (
                            <>
                              <UserPlus size={12} color="#2563eb" />
                              <Text style={styles.followText}>SUIVRE</Text>
                            </>
                          )}
                        </TouchableOpacity>
                        <Text style={styles.postDate}>{postDate}.</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <MoreHorizontal size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {/* 2. TITRE, STOCK ET PRIX */}
                <View style={styles.productDetailsContainer}>
                  <View style={styles.titlePriceRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {item.title || item.content || 'SAVONS LONGRICH'}
                      </Text>
                      <View style={styles.stockBadge}>
                        <Text style={styles.stockText}>DISPONIBLE EN STOCK ({item.stock || 150})</Text>
                      </View>
                    </View>

                    {/* Badge de prix style pilule */}
                    <View style={styles.pricePill}>
                      <Text style={styles.priceNumber}>{item.price ? item.price : '2000'}</Text>
                      <Text style={styles.priceCurrency}> FCFA</Text>
                    </View>
                  </View>

                  {/* Description textuelle */}
                  {item.title && item.content && (
                    <Text style={styles.description} numberOfLines={3}>{item.content}</Text>
                  )}
                </View>

                {/* 3. SECTION MÉDIAS (Grille / Image unique avec badges) */}
                {mediaList.length > 0 && (
                  <View style={styles.mediaContainer}>
                    {mediaList.length === 1 ? (
                      <Image source={{ uri: mediaList[0].url || mediaList[0].image_url }} style={styles.singleImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.gridContainer}>
                        {mediaList.slice(0, 4).map((media: any, index: number) => {
                          const isLastAndMore = index === 3 && mediaList.length > 4;
                          return (
                            <View key={index} style={styles.gridItem}>
                              <Image 
                                source={{ uri: media.url || media.image_url }} 
                                style={[styles.gridImage, isLastAndMore && { opacity: 0.4 }]} 
                                resizeMode="cover" 
                              />
                              {isLastAndMore && (
                                <View style={styles.moreMediaOverlay}>
                                  <Text style={styles.moreMediaText}>+{mediaList.length - 3}</Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}

                {/* 4. PIED DE CARTE (Likes, Commentaires, Favoris, Bouton WhatsApp) */}
                <View style={styles.cardFooterActions}>
                  <View style={styles.socialMetrics}>
                    <TouchableOpacity style={styles.metricItem}>
                      <Heart size={20} color="#4b5563" />
                      <Text style={styles.metricText}>{item.likes_count || 2}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.metricItem}>
                      <MessageSquare size={20} color="#4b5563" />
                      <Text style={styles.metricText}>{item.comments_count || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.metricItem}>
                      <Bookmark size={20} color="#4b5563" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={styles.whatsappButton} 
                    onPress={() => openWhatsApp(vendorPhone, vendorUsername, item.title || item.content || 'Article', item.price)}
                  >
                    <MessageCircle size={16} color="#ffffff" fill="#ffffff" />
                    <Text style={styles.whatsappText}>DISCUTER VIA WHATSAPP</Text>
                  </TouchableOpacity>
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
    backgroundColor: '#f3f4f6',
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
    fontSize: 24,
    fontWeight: '900',
    color: '#2563eb',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'transparent',
  },
  iconButton: {
    padding: 4,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  activeTabButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  inactiveTabButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inactiveTabText: {
    color: '#4b5563',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: 'transparent',
  },
  listContainer: {
    padding: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'transparent',
  },
  vendorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3730a3',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  ratingStars: {
    fontSize: 10,
    color: '#e5e7eb',
  },
  subVendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 3,
  },
  followingButton: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  followText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563eb',
  },
  followingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  postDate: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
  },
  moreButton: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  productDetailsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    textTransform: 'uppercase',
  },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  stockText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  priceNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
  },
  priceCurrency: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  description: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
    lineHeight: 16,
  },
  mediaContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#000000',
    marginTop: 6,
  },
  singleImage: {
    width: '100%',
    height: '100%',
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    height: '50%',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: '#ffffff',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  moreMediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMediaText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardFooterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  socialMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'transparent',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  metricText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  whatsappText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});