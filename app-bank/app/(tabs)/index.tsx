// Dans vos écrans (home.tsx, transfert.tsx)
import AccountBalance from '@/components/home/AccountBalance';
import Button from '@/components/home/Button';
import ButtonDepense from '@/components/home/ButtonDepense';
import DepenseGraphique from '@/components/home/DepenseGraphique';
import LastPayments from '@/components/home/LastPayments';
import NavBarHome from '@/components/home/NavBarHome';
import Patrimoine from '@/components/home/Patrimoine';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext'
import PagerView from 'react-native-pager-view'
import AccountPage from '@/components/home/AccountPage';
import CreateAccountPage from '@/components/home/CreateAccountPage';
import { useState } from 'react';

export default function HomeScreen() {
  const { accounts, loadAccounts } = useAuth()
  const [currentPage, setCurrentPage] = useState(0)

  const compteBancaire = accounts.find(account => account.type === 'BANCAIRE')
  const epargne = accounts.find(account => account.type === 'EPARGNE')
  const pocket = accounts.find(account => account.type === 'POCKET')

  const handleCreateAccount = async () => {
    await loadAccounts()
  }

  return (
    <LinearGradient
      colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.bodyhome}>
        <View style={styles.header}>
          <NavBarHome  />
        </View>

        <PagerView 
          style={styles.pagerView}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        >
          {/* Page 1 : Compte Bancaire */}
          <View key="bancaire" style={styles.page}>
            {compteBancaire ? (
              <AccountPage accountId={compteBancaire.id} currentPage={currentPage} pageIndex={0} />
            ) : (
              <CreateAccountPage accountType="BANCAIRE" currentPage={currentPage} pageIndex={0} />
            )}
          </View>

          {/* Page 2 : Épargne */}
          <View key="epargne" style={styles.page}>
            {epargne ? (
              <AccountPage accountId={epargne.id} currentPage={currentPage} pageIndex={1} />
            ) : (
              <CreateAccountPage accountType="EPARGNE" currentPage={currentPage} pageIndex={1} />
            )}
          </View>

          {/* Page 3 : Pocket */}
          <View key="pocket" style={styles.page}>
            {pocket ? (
              <AccountPage accountId={pocket.id} currentPage={currentPage} pageIndex={2} />
            ) : (
              <CreateAccountPage accountType="POCKET" currentPage={currentPage} pageIndex={2} />
            )}
          </View>
        </PagerView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    bodyhome: {
        flex: 1,
    },
    header: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 10,
    },
    pagerView: {
        flex: 1,
        width: '100%',
    },
    page: {
        flex: 1,
        width: '100%',
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
    alignItems: 'center',
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
