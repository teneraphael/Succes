import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Box,
  DollarSign,
  MapPin,
  PackagePlus,
  Tag,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { api, ApiError } from "@/services/api";

export default function CreateScreen() {
  const router = useRouter();
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!product.trim() || !price.trim() || !city.trim()) {
      Alert.alert(
        "Informations manquantes",
        "Indique au minimum le produit, son prix et la ville.",
      );
      return;
    }

    const numericPrice = Number(price.replace(/\D/g, ""));
    const numericStock = Math.max(0, Number(stock.replace(/\D/g, "")) || 0);

    if (!numericPrice) {
      Alert.alert("Prix invalide", "Entre un prix valide en FCFA.");
      return;
    }

    const content = [
      `PRODUIT : ${product.trim()}`,
      `PRIX : ${numericPrice} FCFA`,
      "",
      "DESCRIPTION :",
      description.trim() || product.trim(),
      "",
      `LOCALISATION : ${[neighborhood.trim(), city.trim()]
        .filter(Boolean)
        .join(", ")}`,
      whatsapp.trim() ? `WHATSAPP : ${whatsapp.trim()}` : "",
    ]
      .filter((line) => line !== "")
      .join("\n");

    try {
      setLoading(true);

      await api.posts.create({
        content,
        city: city.trim(),
        neighborhood: neighborhood.trim(),
        stock: numericStock,
        mediaIds: [],
      });

      Alert.alert(
        "Annonce envoyée",
        "Ton annonce a bien été transmise à DealCity.",
        [
          {
            text: "Voir l'accueil",
            onPress: () => router.replace("/(tabs)"),
          },
        ],
      );

      setProduct("");
      setPrice("");
      setStock("1");
      setCity("");
      setNeighborhood("");
      setDescription("");
      setWhatsapp("");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        Alert.alert(
          "Connexion requise",
          "Connecte-toi avec ton compte DealCity avant de publier.",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Se connecter", onPress: () => router.push("/auth") },
          ],
        );
        return;
      }

      Alert.alert(
        "Publication impossible",
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant la publication.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>PUBLIER UNE AFFAIRE</Text>
          <Text style={styles.subtitle}>
            Ajoute un produit à la marketplace DealCity
          </Text>
        </View>
        <PackagePlus size={27} color="#2563eb" />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <FieldLabel label="Nom du produit" />
        <InputRow icon={<Tag size={18} color="#9ca3af" />}>
          <TextInput
            style={styles.input}
            value={product}
            onChangeText={setProduct}
            placeholder="Ex : iPhone 13 Pro"
            placeholderTextColor="#9ca3af"
          />
        </InputRow>

        <View style={styles.doubleRow}>
          <View style={styles.doubleItem}>
            <FieldLabel label="Prix (FCFA)" />
            <InputRow icon={<DollarSign size={18} color="#9ca3af" />}>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="25000"
                placeholderTextColor="#9ca3af"
              />
            </InputRow>
          </View>

          <View style={styles.doubleItem}>
            <FieldLabel label="Stock" />
            <InputRow icon={<Box size={18} color="#9ca3af" />}>
              <TextInput
                style={styles.input}
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor="#9ca3af"
              />
            </InputRow>
          </View>
        </View>

        <View style={styles.doubleRow}>
          <View style={styles.doubleItem}>
            <FieldLabel label="Ville" />
            <InputRow icon={<MapPin size={18} color="#9ca3af" />}>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Douala"
                placeholderTextColor="#9ca3af"
              />
            </InputRow>
          </View>

          <View style={styles.doubleItem}>
            <FieldLabel label="Quartier" />
            <InputRow icon={<MapPin size={18} color="#9ca3af" />}>
              <TextInput
                style={styles.input}
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="Akwa"
                placeholderTextColor="#9ca3af"
              />
            </InputRow>
          </View>
        </View>

        <FieldLabel label="Numéro WhatsApp" />
        <InputRow icon={<Text style={styles.whatsappIcon}>WA</Text>}>
          <TextInput
            style={styles.input}
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="phone-pad"
            placeholder="+237 6..."
            placeholderTextColor="#9ca3af"
          />
        </InputRow>

        <FieldLabel label="Description" />
        <TextInput
          style={styles.textarea}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          placeholder="État du produit, caractéristiques, livraison..."
          placeholderTextColor="#9ca3af"
        />

        <View style={styles.mediaNotice}>
          <Text style={styles.mediaNoticeTitle}>PHOTOS & VIDÉOS</Text>
          <Text style={styles.mediaNoticeText}>
            L'ajout de médias natifs sera relié au système UploadThing de DealCity
            dans la prochaine couche du formulaire. Le backend de publication est
            déjà connecté.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submit, loading && styles.submitDisabled]}
          disabled={loading}
          onPress={submit}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <PackagePlus size={19} color="#ffffff" />
              <Text style={styles.submitText}>PUBLIER SUR DEALCITY</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.label}>{label}</Text>;
}

function InputRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.inputRow}>
      {icon}
      {children}
    </View>
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
  title: { color: "#111827", fontSize: 19, fontWeight: "900" },
  subtitle: { color: "#6b7280", fontSize: 11, marginTop: 2 },
  form: { padding: 16, paddingBottom: 35 },
  label: {
    color: "#374151",
    fontWeight: "800",
    fontSize: 12,
    marginTop: 12,
    marginBottom: 6,
  },
  inputRow: {
    height: 51,
    borderRadius: 13,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    marginLeft: 8,
    color: "#111827",
    fontSize: 14,
  },
  doubleRow: { flexDirection: "row", gap: 10 },
  doubleItem: { flex: 1 },
  textarea: {
    minHeight: 125,
    borderRadius: 13,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#111827",
    fontSize: 14,
  },
  whatsappIcon: {
    color: "#16a34a",
    fontSize: 10,
    fontWeight: "900",
  },
  mediaNotice: {
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    padding: 13,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  mediaNoticeTitle: {
    color: "#2563eb",
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 0.7,
  },
  mediaNoticeText: {
    color: "#4b5563",
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16,
  },
  submit: {
    marginTop: 20,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitDisabled: { opacity: 0.65 },
  submitText: { color: "#ffffff", fontSize: 11, fontWeight: "900" },
});
