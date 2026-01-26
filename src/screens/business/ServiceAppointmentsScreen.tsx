import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { DataService } from '../../services/DataService';
import Svg, { Path, Circle } from 'react-native-svg';

const ServiceAppointmentsScreen = ({ navigation }: any) => {
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const theme = {
        bg: isDarkMode ? '#1A202C' : '#F7FAFC',
        text: isDarkMode ? '#F7FAFC' : '#2D3748',
        subText: isDarkMode ? '#A0AEC0' : '#718096',
        cardBg: isDarkMode ? '#2D3748' : '#fff',
        inputBg: isDarkMode ? '#2D3748' : '#F7FAFC',
        borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
        headerBg: isDarkMode ? '#2D3748' : '#fff',
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const data = await DataService.getAppointments(userInfo.id);
            // Sort by date descending
            const sorted = (data.appointments || []).sort((a: any, b: any) =>
                new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
            );
            setAppointments(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await DataService.updateAppointmentStatus(id, status);
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const renderItem = ({ item }: any) => {
        const isProvider = item.provider_id === userInfo.id;
        const otherName = isProvider ? item.customer_name : item.provider_name;
        const roleText = isProvider ? 'Customer' : 'Provider';
        const dateObj = new Date(item.appointment_date);

        return (
            <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                <View style={styles.headerRow}>
                    <Text style={[styles.serviceName, { color: theme.text }]}>{item.service_name || 'Appointment'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? '#C6F6D5' : item.status === 'cancelled' ? '#FED7D7' : '#FEFCBF' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'confirmed' ? '#22543D' : item.status === 'cancelled' ? '#822727' : '#744210' }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2">
                        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <Circle cx="12" cy="7" r="4" />
                    </Svg>
                    <Text style={[styles.detailText, { color: theme.text }]}>{roleText}: {otherName}</Text>
                </View>

                <View style={[styles.timeContainer, { backgroundColor: theme.bg }]}>
                    <View style={styles.timeBlock}>
                        <Text style={[styles.timeLabel, { color: theme.subText }]}>Date</Text>
                        <Text style={[styles.timeValue, { color: theme.text }]}>{dateObj.toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                    <View style={styles.timeBlock}>
                        <Text style={[styles.timeLabel, { color: theme.subText }]}>Time</Text>
                        <Text style={[styles.timeValue, { color: theme.text }]}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                    <View style={styles.timeBlock}>
                        <Text style={[styles.timeLabel, { color: theme.subText }]}>Duration</Text>
                        <Text style={[styles.timeValue, { color: theme.text }]}>{item.duration_mins || 30} min</Text>
                    </View>
                </View>

                {item.status === 'pending' && isProvider && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleStatusUpdate(item.id, 'cancelled')}>
                            <Text style={styles.rejectText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleStatusUpdate(item.id, 'confirmed')}>
                            <Text style={styles.acceptText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '600', color: theme.text }}>Appointments</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Shop', { screen: 'Services' })} style={{ padding: 5 }}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                        <Path d="M12 5v14M5 12h14" />
                    </Svg>
                </TouchableOpacity>
            </View>

            <FlatList
                data={appointments}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAppointments} tintColor={theme.text} />}
                ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subText }]}>No appointments found.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E2E8F0' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D3748' },
    listContent: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    serviceName: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    detailText: { marginLeft: 8, fontSize: 15, color: '#4A5568' },
    timeContainer: { flexDirection: 'row', backgroundColor: '#F7FAFC', borderRadius: 8, padding: 12 },
    timeBlock: { flex: 1, alignItems: 'center' },
    timeLabel: { fontSize: 12, color: '#A0AEC0', marginBottom: 4 },
    timeValue: { fontSize: 14, fontWeight: '600', color: '#2D3748' },
    divider: { width: 1, backgroundColor: '#E2E8F0', height: '100%' },
    emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 50 },
    actionButtons: { flexDirection: 'row', marginTop: 16, justifyContent: 'flex-end', gap: 10 },
    actionBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, minWidth: 100, alignItems: 'center' },
    rejectBtn: { backgroundColor: '#FED7D7' },
    rejectText: { color: '#C53030', fontWeight: 'bold' },
    acceptBtn: { backgroundColor: '#C6F6D5' },
    acceptText: { color: '#22543D', fontWeight: 'bold' },
});

export default ServiceAppointmentsScreen;
