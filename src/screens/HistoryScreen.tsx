import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import PageWrapper from '../components/PageWrapper';

const HistoryScreen = () => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Transaction History</Text>
            </View>
            <PageWrapper contentContainerStyle={styles.content}>
                <View style={[styles.emptyState, { backgroundColor: theme.cardBg }]}>
                    <Text style={{ color: theme.subText }}>No transactions found.</Text>
                </View>
            </PageWrapper>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 50, paddingBottom: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    content: { padding: 20 },
    emptyState: { padding: 30, borderRadius: 15, alignItems: 'center' }
});

export default HistoryScreen;
