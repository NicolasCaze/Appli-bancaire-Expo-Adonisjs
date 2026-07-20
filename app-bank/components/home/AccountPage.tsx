import { View, ScrollView, StyleSheet } from "react-native";
import AccountBalance from "./AccountBalance";
import ActionButtons from "./ActionButtons";
import LastPayments from "./LastPayments";
import Patrimoine from "./Patrimoine";
import DepenseGraphique from "./DepenseGraphique";
import { useAuth } from "@/contexts/AuthContext";

type Props= {
    accountId: number
    currentPage?: number
    pageIndex?: number
}

export default function AccountPage({accountId, currentPage = 0, pageIndex = 0}: Props) {
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 20, paddingBottom: 100 }}
        >
            <AccountBalance accountId={accountId}/>
            <ActionButtons accountId={accountId}/>
            
            {/* Indicateur de pagination */}
            <View style={styles.paginationContainer}>
                {[0, 1, 2].map((index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            currentPage === index && styles.paginationDotActive
                        ]}
                    />
                ))}
            </View>
            
            <LastPayments accountId={accountId}/>
            <Patrimoine />
            <DepenseGraphique accountId={accountId}/>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 8,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    paginationDotActive: {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
})