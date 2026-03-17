import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import Svg, { Path } from 'react-native-svg';

const VirtualTryOnHistoryScreen = ({ navigation }: any) => {
    const theme = useTheme();

    // Dummy session history data
    const sessions = [
        { id: '1', date: 'Oct 24, 2023', itemsTried: 4, preview: 'White T-Shirt, Denim Jacket...' },
        { id: '2', date: 'Oct 20, 2023', itemsTried: 2, preview: 'Black Hoodie, Polo Shirt...' },
        { id: '3', date: 'Oct 15, 2023', itemsTried: 6, preview: 'Summer Dress, Sun Hat...' },
    ];

    const renderSession = ({ item }: any) => (
        <TouchableOpacity
            style={[styles.sessionCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
            onPress={() => navigation.navigate('VirtualTryOn')} // In a real app, pass session ID
        >
            <View style={styles.sessionHeader}>
                <Text style={[styles.sessionDate, { color: theme.text }]}>{item.date}</Text>
                <Text style={[styles.itemsCount, { color: theme.primary }]}>{item.itemsTried} items tried</Text>
            </View>
            <Text style={[styles.sessionPreview, { color: theme.subText }]} numberOfLines={1}>{item.preview}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.borderColor }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Virtual Try-On Sessions</Text>
            </View>

            <FlatList
                data={sessions}
                keyExtractor={(item) => item.id}
                renderItem={renderSession}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={theme.subText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </Svg>
                        <Text style={[styles.emptyText, { color: theme.text }]}>No try-on sessions yet</Text>
                        <Text style={[styles.emptySubText, { color: theme.subText }]}>Start a new session to try on clothes virtually.</Text>
                    </View>
                }
            />

            {/* Floating Action Button for New Session */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('VirtualTryOn')}
            >
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    sessionCard: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sessionDate: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemsCount: {
        fontSize: 13,
        fontWeight: '600',
    },
    sessionPreview: {
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 6,
    }
});

export default VirtualTryOnHistoryScreen;