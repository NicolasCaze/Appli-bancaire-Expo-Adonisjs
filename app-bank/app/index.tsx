import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import AuthService from '@/services/authService'

export default function StartScreen() {
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const isAuthenticated = await AuthService.isAuthenticated()

      if (isAuthenticated) {
        router.replace("/(tabs)")
      } else {
        router.replace("/(auth)/login")
      }
    } catch (error) {
      // En cas d'erreur, rediriger vers le login
      router.replace('/(auth)/login')
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
})
