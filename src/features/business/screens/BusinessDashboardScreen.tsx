import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { DataService } from '../../../services/DataService';
import { useTheme } from '../../../theme/useTheme';
import Svg, { Path, Circle } from 'react-native-svg';
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from 'react-native-safe-area-context';
import SocketService from '../../../services/SocketService';
import { resolveImage, getDefaultImageForType } from '../../../utils/ImageHelper';

const { width } = Dimensions.get("window");

const StatCard = ({ label, value, icon, color, theme }: any) => (
    <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
            {icon}
        </View>
        <View>
            <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>{label}</Text>
        </View>
    </View>
);

const BusinessDashboardScreen = ({ navigation }: any) => {
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data State
    const [salesChartData, setSalesChartData] = useState<any>({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
    });
    const [todaySales, setTodaySales] = useState(0);
    const [activeOrdersCount, setActiveOrdersCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();

        // Listen for new orders
        SocketService.connect(userInfo.id);
        const offOrder = SocketService.onOrderUpdate((order) => {
            // Refresh data on order update (e.g. status change)
            fetchDashboardData();
        });

        return () => {
            offOrder();
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 1. Sales Report
            const salesRes = await DataService.getSalesReport(userInfo.id);
            if (salesRes.success) {
                // Process 7 days
                const daily = salesRes.daily || [];
                const labels = [];
                const data = [];
                const today = new Date().toISOString().split('T')[0];
                let todayTotal = 0;

                // Simple logic: last 7 days from report or just map the last 7 entries
                // Assuming daily is sorted by date
                const last7 = daily.slice(-7);
                for (let d of last7) {
                    labels.push(new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }));
                    data.push(d.total);
                    if (d.date.startsWith(today)) todayTotal = d.total;
                }

                // If no data, keep defaults
                if (data.length > 0) {
                    setSalesChartData({ labels, datasets: [{ data }] });
                }
                setTodaySales(todayTotal);
            }

            // 2. Orders
            const ordersRes = await DataService.getBusinessOrders(userInfo.id);
            if (ordersRes.orders) {
                const orders = ordersRes.orders;
                const pending = orders.filter((o: any) => o.status === 'pending');
                const active = orders.filter((o: any) => ['pending', 'accepted', 'shipped'].includes(o.status));

                setPendingOrders(pending);
                setActiveOrdersCount(active.length);
            }

            // 3. Products (Low Stock)
            const prodRes = await DataService.getProducts(userInfo.id);
            if (prodRes.products) {
                const low = prodRes.products.filter((p: any) => p.stock < 5);
                setLowStockCount(low.length);
            }

        } catch (error) {
            console.error("Dashboard Fetch Error", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const handleAcceptOrder = async (orderId: number) => {
        try {
            await DataService.updateOrderStatus(orderId, 'accepted');
            fetchDashboardData(); // Refresh UI
            Alert.alert("Success", "Order accepted.");
        } catch (e) {
            Alert.alert("Error", "Failed to accept order.");
        }
    };

    const handleRejectOrder = async (orderId: number) => {
        try {
            await DataService.updateOrderStatus(orderId, 'cancelled');
            fetchDashboardData(); // Refresh UI
            Alert.alert("Success", "Order rejected.");
        } catch (e) {
            Alert.alert("Error", "Failed to reject order.");
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Dashboard</Text>
                <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
                    <Image
                        source={resolveImage(userInfo.profile_pic_url || getDefaultImageForType('business'))}
                        style={styles.headerAvatar}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />}
            >
                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <StatCard
                        label="Today's Sales"
                        value={`$${todaySales}`}
                        icon={<Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#48BB78" strokeWidth="2"><Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Svg>}
                        color="#48BB78"
                        theme={theme}
                    />
                    <StatCard
                        label="Active Orders"
                        value={activeOrdersCount}
                        icon={<Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4299E1" strokeWidth="2"><Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></Svg>}
                        color="#4299E1"
                        theme={theme}
                    />
                    <StatCard
                        label="Low Stock"
                        value={lowStockCount}
                        icon={<Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ED8936" strokeWidth="2"><Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><Path d="M12 9v4" /><Path d="M12 17h.01" /></Svg>}
                        color="#ED8936"
                        theme={theme}
                    />
                </View>

                {/* Sales Chart */}
                <View style={[styles.chartCard, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Sales Overview</Text>
                    <LineChart
                        data={salesChartData}
                        width={width - 60}
                        height={220}
                        yAxisLabel="$"
                        chartConfig={{
                            backgroundColor: theme.cardBg,
                            backgroundGradientFrom: theme.cardBg,
                            backgroundGradientTo: theme.cardBg,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 168, 132, ${opacity})`, // Primary teal
                            labelColor: (opacity = 1) => theme.subText,
                            style: { borderRadius: 16 },
                            propsForDots: { r: "4", strokeWidth: "2", stroke: "#00a884" }
                        }}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                </View>

                {/* Action Center - Pending Orders */}
                <View style={{ marginTop: 20 }}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 10 }]}>Pending Orders ({pendingOrders.length})</Text>
                    {pendingOrders.length === 0 ? (
                        <View style={[styles.emptyCard, { backgroundColor: theme.cardBg }]}>
                            <Text style={{ color: theme.subText }}>No pending orders.</Text>
                        </View>
                    ) : (
                        pendingOrders.map((order) => (
                            <View key={order.id} style={[styles.orderCard, { backgroundColor: theme.cardBg }]}>
                                <View style={styles.orderHeader}>
                                    <View>
                                        <Text style={[styles.orderId, { color: theme.text }]}>Order #{order.id}</Text>
                                        <Text style={[styles.orderTime, { color: theme.subText }]}>{new Date(order.created_at).toLocaleTimeString()}</Text>
                                    </View>
                                    <Text style={[styles.orderAmount, { color: theme.text }]}>${order.total_amount}</Text>
                                </View>
                                <View style={styles.orderItems}>
                                    <Text style={{ color: theme.subText }} numberOfLines={1}>
                                        {order.items.map((i: any) => `${i.quantity}x ${i.product_name}`).join(', ')}
                                    </Text>
                                </View>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleRejectOrder(order.id)}>
                                        <Text style={styles.rejectText}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleAcceptOrder(order.id)}>
                                        <Text style={styles.acceptText}>Accept</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    headerAvatar: { width: 40, height: 40, borderRadius: 20 },
    content: { padding: 20 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statCard: { width: '31%', padding: 10, borderRadius: 12, elevation: 2, shadowOpacity: 0.1, shadowRadius: 3, alignItems: 'center' },
    statIcon: { padding: 8, borderRadius: 20, marginBottom: 8 },
    statValue: { fontSize: 16, fontWeight: 'bold' },
    statLabel: { fontSize: 10, textAlign: 'center' },

    chartCard: { padding: 15, borderRadius: 16, elevation: 2, shadowOpacity: 0.1, shadowRadius: 3, alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', alignSelf: 'flex-start' },

    emptyCard: { padding: 20, borderRadius: 12, alignItems: 'center' },
    orderCard: { padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2, shadowOpacity: 0.1 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    orderId: { fontWeight: 'bold' },
    orderTime: { fontSize: 12 },
    orderAmount: { fontWeight: 'bold', fontSize: 16 },
    orderItems: { marginBottom: 15 },
    actionButtons: { flexDirection: 'row', gap: 10 },
    actionBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
    rejectBtn: { backgroundColor: '#FED7D7' },
    rejectText: { color: '#C53030', fontWeight: 'bold' },
    acceptBtn: { backgroundColor: '#C6F6D5' },
    acceptText: { color: '#22543D', fontWeight: 'bold' },
});

export default BusinessDashboardScreen;
