import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}

// Web Implementation (Simple Color Pulse)
const SkeletonLoader: React.FC<SkeletonProps> = ({ width = '100%', height = 20, borderRadius = 4, style }) => {
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.5, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={[styles.skeleton, { width, height, borderRadius, backgroundColor: '#E2E8F0' }, style]}>
            <Animated.View style={[{ width: '100%', height: '100%', backgroundColor: '#CBD5E0' }, animatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
});

export default SkeletonLoader;
