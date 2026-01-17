import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { DataService } from '../../services/DataService';
import { CONFIG } from '../../Config';

const ProcurementScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [procurement, setProcurement] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProcurement();
    }, []);

    const fetchProcurement = async () => {
        setLoading(true);
        try {
            const data = await DataService.getProcurementSummary(userInfo.id);
            setProcurement(data.procurement || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <Image
                source={{ uri: item.image_url ? `${CONFIG.API_URL}/${item.image_url}` : 'https://via.placeholder.com/100' }}
                style={styles.cardImage}
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.badgeContainer}>
                     <View style={styles.badge}>
                        <Text style={styles.badgeText}>Total Needed: {item.total_needed}</Text>
                     </View>
                </View>
                <Text style={styles.helperText}>Across all pending orders</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Procurement Summary</Text>
                <Text style={styles.headerSubtitle}>Aggregated items from pending orders</Text>
            </View>

            <FlatList
                data={procurement}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProcurement} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No pending items to procure.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E2E8F0' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D3748' },
    headerSubtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
    listContent: { padding: 20 },
    card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#E2E8F0' },
    cardContent: { flex: 1, marginLeft: 16 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 8 },
    badgeContainer: { flexDirection: 'row' },
    badge: { backgroundColor: '#EBF8FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    badgeText: { color: '#3182CE', fontWeight: 'bold', fontSize: 14 },
    helperText: { fontSize: 12, color: '#A0AEC0', marginTop: 6 },
    emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 50 },
});

export default ProcurementScreen;
