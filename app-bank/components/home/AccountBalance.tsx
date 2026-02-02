import { StyleSheet, Text, View } from "react-native";
import { useAuth } from '@/contexts/AuthContext'

type AccountBalanceProps = {
    title   : string;
}

export default function AccountBalance({ title }: AccountBalanceProps) {
    const { accounts } = useAuth()

    const mainAccount= accounts.find(account => account.type == 'BANCAIRE')
    const solde = mainAccount ? mainAccount.solde : 0
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.balance}>{solde}€</Text>
        </View>
    );
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