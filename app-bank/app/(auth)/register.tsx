import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import BiometricAuth from '@/services/biometricAuth'
import SecureStorage from '@/services/secureStorage'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'

const formatDateFr = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const formatDateISO = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export default function RegisterScreen() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    lieuNaissance: '',
    adresse: ''
  })
  const [dateNaissance, setDateNaissance] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
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

    if (!dateNaissance) {
      Alert.alert('Erreur', 'Veuillez sélectionner votre date de naissance')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas')
      return false
    }

    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    if (!passwordPolicy.test(formData.password)) {
      Alert.alert(
        'Erreur',
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial'
      )
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
      await api.post('/create_users', {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
        dateNaissance: formatDateISO(dateNaissance!),
        lieuNaissance: formData.lieuNaissance,
        adresse: formData.adresse
      })

      await login(formData.email, formData.password)
      Alert.alert(
        'Compte créé',
        'Votre compte a bien été créé.',
        [{ text: 'OK', onPress: () => showBiometricPrompt() }]
      )
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Impossible de créer le compte'
      Alert.alert('Erreur', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Créer un compte</Text>

        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={formData.firstname}
          onChangeText={(value) => updateField('firstname', value)}
          autoCapitalize="words"
          accessibilityLabel="Prénom"
        />

        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={formData.lastname}
          onChangeText={(value) => updateField('lastname', value)}
          autoCapitalize="words"
          accessibilityLabel="Nom"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="Adresse email"
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          secureTextEntry
          accessibilityLabel="Mot de passe"
          accessibilityHint="Au moins 8 caractères, avec une majuscule, un chiffre et un caractère spécial"
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          value={formData.confirmPassword}
          onChangeText={(value) => updateField('confirmPassword', value)}
          secureTextEntry
          accessibilityLabel="Confirmer le mot de passe"
        />

        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Date de naissance"
          accessibilityHint={dateNaissance ? `Date sélectionnée : ${formatDateFr(dateNaissance)}. Appuyer pour modifier` : 'Appuyer pour choisir votre date de naissance'}
        >
          <Text style={dateNaissance ? styles.dateText : styles.datePlaceholder}>
            {dateNaissance ? formatDateFr(dateNaissance) : 'Date de naissance'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <>
            <DateTimePicker
              value={dateNaissance ?? new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowDatePicker(Platform.OS === 'ios')
                if (selectedDate) setDateNaissance(selectedDate)
              }}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.dateDoneButton}
                onPress={() => setShowDatePicker(false)}
                accessibilityRole="button"
                accessibilityLabel="Valider la date"
              >
                <Text style={styles.dateDoneText}>Valider</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Lieu de naissance"
          value={formData.lieuNaissance}
          onChangeText={(value) => updateField('lieuNaissance', value)}
          accessibilityLabel="Lieu de naissance"
        />

        <TextInput
          style={styles.input}
          placeholder="Adresse"
          value={formData.adresse}
          onChangeText={(value) => updateField('adresse', value)}
          multiline
          accessibilityLabel="Adresse postale"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Créer mon compte"
          accessibilityState={{ disabled: loading, busy: loading }}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/login')}
          accessibilityRole="link"
          accessibilityLabel="Déjà un compte ? Se connecter"
        >
          <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  dateText: {
    fontSize: 16,
    color: '#000'
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#999'
  },
  dateDoneButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: -5,
    marginBottom: 15,
    alignItems: 'center'
  },
  dateDoneText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
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
