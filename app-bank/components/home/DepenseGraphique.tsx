import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

export default function MonthlyExpenses() {
  const data = [
    { value: 0,  label: '0' },
    { value: 30, label: '6' },
    { value: 26, label: '11' },
    { value: 40, label: '17' },
    { value: 35, label: '23' },
    { value: 20, label: '30' }
  ];
      const total = data.reduce((acc, item) => acc + item.value, 0);
    return (
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={{color: 'black', fontSize: 16, fontWeight: 'bold', }}>Total</Text>
            <Text style={{color: 'green', fontSize: 16, fontWeight: 'bold', }}>{total}€</Text>
            </View>
          <View style={styles.chartContainer}>
       <LineChart
          data={data}
          color={'green'}
          thickness={3}
          dataPointsColor={'green'}
          hideYAxisText={true}
          hideAxesAndRules={false}
          xAxisThickness={1}
          yAxisThickness={0}
          xAxisColor="#E0E0E0"
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
          initialSpacing={10}
          endSpacing={10}
        />
          </View>
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    width: '100%',
    height: 200,
    borderRadius: 12,
    padding: 10,
    paddingBottom: 50
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
