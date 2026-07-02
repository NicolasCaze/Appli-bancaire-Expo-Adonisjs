import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
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
        paddingBottom: 8,
        paddingTop: 8,
        height: 65,
      },
      tabBarItemStyle: {
        paddingVertical: 4,
      },
      headerTransparent: true,
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