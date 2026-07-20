import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useAuth } from '@/contexts/AuthContext'

const INITIAL_SPACING = 4
const MOIS = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']

type Props = {
  accountId: number
}

export default function DepenseGraphique({ accountId }: Props) {
  const { payments, transactions } = useAuth()
  const [chartWidth, setChartWidth] = useState(0)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const spacing = chartWidth > 0
    ? Math.ceil((chartWidth - INITIAL_SPACING) / (daysInMonth - 1))
    : 10

  const dailyExpenses = Array.from({ length: daysInMonth }, () => 0)

  payments.forEach((payment) => {
    if (payment.accountId !== accountId) return
    const d = new Date(payment.datePaiement)
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return
    if (payment.statut === 'REFUSE') return
    dailyExpenses[d.getDate() - 1] += Number(payment.montant)
  })

  transactions.forEach((tx) => {
    if (tx.compteSourceId !== accountId) return
    const d = new Date(tx.dateTransaction)
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return
    if (tx.statut === 'ECHOUÉE') return
    dailyExpenses[d.getDate() - 1] += Number(tx.montant)
  })

  const data = dailyExpenses.map((amount, index) => {
    const day = index + 1
    const showLabel = day === 1 || day === 10 || day === 20 || day === daysInMonth
    return { value: amount, label: showLabel ? String(day) : '' }
  })

  const total = dailyExpenses.reduce((acc, v) => acc + v, 0)

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titre}>Dépenses — {MOIS[currentMonth]}</Text>
          <Text
            style={styles.total}
            accessibilityLabel={`Total des dépenses : ${total.toFixed(0)} euros`}
          >
            {total.toFixed(0)} €
          </Text>
        </View>

        {total === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune dépense ce mois-ci</Text>
          </View>
        ) : (
          <View
            style={styles.chartContainer}
            onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
          >
            {chartWidth > 0 && (
              <LineChart
                data={data}
                areaChart={true}
                startFillColor1="rgba(34, 197, 94, 0.3)"
                color="#22c55e"
                thickness={3}
                dataPointsRadius={2}
                dataPointsColor="#22c55e"
                hideYAxisText={true}
                curved={true}
                xAxisThickness={1}
                yAxisThickness={0}
                xAxisColor="#E0E0E0"
                animateOnDataChange={true}
                animationDuration={1000}
                xAxisLabelTextStyle={{ color: 'gray', fontSize: 9, width: 24, textAlign: 'center' }}
                xAxisLabelsVerticalShift={2}
                noOfSections={4}
                yAxisLabelWidth={0}
                yAxisLabelContainerStyle={{ width: 0 }}
                rulesColor="transparent"
                rulesType="solid"
                initialSpacing={INITIAL_SPACING}
                endSpacing={0}
                width={chartWidth}
                spacing={spacing}
              />
            )}
          </View>
        )}
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
    borderRadius: 16,
    padding: 14,
    paddingBottom: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  chartContainer: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  emptyContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    fontStyle: 'italic',
  },
})
