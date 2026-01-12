import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, View } from "react-native";

type LastTransactionsProps = {
    title: string;
    date: string;
    amount: string;
}

export default function LastTransactions({ title, date, amount }: LastTransactionsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <FontAwesome6 name="cart-shopping" size={24} color="white" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.date}>{date}</Text>
            </View>
            <Text style={styles.amount}>{amount}€</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 12,
        marginVertical: 6,
        marginHorizontal: 20,
    },
    iconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    date: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
    },
    amount: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});