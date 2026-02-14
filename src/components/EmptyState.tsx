import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';

const EmptyState = ({ type = 'default', message, style }: any) => {
    const theme = useTheme();

    const renderIcon = () => {
        switch (type) {
            case 'orders':
                return (
                    <Svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="1">
                        <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <Path d="M3.3 7l8.7 5 8.7-5" />
                        <Path d="M12 22v-10" />
                        <Circle cx="12" cy="12" r="2" fill={theme.subText} />
                    </Svg>
                );
            case 'inventory':
                return (
                    <Svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="1">
                        <Rect x="3" y="3" width="7" height="7" />
                        <Rect x="14" y="3" width="7" height="7" />
                        <Rect x="14" y="14" width="7" height="7" />
                        <Rect x="3" y="14" width="7" height="7" strokeDasharray="4 4" />
                    </Svg>
                );
            case 'chat':
                return (
                    <Svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="1">
                        <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </Svg>
                );
            default:
                return (
                    <Svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="1">
                        <Circle cx="12" cy="12" r="10" />
                        <Path d="M12 8v4" />
                        <Path d="M12 16h.01" />
                    </Svg>
                );
        }
    };

    return (
        <View style={[styles.container, style]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.cardBg }]}>
                {renderIcon()}
            </View>
            <Text style={[styles.message, { color: theme.subText }]}>{message || 'No items found.'}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', padding: 20, marginTop: 40 },
    iconContainer: { padding: 30, borderRadius: 100, marginBottom: 20, elevation: 2, shadowOpacity: 0.05 },
    message: { fontSize: 16, textAlign: 'center', maxWidth: '80%' }
});

export default EmptyState;
