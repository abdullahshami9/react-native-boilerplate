import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { DataService } from '../../../services/DataService';
import Svg, { Path } from 'react-native-svg';
import CustomAlert from '../../../components/CustomAlert';
import { useTheme } from '../../../theme/useTheme';
import EmptyState from '../../../components/EmptyState';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { ScrollView } from 'react-native';

const BusinessOrdersScreen = ({ navigation, route }: any) => {
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const theme = useTheme();
    const [orders, setOrders] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' as 'success' | 'error' });

    useEffect(() => {
        if (route.params?.status) {
            setFilterStatus(route.params.status);
        }
        fetchOrders();
    }, [route.params?.status]);

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

    const filteredOrders = orders.filter(o => filterStatus === 'All' || o.status === filterStatus);

    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        try {
            await DataService.updateOrderStatus(orderId, newStatus);
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            setAlertConfig({ visible: true, title: 'Success', message: `Order marked as ${newStatus}`, type: 'success' });
        } catch (error) {
            setAlertConfig({ visible: true, title: 'Error', message: 'Failed to update status', type: 'error' });
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
            <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.cardHeader}>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.orderId, { color: theme.subText }]}>Order #{item.id}</Text>
                        <Text style={[styles.customerName, { color: theme.text }]}>{item.buyer_name || 'Guest Customer'}</Text>
                        <Text style={[styles.dateText, { color: theme.subText }]}>{dateObj.toLocaleDateString()} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={styles.statusCol}>
                        <View style={[styles.statusBadge,
                        { backgroundColor: item.status === 'completed' ? '#C6F6D5' : item.status === 'cancelled' ? '#FED7D7' : item.status === 'accepted' ? '#EBF8FF' : '#FEFCBF' }
                        ]}>
                            <Text style={[styles.statusText,
                            { color: item.status === 'completed' ? '#22543D' : item.status === 'cancelled' ? '#822727' : item.status === 'accepted' ? '#2B6CB0' : '#744210' }
                            ]}>{item.status.toUpperCase()}</Text>
                        </View>
                        <Text style={[styles.totalAmount, { color: theme.text }]}>${item.total_amount}</Text>
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={[styles.expandedContent, { backgroundColor: isDarkMode ? '#232936' : '#FAFAFA' }]}>
                        <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Items:</Text>
                        {(item.items || []).map((prod: any, idx: number) => (
                            <View key={idx} style={styles.itemRow}>
                                <Text style={[styles.itemName, { color: theme.text }]}>{prod.quantity}x {prod.product_name}</Text>
                                <Text style={[styles.itemPrice, { color: theme.text }]}>${(prod.price * prod.quantity).toFixed(2)}</Text>
                            </View>
                        ))}

                        {item.status === 'pending' && (
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => handleUpdateStatus(item.id, 'cancelled')}>
                                    <Text style={styles.cancelText}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleUpdateStatus(item.id, 'accepted')}>
                                    <Text style={styles.acceptText}>Accept Order</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {item.status === 'accepted' && (
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={() => handleUpdateStatus(item.id, 'completed')}>
                                    <Text style={styles.completeText}>Complete Order</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
            />

            <View style={[styles.header, { backgroundColor: theme.bg, borderColor: theme.borderColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.inputBg }]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={{ height: 50, marginBottom: 10 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center', gap: 10 }}>
                    {['All', 'pending', 'accepted', 'completed', 'cancelled'].map(status => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterChip,
                                { backgroundColor: filterStatus === status ? (theme.buttonBg || '#4A9EFF') : theme.inputBg }
                            ]}
                            onPress={() => setFilterStatus(status)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: filterStatus === status ? 'white' : theme.text }
                            ]}>
                                {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredOrders}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} tintColor={theme.text} />}
                ListEmptyComponent={<EmptyState type="orders" message="No orders received yet." />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backButton: { padding: 5, borderRadius: 20 },
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
    acceptBtn: { backgroundColor: '#BEE3F8' },
    acceptText: { color: '#2B6CB0', fontWeight: 'bold' },
    completeBtn: { backgroundColor: '#C6F6D5' },
    completeText: { color: '#22543D', fontWeight: 'bold' },
    emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 50 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    filterText: { fontWeight: '600', fontSize: 13 },
});

export default BusinessOrdersScreen;
