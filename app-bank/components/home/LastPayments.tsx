import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { formatDate } from '@/utils/dateFormatter';
import { Colors } from '@/constants/Colors';

type Props = {
    accountId?: number
}

export default function LastPayments({accountId}: Props) {
    const { payments } = useAuth()

    const filteredPayments = accountId 
        ? payments.filter(payment => payment.accountId === accountId)
        : payments
    
    return (
        <View style={styles.wrapper}>
            <View style={styles.whiteContainer}>
                {filteredPayments.slice(0, 3).map((payment, index) => (
                    <View key={payment.id}>
                        <View style={styles.container}>
                            <View style={styles.iconContainer}>
                                <FontAwesome6 name="cart-shopping" size={24} color={Colors.primary} />
                            </View>
                            
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{payment.description}</Text>
                                <Text style={styles.date}>{formatDate(payment.datePaiement)}</Text>
                            </View>
                            
                            <Text style={styles.amount}>-{payment.montant}€</Text>
                        </View>
                        {index < filteredPayments.slice(0, 3).length - 1 && (
                            <View style={styles.separator} />
                        )}
                    </View>
                ))}
                
                {filteredPayments.length > 3 && (
                    <TouchableOpacity 
                        style={styles.seeMoreButton}
                        onPress={() => console.log('Voir plus')}
                    >
                        <Text style={styles.seeMoreText}>See all</Text>
                        <FontAwesome6 name="chevron-right" size={14} color={Colors.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 16,
    },
    whiteContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    separator: {
        height: 1,
        backgroundColor: '#F2F2F7',
        marginVertical: 4,
    },
    iconContainer: {
        backgroundColor: '#F2F2F7',
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
        color: '#000',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    date: {
        color: '#8E8E93',
        fontSize: 12,
    },
    amount: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    seeMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        paddingVertical: 8,
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    seeMoreText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
});