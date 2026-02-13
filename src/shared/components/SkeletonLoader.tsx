import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({ width = '100%', height = 20, borderRadius = 4, style }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    // Web Fallback (LinearGradient might not work perfectly on web without extra config)
    if (Platform.OS === 'web') {
        return (
            <View style={[styles.skeleton, { width, height, borderRadius, backgroundColor: '#E2E8F0' }, style]}>
                <Animated.View style={[{ width: '100%', height: '100%', backgroundColor: '#CBD5E0' }, animatedStyle]} />
            </View>
        );
    }

    return (
        <View style={[styles.skeleton, { width, height, borderRadius }, style]}>
            <AnimatedGradient
                colors={['#E2E8F0', '#F7FAFC', '#E2E8F0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, animatedStyle]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E2E8F0',
        overflow: 'hidden',
    },
});

export default SkeletonLoader;
