import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface StandardLoaderProps {
    visible?: boolean;
    color?: string;
    transparent?: boolean;
}

const StandardLoader: React.FC<StandardLoaderProps> = ({ visible = true, color, transparent = false }) => {
    const theme = useTheme();
    const loaderColor = color || theme.text; // Default to theme text color (black/white)

    if (!visible) return null;

    if (transparent) {
        return (
            <View style={[styles.container, styles.transparent]}>
                <ActivityIndicator size="large" color={loaderColor} />
            </View>
        );
    }

    return (
        <Modal transparent={true} animationType="fade" visible={visible}>
            <View style={styles.modalBackground}>
                <View style={[styles.loaderBox, { backgroundColor: theme.cardBg }]}>
                    <ActivityIndicator size="large" color={loaderColor} />
                </View>
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
    transparent: {
        backgroundColor: 'transparent',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderBox: {
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});

export default StandardLoader;
