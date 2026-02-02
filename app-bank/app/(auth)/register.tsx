import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { router } from 'expo-router'
import AuthService from '@/services/authService'
import BiometricAuth from '@/services/biometricAuth'
import SecureStorage from '@/services/secureStorage'

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateNaissance: '',
    lieuNaissance: '',
    adresse: ''
  })
  const [loading, setLoading] = useState(false)

  /**
   * Mettre à jour un champ du formulaire
   */
  const updateField = (field: string, value: string) => {
    setFormData({...formData, [field]: value})
  }

  /**
   * Valider le formulaire
   */
  const validateForm = (): boolean => {
    if (!Object.values(formData).every(element => element.trim() !=='')) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas')
      return false
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères')
      return false
    }

    return true
  }

  /**
   * Afficher la popup pour activer Face ID
   */
  const showBiometricPrompt = async () => {
    try {
      const isAvailable = await BiometricAuth.isAvailable()

      if (!isAvailable) {
        await SecureStorage.saveBiometricEnabled(false)
        router.replace('/(tabs)')
        return
      }

      const biometricType = await BiometricAuth.getBiometricType()

      Alert.alert(
        `Activer ${biometricType} ?`,
        `Déverrouillez l'app rapidement avec ${biometricType}`,
        [
          {
            text: 'Non merci',
            onPress: async () => {
              await SecureStorage.saveBiometricEnabled(false)
              router.replace('/(tabs)')
            }
          },
          {
            text: 'Activer',
            onPress: async () => {
              await SecureStorage.saveBiometricEnabled(true)
              await SecureStorage.saveCredentials(formData.email, formData.password)
              router.replace('/(tabs)')
            }
          }
        ]
      )
    } catch (error) {
      console.error('Erreur popup biométrie:', error)
      await SecureStorage.saveBiometricEnabled(false)
      router.replace('/(tabs)')
    }
  }

  /**
   * Gérer la soumission du formulaire
   */
  const handleRegister = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Convertir la date au format ISO (YYYY-MM-DD)
      const [day, month, year] = formData.dateNaissance.split('/')
      const dateISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

      const response = await fetch('http://192.168.1.64:3333/create_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
          dateNaissance: dateISO,
          lieuNaissance: formData.lieuNaissance,
          adresse: formData.adresse
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la création du compte')
      }

      const data = await response.json()

      await AuthService.login(formData.email, formData.password)
      await showBiometricPrompt()
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer le compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Créer un compte</Text>

        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={formData.firstname}
          onChangeText={(value) => updateField('firstname', value)}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={formData.lastname}
          onChangeText={(value) => updateField('lastname', value)}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          value={formData.confirmPassword}
          onChangeText={(value) => updateField('confirmPassword', value)}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Date de naissance (JJ/MM/AAAA)"
          value={formData.dateNaissance}
          onChangeText={(value) => updateField('dateNaissance', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Lieu de naissance"
          value={formData.lieuNaissance}
          onChangeText={(value) => updateField('lieuNaissance', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Adresse"
          value={formData.adresse}
          onChangeText={(value) => updateField('adresse', value)}
          multiline
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    padding: 20,
    paddingTop: 60
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
  linkButton: {
    marginTop: 20
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14
  }
})
