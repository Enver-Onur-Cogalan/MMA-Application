import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { scale } from '../../utils/dimensions';

interface AnimatedTabIconProps {
    name: string;
    focused: boolean;
    color: string;
    size?: number;
    onPress?: () => void;
}

export const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({
    name,
    focused,
    color,
    size = 20,
    onPress,
}) => {
    const scaleValue = useSharedValue(1);
    const rotation = useSharedValue(0);
    const bounce = useSharedValue(0);
    const punchScale = useSharedValue(1);

    // Animation for focus state
    useEffect(() => {
        if (focused) {
            scaleValue.value = withSpring(1.1, { damping: 15, stiffness: 200 });

            // Continuous light bounce effect
            bounce.value = withSequence(
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 300 })
            );
        } else {
            scaleValue.value = withSpring(1, { damping: 15, stiffness: 200 });
            bounce.value = withTiming(0, { duration: 200 });
        }
    }, [focused, bounce, scaleValue]);


    const triggerPunchAnimation = () => {
        punchScale.value = withSequence(
            withTiming(1.4, { duration: 100 }),
            withSpring(1, { damping: 8, stiffness: 300 })
        );

        rotation.value = withSequence(
            withTiming(8, { duration: 80 }),
            withTiming(-8, { duration: 80 }),
            withSpring(0, { damping: 12, stiffness: 250 })
        );
    };

    // Press handler
    const handlePress = () => {
        triggerPunchAnimation();
        onPress?.(); // Safe call
    };

    const animatedStyle = useAnimatedStyle(() => {
        const bounceOffset = interpolate(
            bounce.value,
            [0, 1],
            [0, -2]
        );

        return {
            transform: [
                { scale: scaleValue.value * punchScale.value },
                { rotate: `${rotation.value}deg` },
                { translateY: bounceOffset },
            ],
        };
    });

    const containerStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolate(
            scaleValue.value,
            [1, 1.1],
            [0, 0.15]
        );

        const punchGlow = interpolate(
            punchScale.value,
            [1, 1.4],
            [0, 0.3]
        );

        return {
            backgroundColor: `rgba(255, 107, 53, ${Math.max(backgroundColor, punchGlow)})`,
        };
    });

    return (
        <Pressable onPress={handlePress} style={styles.pressable}>
            <Animated.View style={[styles.container, containerStyle]}>
                <Animated.View style={animatedStyle}>
                    <Icon name={name} size={size} color={color} />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    pressable: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        padding: scale(6),
        borderRadius: scale(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
});