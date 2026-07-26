import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/useTheme';
import PageWrapper from '../components/PageWrapper';

const PoolScreen = () => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Investment Pool</Text>
            </View>
            <PageWrapper contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Global Pool Status</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: theme.text }]}>$0.00</Text>
                            <Text style={{ color: theme.subText, fontSize: 12 }}>Total Pool Size</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
                            <Text style={{ color: theme.subText, fontSize: 12 }}>Investors</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Your Share</Text>
                    <Text style={[styles.shareValue, { color: '#4A9EFF' }]}>0%</Text>
                    <TouchableOpacity style={styles.joinBtn}>
                        <Text style={styles.joinBtnText}>Join Pool</Text>
                    </TouchableOpacity>
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
    cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statBox: { alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold' },
    shareValue: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
    joinBtn: { backgroundColor: '#4A9EFF', padding: 15, borderRadius: 8, alignItems: 'center' },
    joinBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default PoolScreen;
