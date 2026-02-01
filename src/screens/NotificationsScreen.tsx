import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import { useTheme } from '../theme/useTheme';

const NotificationsScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const theme = useTheme();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        if (!userInfo) return;
        setLoading(true);
        try {
            const res = await DataService.getNotifications(userInfo.id);
            if (res.success) {
                setNotifications(res.notifications);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleMarkRead = async (item: any) => {
        if (item.read_status) return;
        try {
            await DataService.markNotificationRead(item.id);
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read_status: 1 } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const handlePress = (item: any) => {
        handleMarkRead(item);
        // Navigate based on type
        if (item.type === 'order') {
            navigation.navigate(userInfo.user_type === 'Business' ? 'BusinessOrders' : 'CustomerOrders');
        } else if (item.type === 'appointment') {
            navigation.navigate('ServiceAppointments'); // Assuming screen name
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: item.read_status ? theme.cardBg : (theme.isDark ? '#2D3748' : '#EBF8FF'), borderColor: theme.borderColor }]}
            onPress={() => handlePress(item)}
        >
            <View style={styles.iconContainer}>
                {item.type === 'order' ? (
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2">
                        <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <Path d="M3 6h18" />
                        <Path d="M16 10a4 4 0 0 1-8 0" />
                    </Svg>
                ) : (
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2">
                        <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </Svg>
                )}
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.title, { color: theme.text, fontWeight: item.read_status ? '400' : 'bold' }]}>{item.title}</Text>
                <Text style={[styles.message, { color: theme.subText }]}>{item.message}</Text>
                <Text style={[styles.date, { color: theme.subText }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            {!item.read_status && (
                <View style={[styles.dot, { backgroundColor: theme.primary }]} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.inputBg }]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading && notifications.length === 0 ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: theme.subText }}>No notifications</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backButton: { padding: 5, borderRadius: 20 },
    card: { flexDirection: 'row', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
    iconContainer: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 16, marginBottom: 4 },
    message: { fontSize: 14, marginBottom: 4 },
    date: { fontSize: 12 },
    dot: { width: 10, height: 10, borderRadius: 5 }
});

export default NotificationsScreen;
