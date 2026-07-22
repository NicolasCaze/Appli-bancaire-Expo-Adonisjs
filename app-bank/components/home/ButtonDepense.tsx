import { Pressable, StyleSheet, Text, View } from 'react-native';

type ButtonProps = {
    onPress: () => void;
    label: string;
}

export default function ButtonDepense({ 
    onPress, 
    label, 
}: ButtonProps) {
    return (
        <View style={styles.container}>
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.pressable,
                    pressed && styles.pressed
                ]}
                accessibilityRole="button"
                accessibilityLabel={label}
            >
                <Text style={styles.label}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 100,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressable: {
        padding: 8,
    },
    pressed: {
        opacity: 0.7,
    },
    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});