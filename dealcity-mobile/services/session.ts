import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "dealcity_session_token";

export async function getSessionToken() {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(SESSION_KEY);
  }

  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function saveSessionToken(token: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_KEY, token);
    }
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, token);
}

export async function clearSessionToken() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_KEY);
    }
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}
