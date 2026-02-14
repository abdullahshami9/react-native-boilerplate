import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedButton: React.FC<TouchableOpacityProps> = ({ style, onPressIn, onPressOut, ...props }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (e: any) => {
        scale.value = withSpring(0.95);
        if (onPressIn) onPressIn(e);
    };

    const handlePressOut = (e: any) => {
        scale.value = withSpring(1);
        if (onPressOut) onPressOut(e);
    };

    return (
        <AnimatedTouchableOpacity
            {...props}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[style, animatedStyle]}
            activeOpacity={0.8}
        />
    );
};

export default AnimatedButton;
