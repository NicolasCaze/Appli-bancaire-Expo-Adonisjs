import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
      headerStyle: {
        backgroundColor: 'transparent', // Transparent pour voir le gradient
      },
      headerShadowVisible: false,
      headerTintColor: '#fff',
      tabBarStyle: {
        backgroundColor: 'transparent', // Transparent
        borderTopWidth: 0,
        position: 'absolute', // Important pour le rendre au-dessus du gradient
        elevation: 0,
      },
      headerTransparent: true, // Rend le header transparent
    }}>
      <Tabs.Screen 
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }} />
      <Tabs.Screen 
        name="transfert"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 name="arrow-right-arrow-left" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}