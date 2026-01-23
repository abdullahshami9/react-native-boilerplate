import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Animated } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'info';
    onDismiss: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, type = 'error', onDismiss }) => {
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;
    const theme = useTheme();
    // Use explicit context if needed, or rely on properties. 
    // Since useTheme returns colors based on context, we can check if theme.bg is dark to infer mode, 
    // or better, just import AuthContext.
    // However, to keep it clean, let's look at the colors. 
    // Light Secondary is #4A5568. Dark Primary/Secondary is #00a884 (Green).
    // User wants Light: Login Color (#4A5568). Dark: Blue (#4A9EFF).

    // We can infer IsDark from the text color or background. 
    const isDark = theme.bg === '#0b141a';

    useEffect(() => {
        if (visible) {
            scaleValue.setValue(0.5);
            opacityValue.setValue(0);
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    friction: 6,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Reset values when not visible
            scaleValue.setValue(0);
            opacityValue.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent animationType="none" visible={visible}>
            <View style={styles.container}>
                {/* Blur Background */}
                <BlurView
                    style={styles.absolute}
                    blurType={isDark ? "dark" : "light"}
                    blurAmount={3}
                    reducedTransparencyFallbackColor="white"
                />

                {/* Alert Box */}
                <Animated.View style={[styles.alertBox, { transform: [{ scale: scaleValue }], opacity: opacityValue }, { backgroundColor: theme.cardBg }]}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        {type === 'error' && (
                            <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></Path>
                                <Path d="M12 9v4"></Path>
                                <Path d="M12 17h.01"></Path>
                            </Svg>
                        )}
                        {type === 'success' && (
                            <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></Path>
                                <Path d="M22 4L12 14.01l-3-3"></Path>
                            </Svg>
                        )}
                        {type === 'info' && (
                            <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4299E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></Path>
                            </Svg>
                        )}
                    </View>

                    {/* Text Content */}
                    <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: theme.subText }]}>{message}</Text>

                    {/* Dismiss Button */}
                    <TouchableOpacity
                        style={[
                            styles.button,
                            {
                                // Light Mode: Login Button Color (Secondary #4A5568)
                                // Dark Mode: Blue (#4A9EFF) instead of Green
                                backgroundColor: isDark ? '#4A9EFF' : '#4A5568'
                            }
                        ]}
                        onPress={onDismiss}
                    >
                        <Text style={[styles.buttonText, { color: '#fff' }]}>Dismiss</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)' // Added fallback dimming
    },
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    alertBox: {
        width: width * 0.85,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 50, // Rounded like Signup button
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CustomAlert;
