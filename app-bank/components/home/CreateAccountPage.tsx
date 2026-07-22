import { StyleSheet, Text, View } from "react-native";
import Button from "./Button";
import accountService from "@/services/accountService";
import { useAuth } from "@/contexts/AuthContext";
    
type Props = {
        accountType: 'BANCAIRE' | 'EPARGNE' | 'POCKET'
        currentPage?: number
        pageIndex?: number
    }
export default function CreateAccountPage({accountType, currentPage = 0, pageIndex = 0}: Props){

    const {loadAccounts} = useAuth();
const getAccountName= () => {
    if (accountType === 'BANCAIRE') return 'Compte Bancaire'
    if (accountType === 'EPARGNE') return 'Compte Épargne'
    return 'POCKET'
}
const handleCreateAccount = async () => {
        try {
          const account = await accountService.createAccountType(accountType)
          await loadAccounts();
        } catch (error) {
            console.log(error)
        }
        
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Voulez-vous créer un {getAccountName()} ?
            </Text>
            
            <Button
                iconName="plus"
                onPress={handleCreateAccount}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir un ${getAccountName()}`}
            />
            
            <Text style={styles.buttonLabel}>
                Ouvrir ce compte
            </Text>
            
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
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 40,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 8,
        marginTop: 40,
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    buttonLabel: {
        fontSize: 16,
        color: '#fff',
    },
})