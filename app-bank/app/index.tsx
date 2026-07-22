import { useEffect, useState } from 'react'
import { Text, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/Colors'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function StartScreen() {
  const { user, loading } = useAuth()
  const [timerDone, setTimerDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setTimerDone(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (timerDone && !loading) {
      if (user) {
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/login')
      }
    }
  }, [timerDone, loading, user])

  return (
    <LinearGradient
      colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Finygo</Text>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
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
