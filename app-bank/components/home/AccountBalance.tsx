import { StyleSheet, Text, View } from "react-native";

type AccountBalanceProps = {
    title   : string;
    balance : string;
}

export default function AccountBalance({ title, balance }: AccountBalanceProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.balance}>{balance}€</Text>
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