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
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/services/api";
import { saveSessionToken } from "@/services/session";

export default function AuthScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (isSignUp) {
      if (!username.trim() || !email.trim() || !password) {
        Alert.alert("Champs requis", "Renseigne ton nom d'utilisateur, ton email et ton mot de passe.");
        return;
      }

      if (password.length < 8) {
        Alert.alert("Mot de passe", "Le mot de passe doit contenir au moins 8 caractères.");
        return;
      }
    } else if (!identifier.trim() || !password) {
      Alert.alert("Champs requis", "Renseigne ton identifiant et ton mot de passe.");
      return;
    }

    try {
      setLoading(true);

      const result = isSignUp
        ? await api.auth.signup(username.trim(), email.trim(), password)
        : await api.auth.login(identifier.trim(), password);

      await saveSessionToken(result.token);

      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Connexion impossible",
        error?.message || "Une erreur est survenue. Réessaie.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandBlock}>
          <Text style={styles.logo}>DEALCITY</Text>
          <Text style={styles.tagline}>
            {isSignUp
              ? "Crée ton compte et rejoins le commerce local."
              : "Retrouve ton compte DealCity."}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeButton, !isSignUp && styles.modeButtonActive]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.modeText, !isSignUp && styles.modeTextActive]}>
                CONNEXION
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, isSignUp && styles.modeButtonActive]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.modeText, isSignUp && styles.modeTextActive]}>
                INSCRIPTION
              </Text>
            </TouchableOpacity>
          </View>

          {isSignUp ? (
            <>
              <Text style={styles.label}>Nom d'utilisateur</Text>
              <View style={styles.inputRow}>
                <User size={18} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="ex: vendeur237"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <Text style={styles.label}>Adresse email</Text>
              <View style={styles.inputRow}>
                <Mail size={18} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="email@exemple.com"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Email ou nom d'utilisateur</Text>
              <View style={styles.inputRow}>
                <User size={18} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Ton identifiant DealCity"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </>
          )}

          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputRow}>
            <Lock size={18} color="#9ca3af" />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!visible}
              autoCapitalize="none"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity onPress={() => setVisible((value) => !value)}>
              {visible ? (
                <EyeOff size={19} color="#9ca3af" />
              ) : (
                <Eye size={19} color="#9ca3af" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submit, loading && styles.submitDisabled]}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitText}>
                {isSignUp ? "CRÉER MON COMPTE" : "SE CONNECTER"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchLink}
            onPress={() => setIsSignUp((value) => !value)}
          >
            <Text style={styles.switchText}>
              {isSignUp
                ? "Tu as déjà un compte ? Se connecter"
                : "Pas encore de compte ? S'inscrire"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          Le même compte fonctionne sur dealcity.app et dans l'application mobile.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 30,
  },
  brandBlock: { alignItems: "center", marginBottom: 24 },
  logo: {
    color: "#2563eb",
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  tagline: {
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modeRow: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 4,
    borderRadius: 14,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    height: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonActive: {
    backgroundColor: "#2563eb",
  },
  modeText: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "900",
  },
  modeTextActive: {
    color: "#ffffff",
  },
  label: {
    color: "#374151",
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 6,
    marginTop: 8,
  },
  inputRow: {
    height: 52,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#111827",
    fontSize: 14,
    marginLeft: 9,
  },
  submit: {
    height: 53,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  submitDisabled: { opacity: 0.65 },
  submitText: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  switchLink: { alignItems: "center", paddingTop: 17, paddingBottom: 3 },
  switchText: { color: "#2563eb", fontWeight: "700", fontSize: 12 },
  note: {
    color: "#9ca3af",
    textAlign: "center",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 16,
    paddingHorizontal: 20,
  },
});
