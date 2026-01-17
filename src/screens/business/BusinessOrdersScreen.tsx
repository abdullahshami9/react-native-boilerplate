import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { DataService } from '../../services/DataService';
import Svg, { Path } from 'react-native-svg';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BusinessOrdersScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await DataService.getBusinessOrders(userInfo.id);
            setOrders(data.orders || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        try {
            await DataService.updateOrderStatus(orderId, newStatus);
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            Alert.alert('Success', `Order marked as ${newStatus}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const toggleExpand = (id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    const renderItem = ({ item }: any) => {
        const isExpanded = expandedId === item.id;
        const dateObj = new Date(item.created_at);

        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.cardHeader}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.orderId}>Order #{item.id}</Text>
                        <Text style={styles.customerName}>{item.buyer_name || 'Guest Customer'}</Text>
                        <Text style={styles.dateText}>{dateObj.toLocaleDateString()} • {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                    </View>
                    <View style={styles.statusCol}>
                        <View style={[styles.statusBadge,
                            { backgroundColor: item.status === 'completed' ? '#C6F6D5' : item.status === 'cancelled' ? '#FED7D7' : '#FEFCBF' }
                        ]}>
                            <Text style={[styles.statusText,
                                { color: item.status === 'completed' ? '#22543D' : item.status === 'cancelled' ? '#822727' : '#744210' }
                            ]}>{item.status.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.totalAmount}>${item.total_amount}</Text>
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>Items:</Text>
                        {(item.items || []).map((prod: any, idx: number) => (
                            <View key={idx} style={styles.itemRow}>
                                <Text style={styles.itemName}>{prod.quantity}x {prod.product_name}</Text>
                                <Text style={styles.itemPrice}>${(prod.price * prod.quantity).toFixed(2)}</Text>
                            </View>
                        ))}

                        {item.status === 'pending' && (
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => handleUpdateStatus(item.id, 'cancelled')}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={() => handleUpdateStatus(item.id, 'completed')}>
                                    <Text style={styles.completeText}>Complete</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {/* Chat Button could go here */}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
             <View style={styles.header}>
                <Text style={styles.headerTitle}>Incoming Orders</Text>
            </View>

            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No orders received yet.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E2E8F0' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D3748' },
    listContent: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
    headerInfo: { flex: 1 },
    orderId: { fontSize: 14, color: '#A0AEC0', fontWeight: 'bold' },
    customerName: { fontSize: 18, fontWeight: '600', color: '#2D3748', marginVertical: 4 },
    dateText: { fontSize: 13, color: '#718096' },
    statusCol: { alignItems: 'flex-end' },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginBottom: 8 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },

    expandedContent: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#FAFAFA' },
    divider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 12 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    itemName: { fontSize: 15, color: '#2D3748' },
    itemPrice: { fontSize: 15, fontWeight: '600', color: '#4A5568' },
    actionButtons: { flexDirection: 'row', marginTop: 16, justifyContent: 'flex-end', gap: 10 },
    actionBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, minWidth: 100, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#FED7D7' },
    cancelText: { color: '#C53030', fontWeight: 'bold' },
    completeBtn: { backgroundColor: '#C6F6D5' },
    completeText: { color: '#22543D', fontWeight: 'bold' },
    emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 50 },
});

export default BusinessOrdersScreen;
