import React, { useMemo, useState } from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BadgeCheck,
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  MessageSquare,
} from "lucide-react-native";
import type { DealCityPost } from "@/services/api";
import { useVideoPlayer, VideoView } from "expo-video";

function extractInfo(content: string) {
  const productMatch = content.match(/PRODUIT\s*:\s*([^\n]+)/i);
  const priceMatch = content.match(/PRIX\s*:\s*([\d\s,._]+)\s*FCFA/i);
  const descMatch = content.match(
    /DESCRIPTION\s*:\s*\n?([\s\S]*?)(?=\n\n|📞|🔗|$)/i,
  );
  const whatsappMatch = content.match(/WHATSAPP\s*:\s*([^\n]+)/i);
  const locationMatch = content.match(/LOCALISATION\s*:\s*([^\n]+)/i);

  return {
    productName: productMatch?.[1]?.trim() || null,
    price: priceMatch?.[1]?.trim().replace(/\s/g, "") || null,
    description: descMatch?.[1]?.trim() || content,
    whatsappNumber: whatsappMatch?.[1]?.trim() || null,
    location: locationMatch?.[1]?.trim() || null,
  };
}

function formatPrice(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replace(/[^\d]/g, ""));
  if (!Number.isFinite(number)) return String(value);
  return new Intl.NumberFormat("fr-FR").format(number);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function DealVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  return (
    <VideoView
      player={player}
      style={styles.media}
      nativeControls
      contentFit="cover"
      fullscreenOptions={{ enable: true }}
    />
  );
}

export default function PostCard({ post }: { post: DealCityPost }) {
  const [expanded, setExpanded] = useState(false);
  const info = useMemo(() => extractInfo(post.content || ""), [post.content]);

  const productName = info.productName || post.content?.split("\n")[0] || "Article";
  const price = formatPrice(post.price || info.price);
  const stock = post.stock ?? 0;
  const isAvailable = stock > 0;
  const location =
    info.location ||
    [post.neighborhood, post.city].filter(Boolean).join(", ") ||
    null;

  const image = post.attachments?.find((item) => item.type === "IMAGE");
  const video = post.attachments?.find((item) => item.type === "VIDEO");

  const openWhatsApp = async () => {
    if (!isAvailable) return;

    const number = (info.whatsappNumber || post.user?.phoneNumber || "").replace(
      /\D/g,
      "",
    );

    if (!number) return;

    const lines = [
      "Bonjour ! 👋",
      "Je suis intéressé(e) par votre produit sur DealCity :",
      "",
      `*${productName}*`,
      price ? `Prix : *${price} FCFA*` : "",
      "",
      "Est-ce que ce produit est toujours disponible ? Merci !",
    ].filter(Boolean);

    await Linking.openURL(
      `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`,
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.seller}>
          {post.user?.avatarUrl ? (
            <Image source={{ uri: post.user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>
                {(post.user?.displayName || post.user?.username || "D")
                  .slice(0, 1)
                  .toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.sellerText}>
            <View style={styles.nameRow}>
              <Text style={styles.sellerName} numberOfLines={1}>
                {post.user?.businessName ||
                  post.user?.displayName ||
                  post.user?.username ||
                  "Vendeur DealCity"}
              </Text>
              {post.user?.isVerified ? (
                <BadgeCheck size={16} color="#2563eb" />
              ) : null}
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
              {location ? (
                <>
                  <Text style={styles.dot}>•</Text>
                  <MapPin size={12} color="#9ca3af" />
                  <Text style={styles.location} numberOfLines={1}>
                    {location}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.productBlock}>
        <View style={styles.productTop}>
          <View style={styles.productText}>
            <Text style={styles.productName} numberOfLines={2}>
              {productName}
            </Text>

            <View
              style={[
                styles.stockBadge,
                !isAvailable && styles.stockBadgeUnavailable,
              ]}
            >
              <Text
                style={[
                  styles.stockText,
                  !isAvailable && styles.stockTextUnavailable,
                ]}
              >
                {isAvailable
                  ? `DISPONIBLE EN STOCK (${stock})`
                  : "RUPTURE DE STOCK"}
              </Text>
            </View>
          </View>

          {price ? (
            <View style={styles.priceBadge}>
              <Text style={styles.price}>{price}</Text>
              <Text style={styles.currency}> FCFA</Text>
            </View>
          ) : null}
        </View>

        {info.description ? (
          <>
            <Text style={styles.description} numberOfLines={expanded ? undefined : 3}>
              {info.description}
            </Text>
            {info.description.length > 120 ? (
              <TouchableOpacity onPress={() => setExpanded((value) => !value)}>
                <Text style={styles.moreText}>
                  {expanded ? "VOIR MOINS" : "VOIR PLUS"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}
      </View>

      {image ? (
        <Image
          source={{ uri: image.url }}
          style={styles.media}
          resizeMode="cover"
        />
      ) : video ? (
        <DealVideo uri={video.url} />
      ) : null}

      <View style={styles.footer}>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Heart size={20} color="#4b5563" />
            <Text style={styles.metricText}>{post._count?.likes || 0}</Text>
          </View>
          <View style={styles.metric}>
            <MessageSquare size={19} color="#4b5563" />
            <Text style={styles.metricText}>{post._count?.comments || 0}</Text>
          </View>
          <Bookmark size={20} color="#4b5563" />
        </View>

        <TouchableOpacity
          style={[styles.whatsapp, !isAvailable && styles.disabledButton]}
          disabled={!isAvailable}
          onPress={openWhatsApp}
        >
          <MessageCircle size={17} color="#ffffff" />
          <Text style={styles.whatsappText}>
            {isAvailable ? "DISCUTER VIA WHATSAPP" : "INDISPONIBLE"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 0,
    marginBottom: 12,
    overflow: "hidden",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 9,
  },
  seller: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: "#2563eb",
    fontWeight: "900",
    fontSize: 17,
  },
  sellerText: {
    flex: 1,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sellerName: {
    maxWidth: "90%",
    color: "#111827",
    fontWeight: "900",
    fontSize: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 4,
  },
  date: {
    color: "#9ca3af",
    fontWeight: "700",
    fontSize: 10,
    textTransform: "uppercase",
  },
  dot: {
    color: "#d1d5db",
  },
  location: {
    flex: 1,
    color: "#9ca3af",
    fontSize: 10,
    fontWeight: "700",
  },
  productBlock: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  productTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  productText: {
    flex: 1,
    paddingRight: 10,
  },
  productName: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 17,
    textTransform: "uppercase",
  },
  stockBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  stockBadgeUnavailable: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  stockText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#059669",
  },
  stockTextUnavailable: {
    color: "#dc2626",
  },
  priceBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  price: {
    color: "#059669",
    fontWeight: "900",
    fontSize: 17,
  },
  currency: {
    color: "#059669",
    fontWeight: "900",
    fontSize: 9,
  },
  description: {
    marginTop: 9,
    color: "#4b5563",
    fontSize: 12,
    lineHeight: 17,
  },
  moreText: {
    marginTop: 5,
    color: "#2563eb",
    fontSize: 10,
    fontWeight: "900",
  },
  media: {
    width: "100%",
    height: 500,
    backgroundColor: "#f3f4f6",
  },
  videoPlaceholder: {
    width: "100%",
    height: 330,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  videoText: {
    marginTop: 8,
    color: "#ffffff",
    fontWeight: "900",
    letterSpacing: 1,
  },
  footer: {
    minHeight: 58,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricText: {
    color: "#4b5563",
    fontSize: 12,
    fontWeight: "800",
  },
  whatsapp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#25D366",
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  whatsappText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
  },
});
