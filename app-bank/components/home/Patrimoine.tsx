import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function Patrimoine() {
    const {accounts} = useAuth();

    const compteBancaire = accounts.find(account => account.type === 'BANCAIRE');
    const epargne = accounts.find(account => account.type === 'EPARGNE');
    const pocket = accounts.find(account => account.type === 'POCKET');

    const total = (Number(compteBancaire?.solde) || 0) + 
                  (Number(epargne?.solde) || 0) + 
                  (Number(pocket?.solde) || 0);
    return (
  <View style={styles.wrapper}>
    <View style={styles.container}>
      {/* Titre et total */}
      <View style={styles.header}>
        <Text style={styles.title}>Patrimoine Total</Text>
        <Text style={styles.totalAmount}>{total}€</Text>
      </View>
      
      {/* Liste des comptes */}
      <View style={styles.accountsList}>
        {/* Compte bancaire */}
        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>Compte bancaire</Text>
          <Text style={styles.accountAmount}>{compteBancaire?.solde || 0}€</Text>
        </View>
        
        {/* Épargne */}
        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>Épargne</Text>
          <Text style={styles.accountAmount}>{epargne?.solde || 0}€</Text>
        </View>
        
        {/* Pocket */}
        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>Pocket</Text>
          <Text style={styles.accountAmount}>{pocket?.solde || 0}€</Text>
        </View>
      </View>
    </View>
  </View>
)
}
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',  // Vert comme le graphique
  },
  accountsList: {
    gap: 12,  // Espacement entre les lignes
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountLabel: {
    fontSize: 14,
    color: '#666',
  },
  accountAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
})