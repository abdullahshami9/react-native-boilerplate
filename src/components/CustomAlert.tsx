import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Animated } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Path } from 'react-native-svg';

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
                    blurType="light"
                    blurAmount={3} // Reduced from 10 to 3
                    reducedTransparencyFallbackColor="white"
                />

                {/* Alert Box */}
                <Animated.View style={[styles.alertBox, { transform: [{ scale: scaleValue }], opacity: opacityValue }]}>
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
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    {/* Dismiss Button */}
                    <TouchableOpacity style={styles.button} onPress={onDismiss}>
                        <Text style={styles.buttonText}>Dismiss</Text>
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
        backgroundColor: 'white',
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
        color: '#1A202C',
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#1A202C', // Black button
        width: '100%',
        paddingVertical: 16,
        borderRadius: 50, // Rounded like Signup button
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CustomAlert;
