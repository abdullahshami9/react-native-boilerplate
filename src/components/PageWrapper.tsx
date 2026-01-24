import React, { useState, useContext } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, ViewStyle } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import StandardLoader from './StandardLoader';
import { useTheme } from '../theme/useTheme';

interface PageWrapperProps {
    children: React.ReactNode;
    onRefresh?: () => Promise<void>;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, onRefresh, style, contentContainerStyle }) => {
    const { isDarkMode } = useContext(AuthContext);
    const theme = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setRefreshing(true);
        setShowLoader(true);
        try {
            await onRefresh();
        } catch (error) {
            console.error("Refresh error:", error);
        } finally {
            setRefreshing(false);
            setShowLoader(false);
        }
    };

    const backgroundColor = theme.bg;
    const textColor = theme.text;

    return (
        <View style={[styles.container, { backgroundColor }, style]}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['transparent']} // Android: Hide default spinner
                            tintColor="transparent" // iOS: Hide default spinner
                            progressBackgroundColor="transparent"
                        />
                    ) : undefined
                }
            >
                {children}
            </ScrollView>

            <StandardLoader visible={showLoader} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
});

export default PageWrapper;
