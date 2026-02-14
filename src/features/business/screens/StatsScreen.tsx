import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import Svg, { Rect, Text as SvgText, Line, Path } from 'react-native-svg';
import { AuthContext } from '../../../context/AuthContext';
import { DataService } from '../../../services/DataService';
import { useTheme } from '../../../theme/useTheme';
import StandardLoader from '../../../components/StandardLoader';

const { width } = Dimensions.get('window');

const StatsScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [stats, setStats] = useState({ pending_count: 0, pending_amount: 0, cancelled_count: 0, cancelled_amount: 0 });

    const fetchData = async () => {
        try {
            const res = await DataService.getSalesReport(userInfo.id);
            if (res.success) {
                // Ensure data is sorted by date ascending
                const sorted = res.daily.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setSalesData(sorted);
                setMonthlyTotal(res.monthlyTotal || 0);

                // Calculate total orders for the period (Completed only as per backend)
                const orders = sorted.reduce((sum: number, day: any) => sum + day.count, 0);
                setTotalOrders(orders);
                setStats(res.stats || { pending_count: 0, pending_amount: 0, cancelled_count: 0, cancelled_amount: 0 });
            }
        } catch (error) {
            console.error('StatsScreen: Error fetching sales report', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Simple Bar Chart Component
    const BarChart = ({ data }: { data: any[] }) => {
        if (!data || data.length === 0) {
            return (
                <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: theme.subText }}>No sales data available yet.</Text>
                </View>
            );
        }

        const chartHeight = 200;
        const chartWidth = width - 60; // Padding
        const barWidth = 20;
        const spacing = 10;

        // Find max value for scaling
        const maxVal = Math.max(...data.map(d => parseFloat(d.total)), 100); // Min 100 to avoid division by zero

        // Limit to last 7-10 days to fit screen or use ScrollView horizontally
        const displayData = data.slice(-7);

        return (
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <Svg width={chartWidth} height={chartHeight + 40}>
                    {/* Y-Axis Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                        const y = chartHeight - (t * chartHeight);
                        return (
                            <React.Fragment key={i}>
                                <Line x1="0" y1={y} x2={chartWidth} y2={y} stroke={theme.divider} strokeDasharray="4 4" />
                                <SvgText x="-10" y={y + 5} fill={theme.subText} fontSize="10" textAnchor="end">
                                    {Math.round(t * maxVal)}
                                </SvgText>
                            </React.Fragment>
                        );
                    })}

                    {displayData.map((d, i) => {
                        const val = parseFloat(d.total);
                        const barHeight = (val / maxVal) * chartHeight;
                        const x = (i * (barWidth + spacing)) + 20; // Offset
                        const y = chartHeight - barHeight;

                        return (
                            <React.Fragment key={i}>
                                <Rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    fill={theme.primary}
                                    rx="4"
                                />
                                <SvgText
                                    x={x + barWidth / 2}
                                    y={chartHeight + 20}
                                    fill={theme.text}
                                    fontSize="10"
                                    textAnchor="middle"
                                >
                                    {new Date(d.date).getDate()}
                                </SvgText>
                            </React.Fragment>
                        );
                    })}
                </Svg>
                <Text style={{ color: theme.subText, fontSize: 12, marginTop: 5 }}>Last 7 Days Sales (PKR)</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.bg, borderBottomColor: theme.navBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.inputBg }]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Analytics</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <StandardLoader visible={true} />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                    }
                >
                    {/* Summary Cards */}
                    <View style={styles.summaryRow}>
                        <TouchableOpacity
                            style={[styles.summaryCard, { backgroundColor: theme.cardBg }]}
                            onPress={() => navigation.navigate('BusinessOrders', { status: 'completed' })}
                        >
                            <Text style={[styles.summaryLabel, { color: theme.subText }]}>Completed Revenue (Mo)</Text>
                            <Text style={[styles.summaryValue, { color: theme.primary }]}>PKR {monthlyTotal.toLocaleString()}</Text>
                            <Text style={{ fontSize: 10, color: theme.subText, marginTop: 5 }}>{totalOrders} Orders</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.summaryCard, { backgroundColor: theme.cardBg }]}
                            onPress={() => navigation.navigate('BusinessOrders', { status: 'pending' })}
                        >
                            <Text style={[styles.summaryLabel, { color: theme.subText }]}>Pending Orders</Text>
                            <Text style={[styles.summaryValue, { color: '#D69E2E' }]}>{stats.pending_count}</Text>
                            <Text style={{ fontSize: 10, color: theme.subText, marginTop: 5 }}>PKR {parseFloat(stats.pending_amount || '0').toLocaleString()}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.summaryRow}>
                        <TouchableOpacity
                            style={[styles.summaryCard, { backgroundColor: theme.cardBg }]}
                            onPress={() => navigation.navigate('BusinessOrders', { status: 'cancelled' })}
                        >
                            <Text style={[styles.summaryLabel, { color: theme.subText }]}>Cancelled Orders</Text>
                            <Text style={[styles.summaryValue, { color: '#E53E3E' }]}>{stats.cancelled_count}</Text>
                            <Text style={{ fontSize: 10, color: theme.subText, marginTop: 5 }}>PKR {parseFloat(stats.cancelled_amount || '0').toLocaleString()}</Text>
                        </TouchableOpacity>

                         {/* Placeholder or Cancellation Rate */}
                         <View style={[styles.summaryCard, { backgroundColor: theme.cardBg }]}>
                            <Text style={[styles.summaryLabel, { color: theme.subText }]}>Cancellation Rate</Text>
                            <Text style={[styles.summaryValue, { color: theme.text }]}>
                                {((stats.cancelled_count / (stats.cancelled_count + totalOrders + stats.pending_count || 1)) * 100).toFixed(1)}%
                            </Text>
                         </View>
                    </View>

                    {/* Chart Section */}
                    <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Revenue</Text>
                        <BarChart data={salesData} />
                    </View>

                    {/* Recent History List */}
                    <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
                        {salesData.length === 0 ? (
                            <Text style={{ color: theme.subText, padding: 10 }}>No activity recorded yet.</Text>
                        ) : (
                            salesData.slice(0).reverse().map((day: any, index: number) => (
                                <View key={index} style={[styles.historyRow, { borderBottomColor: theme.divider }]}>
                                    <View>
                                        <Text style={[styles.historyDate, { color: theme.text }]}>{new Date(day.date).toDateString()}</Text>
                                        <Text style={[styles.historySub, { color: theme.subText }]}>{day.count} Orders</Text>
                                    </View>
                                    <Text style={[styles.historyAmount, { color: theme.success }]}>+ PKR {parseFloat(day.total).toLocaleString()}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backButton: { padding: 5, borderRadius: 20 },
    content: { padding: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    summaryCard: { flex: 0.48, padding: 20, borderRadius: 12, elevation: 2, alignItems: 'center' },
    summaryLabel: { fontSize: 12, marginBottom: 5 },
    summaryValue: { fontSize: 20, fontWeight: 'bold' },
    section: { borderRadius: 12, padding: 20, marginBottom: 20, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    historyDate: { fontSize: 14, fontWeight: '600' },
    historySub: { fontSize: 12 },
    historyAmount: { fontSize: 14, fontWeight: 'bold' },
});

export default StatsScreen;
