import LastTransfert from '@/components/transfert/LastTransfert';
import NavBarTransfert from '@/components/transfert/NavBarTransfert';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransfertScreen() {
    return (
        <LinearGradient
            colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <NavBarTransfert />
                </View>
                <LastTransfert />
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        width: '100%',
        paddingTop: 10,
    },
})