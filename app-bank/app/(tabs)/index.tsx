// Dans vos écrans (home.tsx, transfert.tsx)
import AccountBalance from '@/components/home/AccountBalance';
import Button from '@/components/home/Button';
import ButtonDepense from '@/components/home/ButtonDepense';
import ButtonPlus from '@/components/home/ButtonPlus';
import DepenseGraphique from '@/components/home/DepenseGraphique';
import LastTransactions from '@/components/home/LastTransactions';
import NavBarHome from '@/components/home/NavBarHome';
import Patrimoine from '@/components/home/Patrimoine';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {

  return (
    <LinearGradient
      colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
      style={{ flex: 1 }}
    >
      <View style={styles.bodyhome}>
        <ScrollView 
          style={{ width: '100%', flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        >
          <NavBarHome  />
        <AccountBalance title="Principal" balance="4500" />
        
        <View style={styles.container}>
          <View style={styles.containerbutton}>
            <View style={styles.button}>
              <Button 
                onPress={() => console.log('Ajouter')} 
                iconName="plus"
                size={24}
                color="#fff"
              />
              <Text style={{ color: 'white', fontSize: 12, marginTop: 8 }}>Ajouter</Text>
            </View>
            <View style={styles.button}>
              <Button 
                onPress={() => console.log('Information')} 
                iconName="house-chimney"
                size={24}
                color="#fff"
              />
              <Text style={{ color: 'white', fontSize: 12, marginTop: 8 }}>Information</Text>
            </View>
            <View style={styles.button}>
              <ButtonPlus 
                onPress={() => console.log('Plus')} 
                iconName="dots-horizontal"
                size={24}
                color="#fff"
              />
              <Text style={{ color: 'white', fontSize: 12, marginTop: 8 }}>Plus</Text>
            </View>
          </View>
        </View>
        <Text style={styles.transactionsTitle}>
          Dernières transactions
        </Text>
        <LastTransactions title="Virement" date="2022-01-01" amount="100" />
        <LastTransactions title="Virement" date="2022-01-01" amount="100" />
        <ButtonDepense
          onPress={() => console.log('Voir plus')}
          label="Voir plus"
        />
        <View style={styles.containerPatrimoine}>
        <Patrimoine />
        </View>
        <Text style={styles.transactionsTitle}>
          Dépense du mois
        </Text>
        <View style={styles.containergraphique}>
        <DepenseGraphique />
        </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    bodyhome: {
        flex: 1,
        alignItems: 'center',
        paddingBottom: 80, // Plus d'espace en bas pour la barre de navigation
    },
    scrollContent: {
        paddingBottom: 40,
    },
    container: {
    marginTop: 40, width: '100%'
  },
  containerbutton : {
 flexDirection: 'row', justifyContent: 'center', gap: 50 
  },
  button: {
    alignItems: 'center'
  },
  transactionsTitle: {
    color: 'white',
    fontSize: 14,
    marginTop: 30,
    marginLeft: 20,
    alignSelf: 'flex-start',
    fontWeight: '500'
  },
  containergraphique: {
    marginTop: 20,
    paddingHorizontal: 20
  },
  containerPatrimoine: {
    marginTop: 20,
    paddingHorizontal: 20
  }
}
);
