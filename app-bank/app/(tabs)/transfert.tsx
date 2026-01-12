import LastTransfert from '@/components/transfert/LastTransfert';
import NavBarTransfert from '@/components/transfert/NavBarTransfert';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

export default function TransfertScreen() {
    return (
            <LinearGradient
              colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
              style={{ flex: 1 }}
            >
              <View style={styles.container}>
            <NavBarTransfert />
            
        </View>
          <LastTransfert />
            </LinearGradient>
            
        
    );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50, 
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})