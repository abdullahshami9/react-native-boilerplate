import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

interface FadeInListProps extends ViewProps {
    index: number;
    delay?: number;
}

const FadeInList: React.FC<FadeInListProps> = ({ children, index, delay = 100, style, ...props }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        opacity.value = withDelay(index * delay, withTiming(1, { duration: 500 }));
        translateY.value = withDelay(index * delay, withTiming(0, { duration: 500 }));
    }, [index, delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[style, animatedStyle]} {...props}>
            {children}
        </Animated.View>
    );
};

export default FadeInList;
