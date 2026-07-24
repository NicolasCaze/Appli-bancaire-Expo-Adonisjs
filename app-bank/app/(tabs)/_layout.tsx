import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FinygoSplash() {
  return (
    <LinearGradient
      colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
      style={splash.container}
    >
      <Text style={splash.title}>Finygo</Text>
    </LinearGradient>
  )
}

const splash = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: 1,
  },
})

export default function TabLayout() {
  const { loading } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) {
    return <FinygoSplash />
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: '#8E8E93',
      headerStyle: {
        backgroundColor: 'transparent',
      },
      headerShadowVisible: false,
      headerTintColor: '#fff',
      tabBarStyle: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        position: 'absolute',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        paddingBottom: 8 + insets.bottom,
        paddingTop: 8,
        height: 65 + insets.bottom,
      },
      tabBarItemStyle: {
        paddingVertical: 4,
      },
      headerTransparent: true,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerShown: false,
          tabBarAccessibilityLabel: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }} />
      <Tabs.Screen
        name="transfert"
        options={{
          title: 'Virements',
          headerShown: false,
          tabBarAccessibilityLabel: 'Virements',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="arrow-right-arrow-left" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
