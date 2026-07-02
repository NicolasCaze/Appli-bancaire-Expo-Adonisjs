import React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { useAuth } from '@/contexts/AuthContext';
import { Account, Beneficiaire, Transaction } from '@/types/auth';
import { formatDate } from '@/utils/dateFormatter';

const getAccountLabel = (type?: string) => {
    if (type === 'BANCAIRE') return 'Compte Bancaire'
    if (type === 'EPARGNE') return 'Compte Épargne'
    if (type === 'POCKET') return 'Pocket'
    return 'Compte'
}

function getDestinataire(transaction: Transaction, accounts: Account[], beneficiaires: Beneficiaire[]): string {
    if (transaction.beneficiaireId) {
        const beneficiaire = beneficiaires.find((b) => b.id === transaction.beneficiaireId)
        return beneficiaire?.nom ?? 'Bénéficiaire'
    }
    if (transaction.compteDestinationId) {
        const compteDestination = accounts.find((a) => a.id === transaction.compteDestinationId)
        return getAccountLabel(compteDestination?.type)
    }
    return 'Compte'
}

function TransactionItem({ transaction, accounts, beneficiaires }: { transaction: Transaction, accounts: Account[], beneficiaires: Beneficiaire[] }) {
    const destinataire = getDestinataire(transaction, accounts, beneficiaires)

     return (
        <View style={styles.transactionItem}>
            <View style={styles.avatar}>
                <Text style={styles.initial}>
                    {destinataire.charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.transactionDetails}>
                <View style={styles.nameContainer}>
                    <Text style={styles.name}>{destinataire}</Text>
                    <Text style={styles.timestamp}>
                        {formatDate(transaction.dateTransaction)}
                    </Text>
                </View>
                <View style={styles.messageContainer}>
                    <Text style={styles.message} numberOfLines={1}>
                        {transaction.libelle}
                    </Text>
                    <Text style={styles.amount}>{transaction.montant}€</Text>
                </View>
            </View>
        </View>
    );
}

export default function LastTransfert() {
    const { transactions, accounts, beneficiaires } = useAuth();

    return (
        <View style={styles.outerContainer}>
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <FlatList
                        data={transactions}
                        renderItem={({ item }) => <TransactionItem transaction={item} accounts={accounts} beneficiaires={beneficiaires} />}
                        keyExtractor={(item) => item.id.toString()}
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