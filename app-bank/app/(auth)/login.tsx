import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import AuthService from '@/services/authService'
import BiometricAuth from '@/services/biometricAuth'
import SecureStorage from '@/services/secureStorage'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * Se connecter avec email et mot de passe
   */
  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs')
      return
    }

    setLoading(true)

    try {
      await AuthService.login(email, password)
      router.replace('/(tabs)')
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de se connecter')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Se connecter avec Face ID
   */
  const handleBiometricLogin = async () => {
    try {
      setLoading(true)
      
      const isBiometricEnabled = await SecureStorage.isBiometricEnabled()

      if (!isBiometricEnabled) {
        Alert.alert('Face ID désactivé', 'Vous devez activer Face ID lors de l\'inscription')
        setLoading(false)
        return
      }

      const credentials = await SecureStorage.getCredentials()

      if (!credentials) {
        Alert.alert('Erreur', 'Aucun identifiant sauvegardé. Connectez-vous avec email/mot de passe.')
        setLoading(false)
        return
      }

      const success = await BiometricAuth.authenticate('Connectez-vous avec Face ID')

      if (success) {
        await AuthService.login(credentials.email, credentials.password)
        router.replace('/(tabs)')
      } else {
        setLoading(false)
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Authentification échouée')
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Connexion</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
        >
          <Text style={styles.biometricText}>Se connecter avec Face ID</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.linkText}>Pas encore de compte ? S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600'
  },
  biometricButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    marginTop: 15
  },
  biometricText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600'
  },
  linkButton: {
    marginTop: 20
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14
  }
})
