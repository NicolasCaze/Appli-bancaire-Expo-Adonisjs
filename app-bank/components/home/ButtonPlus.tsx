import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type ButtonProps = {
    onPress: () => void;
    iconName: ComponentProps<typeof MaterialCommunityIcons>['name'];
    size?: number;
    color?: string;
}

export default function ButtonPlus({ 
    onPress, 
    iconName,
    size = 24, 
    color = 'black' 
}: ButtonProps) {
    return (
        <View style={styles.container}>
            <Pressable onPress={onPress} style={({ pressed }) => [
                styles.pressable,
                pressed && styles.pressed
            ]}>
                <MaterialCommunityIcons name={iconName} size={size} color={color} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 100,
    },
    pressable: {
        padding: 8,
    },
    pressed: {
        opacity: 0.7,
    },
});