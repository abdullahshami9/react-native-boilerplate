import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, LayoutAnimation, Platform, UIManager, Modal } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import Svg, { Path } from 'react-native-svg';
import StandardLoader from '../components/StandardLoader';
import { useTheme } from '../theme/useTheme';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../shared/components/SkeletonLoader';

const CustomerOrdersScreen = ({ navigation }: any) => {
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const theme = useTheme();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        if (orders.length === 0 && !refreshing) setLoading(true);
        try {
            const data = await DataService.getCustomerOrders(userInfo.id);
            setOrders(data.orders || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    };

    const renderItem = ({ item }: any) => {
        const dateObj = new Date(item.created_at);

        return (
            <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { order: item })} style={styles.cardHeader}>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.orderId, { color: theme.subText }]}>Order #{item.id}</Text>
                        <Text style={[styles.customerName, { color: theme.text }]}>{item.seller_name || 'Business'}</Text>
                        <Text style={[styles.dateText, { color: theme.subText }]}>{dateObj.toLocaleDateString()} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={styles.statusCol}>
                        <View style={[styles.statusBadge,
                        { backgroundColor: item.status === 'completed' ? '#C6F6D5' : item.status === 'cancelled' ? '#FED7D7' : '#FEFCBF' }
                        ]}>
                            <Text style={[styles.statusText,
                            { color: item.status === 'completed' ? '#22543D' : item.status === 'cancelled' ? '#822727' : '#744210' }
                            ]}>{item.status.toUpperCase()}</Text>
                        </View>
                        <Text style={[styles.totalAmount, { color: theme.text }]}>${item.total_amount}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && orders.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <View style={[styles.header, { backgroundColor: theme.bg }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                            <Path d="M19 12H5M12 19l-7-7 7-7" />
                        </Svg>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>My Orders</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={{ padding: 20 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <View key={i} style={{ marginBottom: 15, padding: 15, borderRadius: 12, backgroundColor: theme.cardBg }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <SkeletonLoader width={100} height={14} />
                                <SkeletonLoader width={60} height={20} borderRadius={6} />
                            </View>
                            <SkeletonLoader width={150} height={18} style={{ marginBottom: 5 }} />
                            <SkeletonLoader width={120} height={12} />
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.bg }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                        <Path d="M19 12H5M12 19l-7-7 7-7" />
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Orders</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['transparent']}
                        tintColor="transparent"
                        progressBackgroundColor="transparent"
                    />
                }
                ListEmptyComponent={<EmptyState type="orders" message="You haven't placed any orders." />}
            />

            <StandardLoader visible={showLoader} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
    backButton: { padding: 5, borderRadius: 20 },
    headerTitle: { fontSize: 20, fontWeight: '600' },
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
    emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 50 },
});

export default CustomerOrdersScreen;
