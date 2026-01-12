import React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';

type Transaction = {
    id: string;
    name: string;
    initial: string;
    avatarColor: string;
    message: string;
    amount: string;
    timestamp: string;
};

// Données mockup pour démonstration
const transactions: Transaction[] = [
    {
        id: '1',
        name: 'Alexis',
        initial: 'A',
        avatarColor: '#f06292', // Rose
        message: 'Vous avez envoyé',
        amount: '6 €',
        timestamp: 'mar.'
    },
    {
        id: '2',
        name: 'Paul',
        initial: 'P',
        avatarColor: '#4fc3f7', // Bleu clair
        message: 'Vous avez envoyé',
        amount: '3,00 €',
        timestamp: '17h'
    },
    {
        id: '3',
        name: 'Flavia',
        initial: 'F',
        avatarColor: '#81c784', // Vert clair
        message: 'Dès que j\'ai ma carte je te fais',
        amount: '',
        timestamp: '17h'
    },
    {
        id: '4',
        name: 'Stefan',
        initial: 'S',
        avatarColor: '#ff8a65', // Orange
        message: 'Vous avez envoyé',
        amount: '0,92 €',
        timestamp: '16h'
    },
    {
        id: '5',
        name: 'EXUBERAFAQ, UNIPES',
        initial: 'E',
        avatarColor: '#e57373', // Rouge clair
        message: 'Vous avez envoyé',
        amount: '52 €',
        timestamp: '25 avr'
    },
];

const TransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
            <Text style={styles.initial}>{item.initial}</Text>
        </View>
        <View style={styles.transactionDetails}>
            <View style={styles.nameContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
            <View style={styles.messageContainer}>
                <Text style={styles.message} numberOfLines={1}>
                    {item.message}
                </Text>
                {item.amount ? <Text style={styles.amount}>{item.amount}</Text> : null}
            </View>
        </View>
    </View>
);

export default function LastTransfert() {
    return (
        <View style={styles.outerContainer}>
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <FlatList
                        data={transactions}
                        renderItem={({ item }) => <TransactionItem item={item} />}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                    />
                </ScrollView>
            </View>
        </View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 10,
    },
    container: {
        width: width * 0.92,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: width * 0.04,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(224, 224, 224, 0.7)',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    initial: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    transactionDetails: {
        flex: 1,
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 14,
        color: '#9E9E9E',
    },
    messageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    message: {
        fontSize: 14,
        color: '#616161',
        flex: 1,
    },
    amount: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
});