import { StyleSheet, Text, View } from "react-native";
import { useAuth } from '@/contexts/AuthContext'

type AccountBalanceProps = {
    accountId?: number
}

const getAccountTitle = (type?: string) => {
    switch(type) {
        case 'BANCAIRE': return 'Compte Principal'
        case 'EPARGNE': return 'Compte Épargne'
        case 'POCKET': return 'Pocket'
        default: return 'Compte'
    }
}

export default function AccountBalance({ accountId }: AccountBalanceProps) {
    const { accounts } = useAuth()
    
    const account = accountId 
        ? accounts.find(acc => acc.id === accountId)
        : accounts.find(acc => acc.type === 'BANCAIRE')
    
    const solde = account ? account.solde : 0
    const title = getAccountTitle(account?.type)
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.balance}>{solde}€</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 40,

    },
  title: {
    marginBottom: 5,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  balance: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
});