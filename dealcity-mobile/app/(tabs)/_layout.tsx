import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Home, Search, PlusCircle, User } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // On mobile, the website supplies its own navigation inside the WebView.
  const native = Platform.OS !== 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          display: native ? 'none' : 'flex',
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home color={color} size={size || 24} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: native ? null : undefined,
          title: 'Recherche',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Search color={color} size={size || 24} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          href: native ? null : undefined,
          title: 'Publier',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <PlusCircle color="#4a90e2" size={size || 24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: native ? null : undefined,
          title: 'Profil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User color={color} size={size || 24} />,
        }}
      />
    </Tabs>
  );
}
