import { StyleSheet, Text, View } from "react-native";

export default function Patrimoine() {
    return (
        <View style={styles.container}>
            <Text>Patrimoine</Text>
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
    }
});
