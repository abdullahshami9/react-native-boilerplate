import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/useTheme';
import PageWrapper from '../components/PageWrapper';
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';

const WalletScreen = ({ navigation }: any) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Wallet</Text>
            </View>

            <PageWrapper contentContainerStyle={styles.content}>
                <View style={[styles.balanceCard, { backgroundColor: '#4A9EFF' }]}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceValue}>$0.00</Text>
                    <Text style={styles.balanceSub}>USDT (TRC20)</Text>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.cardBg }]}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2">
                            <Path d="M12 5v14M5 12l7-7 7 7"/>
                        </Svg>
                        <Text style={[styles.actionText, { color: theme.text }]}>Deposit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.cardBg }]}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2">
                            <Path d="M12 19V5M5 12l7 7 7-7"/>
                        </Svg>
                        <Text style={[styles.actionText, { color: theme.text }]}>Withdraw</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Wallet Address (TRC20)</Text>
                    <View style={styles.addressBox}>
                        <Text style={{ color: theme.subText, fontSize: 12 }}>Generating your unique TRC20 address...</Text>
                    </View>
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
    balanceCard: { padding: 25, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 5 },
    balanceValue: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    balanceSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 5 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 20 },
    actionBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
    actionText: { fontWeight: '600', fontSize: 16 },
    section: { padding: 20, borderRadius: 15, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
    addressBox: { backgroundColor: 'rgba(0,0,0,0.05)', padding: 15, borderRadius: 8, alignItems: 'center' }
});

export default WalletScreen;
