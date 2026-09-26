import React from 'react';
import { Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { PublicPost } from '@/services/api';

function titleFromContent(content: string) {
  return content.match(/PRODUIT\s*:\s*([^\n]+)/i)?.[1]?.trim() || content.split('\n')[0]?.trim() || 'Annonce DealCity';
}

export default function PostCard({ post }: { post: PublicPost }) {
  const title = titleFromContent(post.content);
  const image = post.attachments?.find(media => media.type === 'IMAGE' && /^https?:\/\//.test(media.url));
  const number = post.user?.phoneNumber?.replace(/\D/g, '');
  const price = post.price > 0 ? `${post.price.toLocaleString('fr-FR')} FCFA` : 'Prix à discuter';

  const contact = async () => {
    if (!number) {
      Alert.alert('Contact indisponible', 'Ce vendeur n’a pas ajouté de numéro WhatsApp.');
      return;
    }
    const message = `Bonjour, je suis intéressé(e) par votre annonce DealCity : ${title}. Le produit est-il toujours disponible ?`;
    try {
      await Linking.openURL(`https://wa.me/${number}?text=${encodeURIComponent(message)}`);
    } catch {
      Alert.alert('WhatsApp indisponible', 'Impossible d’ouvrir le contact sur cet appareil.');
    }
  };

  return <View style={styles.card}>
    <View style={styles.sellerRow}>
      {post.user?.avatarUrl ? <Image source={{ uri: post.user.avatarUrl }} style={styles.avatar} /> : <View style={styles.placeholder}><Text style={styles.initial}>{(post.user?.displayName || 'D')[0].toUpperCase()}</Text></View>}
      <View style={styles.sellerInfo}>
        <Text style={styles.seller}>{post.user?.displayName || post.user?.username || 'Vendeur DealCity'}</Text>
        <Text style={styles.date}>{new Date(post.createdAt).toLocaleDateString('fr-FR')}</Text>
      </View>
    </View>
    {image && <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" />}
    <View style={styles.details}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>{price}</Text>
      {post.content && <Text numberOfLines={4} style={styles.description}>{post.content}</Text>}
      <Text style={styles.counts}>{post._count?.likes ?? 0} j’aime · {post._count?.comments ?? 0} commentaires</Text>
      <TouchableOpacity accessibilityRole="button" style={styles.contact} onPress={() => void contact()}>
        <Text style={styles.contactText}>Contacter sur WhatsApp</Text>
      </TouchableOpacity>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 12, marginTop: 12, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  sellerRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  placeholder: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e8f1fc', justifyContent: 'center', alignItems: 'center' },
  initial: { color: '#4a90e2', fontWeight: '800' },
  sellerInfo: { flex: 1 },
  seller: { color: '#111827', fontWeight: '800', fontSize: 14 },
  date: { color: '#6b7280', fontSize: 11, marginTop: 2 },
  image: { width: '100%', height: 280, backgroundColor: '#f3f4f6' },
  details: { padding: 16, gap: 8 },
  title: { color: '#111827', fontSize: 18, fontWeight: '800' },
  price: { color: '#16803c', fontSize: 18, fontWeight: '900' },
  description: { color: '#4b5563', lineHeight: 21 },
  counts: { color: '#6b7280', fontSize: 12 },
  contact: { backgroundColor: '#16a34a', padding: 13, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  contactText: { color: '#fff', fontWeight: '800' },
});
