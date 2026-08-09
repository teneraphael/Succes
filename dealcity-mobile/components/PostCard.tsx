import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image as RNImage, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";

const { width } = Dimensions.get("window");

// Fonction d'extraction identique au web
const extractInfo = (content: string) => {
  const productMatch = content.match(/PRODUIT\s*:\s*([^\n]+)/i);
  const priceMatch = content.match(/PRIX\s*:\s*([\d\s,._]+)\s*FCFA/i);
  const descMatch = content.match(/DESCRIPTION\s*:\s*\n?([\s\S]*?)(?=\n\n|📞|🔗|$)/i);
  const whatsappMatch = content.match(/WHATSAPP\s*:\s*([^\n]+)/i);
  return {
    productName: productMatch ? productMatch[1].trim() : null,
    price: priceMatch ? priceMatch[1].trim().replace(/\s/g, "") : null,
    cleanDescription: descMatch ? descMatch[1].trim() : content,
    whatsappNumber: whatsappMatch ? whatsappMatch[1].trim() : null,
  };
};

export default function PostCard({ post }: { post: any }) {
  const { productName, price: defaultPrice, cleanDescription, whatsappNumber } = extractInfo(post.content);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeVariant, setActiveVariant] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Gestion des attributs et variantes comme sur le web
  useEffect(() => {
    if (post.attributes && post.attributes.length > 0) {
      const initialSelection: Record<string, string> = {};
      post.attributes.forEach((attr: any) => {
        if (attr.values && attr.values.length > 0) initialSelection[attr.name] = attr.values[0];
      });
      setSelectedAttributes(initialSelection);
    }
  }, [post.attributes]);

  useEffect(() => {
    if (post.variants && post.variants.length > 0 && Object.keys(selectedAttributes).length > 0) {
      const matched = post.variants.find((variant: any) => {
        const combo = variant.combinations as Record<string, string>;
        return Object.entries(selectedAttributes).every(([key, value]) => combo[key] === value);
      });
      setActiveVariant(matched || null);
    }
  }, [selectedAttributes, post.variants]);

  const currentStock = activeVariant !== null ? activeVariant.stock : (post.stock ?? 0);
  const currentPrice = activeVariant !== null ? activeVariant.price.toLocaleString() : (defaultPrice || "0");
  const isAvailable = currentStock > 0;

  const visualAttachments = post.attachments?.filter((m: any) => m.type !== "AUDIO") || [];

  // Action WhatsApp identique
  const handleWhatsApp = () => {
    if (!isAvailable) return;
    const number = whatsappNumber || post.user?.phoneNumber || post.user?.phone || "";
    if (!number) return;

    const choiceLabel = Object.entries(selectedAttributes).map(([key, val]) => `${key}: ${val}`).join(", ");
    const lines: string[] = [];
    lines.push("Bonjour ! 👋");
    lines.push(`Je suis intéressé(e) par votre produit sur *DealCity* :`);
    lines.push("");
    lines.push(`*${productName || "Article"}*`);
    lines.push(`Prix : *${currentPrice} FCFA*`);
    if (choiceLabel) lines.push(`Options choisies : *${choiceLabel}*`);
    lines.push("");
    lines.push("Est-ce que ce produit est toujours disponible ? Merci !");

    const cleanNumber = number.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join("\n"))}`);
  };

  return (
    <View className="bg-white dark:bg-zinc-900 w-full mb-4 border-b border-gray-200 dark:border-zinc-800 shadow-sm md:rounded-2xl overflow-hidden">
      
      {/* En-tête (Utilisateur) */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <View className="flex-row items-center gap-3">
          {post.user?.avatarUrl ? (
            <RNImage source={{ uri: post.user.avatarUrl }} className="size-10 rounded-full" />
          ) : (
            <View className="size-10 rounded-full bg-gray-300 items-center justify-center">
              <Text className="font-bold text-gray-600">{post.user?.displayName?.[0] || "U"}</Text>
            </View>
          )}
          <View>
            <View className="flex-row items-center gap-1">
              <Text className="font-extrabold text-sm text-gray-900 dark:text-white">
                {post.user?.displayName || post.user?.username}
              </Text>
              {post.user?.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color="#4a90e2" />
              )}
            </View>
            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Nom + Prix + Stock */}
      <View className="px-4 py-1 flex-row items-start justify-between gap-2">
        <View className="flex-1">
          {productName && (
            <Text className="font-black text-lg uppercase tracking-tight text-gray-900 dark:text-white">
              {productName}
            </Text>
          )}
          {isAvailable ? (
            <View className="self-start mt-1 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
              <Text className="text-[9px] font-black uppercase tracking-widest text-green-600">
                Disponible ({currentStock})
              </Text>
            </View>
          ) : (
            <View className="self-start mt-1 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
              <Text className="text-[9px] font-black uppercase tracking-widest text-red-600">
                Rupture de stock
              </Text>
            </View>
          )}
        </View>

        {currentPrice && (
          <View className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-xl transform -rotate-1">
            <Text className="text-lg font-black text-green-600 tracking-tighter">
              {currentPrice} <Text className="text-[10px]">FCFA</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Description avec Voir plus / Voir moins */}
      {cleanDescription && (
        <View className="px-4 py-2">
          <Text className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed" numberOfLines={isExpanded ? undefined : 3}>
            {cleanDescription}
          </Text>
          {cleanDescription.length > 120 && (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} className="mt-1">
              <Text className="text-[10px] font-black uppercase text-[#4a90e2] tracking-wide">
                {isExpanded ? "Voir moins" : "Voir plus"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Médias (Images du post) */}
      {visualAttachments.length > 0 && (
        <View className="w-full h-80 bg-black mt-2">
          <RNImage
            source={{ uri: visualAttachments[0].url }}
            className="w-full h-full object-cover"
            resizeMode="cover"
          />
        </View>
      )}

      {/* Attributs / Variantes interactives */}
      {post.attributes && post.attributes.length > 0 && (
        <View className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 space-y-2">
          {post.attributes.map((attr: any) => (
            <View key={attr.id || attr.name}>
              <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                {attr.name}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {attr.values.map((val: string) => {
                  const isSelected = selectedAttributes[attr.name] === val;
                  return (
                    <TouchableOpacity
                      key={val}
                      onPress={() => setSelectedAttributes((prev: any) => ({ ...prev, [attr.name]: val }))}
                      className={`px-3 py-1.5 rounded-xl border-2 ${
                        isSelected
                          ? "bg-[#4a90e2] border-[#4a90e2]"
                          : "bg-transparent border-gray-200 dark:border-zinc-700"
                      }`}
                    >
                      <Text className={`text-[10px] font-black uppercase ${isSelected ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                        {val}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Bas du post : Likes, Commentaires & Bouton WhatsApp */}
      <View className="px-4 py-3 flex-row items-center justify-between border-t border-gray-100 dark:border-zinc-800">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Ionicons name="heart-outline" size={20} color="gray" />
            <Text className="text-xs font-bold text-gray-600 dark:text-gray-400">{post._count?.likes || 0}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="chatbubble-outline" size={18} color="gray" />
            <Text className="text-xs font-bold text-gray-600 dark:text-gray-400">{post._count?.comments || 0}</Text>
          </View>
        </View>

        {/* Bouton WhatsApp */}
        <TouchableOpacity
          onPress={handleWhatsApp}
          disabled={!isAvailable}
          className={`flex-row items-center gap-2 px-4 py-2 rounded-xl shadow-sm ${
            isAvailable ? "bg-[#25D366]" : "bg-gray-300 opacity-50"
          }`}
        >
          <MaterialCommunityIcons name="whatsapp" size={16} color="white" />
          <Text className="text-[10px] font-black uppercase text-white tracking-widest">
            {isAvailable ? "Discuter via WhatsApp" : "Indisponible"}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}