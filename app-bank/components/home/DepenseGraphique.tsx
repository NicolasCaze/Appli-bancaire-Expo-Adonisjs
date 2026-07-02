import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useAuth } from '@/contexts/AuthContext'

type Props = {
  accountId?: number
}
export default function MonthlyExpenses({accountId}: Props) {
  const { payments } = useAuth()

  const getMonthlyExpenses = () => {
  // 1. Date actuelle
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // 2. Filtrer payments du mois actuel
  const currentMonthPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.datePaiement)
    const isCurrentMonth = paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear

    if(accountId){
      return isCurrentMonth && payment.accountId === accountId
    }
    return isCurrentMonth
  })
  
  // 3. Nombre de jours dans le mois
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  // 4. Tableau initialisé à 0
  const dailyExpenses = Array.from({ length: daysInMonth }, () => 0)
  
  // 5. Agréger les montants par jour
  currentMonthPayments.forEach(payment => {
    const paymentDate = new Date(payment.datePaiement)
    const day = paymentDate.getDate()
    dailyExpenses [day -1] += Number(payment.montant)
  })
  
  // 6. Transformer en format graphique
  const data = dailyExpenses.map((amount, index) => ({
    value: amount,
    label: (index + 1) % 5 === 0 ? String(index + 1) : ''
  }))
  
  return data
}
     const data = getMonthlyExpenses()
     const total = data.reduce((acc, item) => acc + item.value, 0)
    return (
        <View style={styles.wrapper}>
          <View style={styles.container}>
            <View style={styles.textContainer}>
              <Text style={{color: 'black', fontSize: 16, fontWeight: 'bold', }}>Total</Text>
              <Text style={{color: 'black', fontSize: 16, fontWeight: 'bold', }}>{total}€</Text>
            </View>
            <View style={styles.chartContainer}>
       <LineChart
          data={data}
          areaChart={true}
          startFillColor1="rgba(34, 197, 94, 0.3)"
          color="#22c55e" 
          thickness={3}
          dataPointsRadius={2}  
          dataPointsColor="#22c55e"
          hideYAxisText={true}
          hideAxesAndRules={false}
          curved={true}
          xAxisThickness={1}
          yAxisThickness={0}
          xAxisColor="#E0E0E0"
          animateOnDataChange={true}
          animationDuration={1000}
          xAxisLabelTextStyle={{
            color: 'gray',
            marginTop: 5,
            fontSize: 10,
            textAlign: 'center'
          }}
          xAxisLabelsVerticalShift={5}
          xAxisLabelTexts={data.map(item => item.label || '')}
          noOfSections={5}
          xAxisIndicesHeight={5}
          xAxisIndicesColor="lightgray"
          yAxisLabelWidth={0}
          yAxisLabelContainerStyle={{ width: 0 }}
          rulesColor="transparent"
          rulesType="solid"
          initialSpacing={5}
          endSpacing={5}
          width={Dimensions.get('window').width - 60}
          spacing={18}
        />
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: 'white',
    width: '100%',
    height: 220,
    borderRadius: 16,
    padding: 10,
    paddingBottom: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, 
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 5
  },
  textContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10
  }

});
