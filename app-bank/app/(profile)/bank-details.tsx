import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import BackHeader from '@/components/ui/BackHeader'

export default function BankDetailsScreen() {
    return (
        <LinearGradient
            colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <BackHeader title="Détails bancaires" />
                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 8 },
})
