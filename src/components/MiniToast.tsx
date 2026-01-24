import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export interface MiniToastRef {
    show: (message: string) => void;
}

const MiniToast = forwardRef<MiniToastRef, {}>((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const fadeAnim = new Animated.Value(0);

    useImperativeHandle(ref, () => ({
        show: (msg: string) => {
            setMessage(msg);
            setVisible(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    hide();
                }, 2000);
            });
        }
    }));

    const hide = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
        });
    };

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.toast}>
                <Text style={styles.text}>{message}</Text>
            </View>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100, // Above tabs usually
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
        pointerEvents: 'none', // Allow clicks through if needed, but toast shouldn't block much
    },
    toast: {
        backgroundColor: 'rgba(45, 55, 72, 0.9)', // Dark gray/blue
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    }
});

export default MiniToast;
