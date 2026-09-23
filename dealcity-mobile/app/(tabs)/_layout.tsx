import { Tabs } from "expo-router";
import {
  Home,
  PlaySquare,
  PlusCircle,
  Store,
  User,
} from "lucide-react-native";

const ACTIVE = "#2563eb";
const INACTIVE = "#6b7280";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          paddingBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          height: 66,
          paddingTop: 7,
          paddingBottom: 7,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size || 23} />
          ),
        }}
      />

      <Tabs.Screen
        name="videos"
        options={{
          title: "Vidéos",
          tabBarIcon: ({ color, size }) => (
            <PlaySquare color={color} size={size || 23} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "Publier",
          tabBarIcon: ({ size }) => (
            <PlusCircle color={ACTIVE} size={(size || 23) + 4} />
          ),
        }}
      />

      <Tabs.Screen
        name="shops"
        options={{
          title: "Boutiques",
          tabBarIcon: ({ color, size }) => (
            <Store color={color} size={size || 23} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size || 23} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
