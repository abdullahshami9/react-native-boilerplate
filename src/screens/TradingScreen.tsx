import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/useTheme';
import PageWrapper from '../components/PageWrapper';

const TradingScreen = () => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>MT5 Trading Bot</Text>
            </View>
            <PageWrapper contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Live PnL (XAUUSD)</Text>
                    <Text style={[styles.pnlValue, { color: '#38A169' }]}>+$0.00</Text>
                    <Text style={{ color: theme.subText, marginTop: 5 }}>Simulated MT5 Connection</Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Active Trades</Text>
                    <Text style={{ color: theme.subText, marginTop: 10 }}>No active trades currently. Bot is analyzing the market...</Text>
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
    card: { padding: 20, borderRadius: 15, marginBottom: 20 },
    cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    pnlValue: { fontSize: 32, fontWeight: 'bold' }
});

export default TradingScreen;
