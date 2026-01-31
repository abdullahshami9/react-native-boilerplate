import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, RefreshControl } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { DataService } from '../services/DataService';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../theme/useTheme';
import CustomAlert from '../components/CustomAlert';
import StandardLoader from '../components/StandardLoader';

const ServiceAppointmentsScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const theme = useTheme();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Block Modal
    const [blockModalVisible, setBlockModalVisible] = useState(false);
    const [blockDate, setBlockDate] = useState('');
    const [blockReason, setBlockReason] = useState('Unavailable');

    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' as 'info' | 'success' | 'error' });

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        if (!refreshing) setLoading(true);
        try {
            const res = await DataService.getAppointments(userInfo.id);
            if (res.success) {
                setAppointments(res.appointments);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const res = await DataService.updateAppointmentStatus(id, status);
            if (res.success) {
                setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
                setAlertConfig({ visible: true, title: 'Success', message: `Appointment ${status}`, type: 'success' });
            }
        } catch (e) {
            setAlertConfig({ visible: true, title: 'Error', message: 'Failed to update status', type: 'error' });
        }
    };

    const handleBlockDate = async () => {
        if (!blockDate) return;
        try {
            await DataService.setAvailability(userInfo.id, blockDate, 'busy');
            setAlertConfig({ visible: true, title: 'Success', message: 'Date blocked successfully', type: 'success' });
            setBlockModalVisible(false);
            setBlockDate('');
        } catch (e) {
            setAlertConfig({ visible: true, title: 'Error', message: 'Failed to block date', type: 'error' });
        }
    };

    const renderItem = ({ item }: any) => {
        const isProvider = item.provider_id === userInfo.id;
        const otherParty = isProvider ? item.customer_name : item.provider_name;
        const date = new Date(item.appointment_date).toLocaleDateString() + ' ' + new Date(item.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        return (
            <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.roleLabel, { color: theme.subText }]}>{isProvider ? 'Client' : 'Provider'}: {otherParty}</Text>
                    <Text style={[styles.svcName, { color: theme.text }]}>{item.service_name || 'General Consultation'}</Text>
                    <Text style={[styles.date, { color: theme.text }]}>{date}</Text>
                    <Text style={[styles.status, { color: item.status === 'confirmed' ? 'green' : (item.status === 'cancelled' ? 'red' : 'orange') }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>

                {isProvider && item.status === 'pending' && (
                    <View style={{ gap: 10 }}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#48BB78' }]} onPress={() => handleUpdateStatus(item.id, 'confirmed')}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><Path d="M20 6L9 17l-5-5" /></Svg>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F56565' }]} onPress={() => handleUpdateStatus(item.id, 'cancelled')}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><Path d="M18 6L6 18M6 6l12 12" /></Svg>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.inputBg }]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Appointments</Text>
                <TouchableOpacity onPress={() => setBlockModalVisible(true)} style={{ padding: 5 }}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                        <Path d="M18 6L6 18M6 6l12 12" />
                    </Svg>
                </TouchableOpacity>
            </View>

            {loading ? <StandardLoader visible={true} /> : (
                <FlatList
                    data={appointments}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAppointments(); }} />}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.subText, marginTop: 50 }}>No appointments found.</Text>}
                />
            )}

            <Modal visible={blockModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Block Unavailability</Text>
                        <Text style={{ color: theme.subText, marginBottom: 5 }}>Date (YYYY-MM-DD)</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="2026-01-01" value={blockDate} onChangeText={setBlockDate} />

                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#E53E3E' }]} onPress={handleBlockDate}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Block Date</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setBlockModalVisible(false)}>
                            <Text style={{ color: theme.subText }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backButton: { padding: 5, borderRadius: 20 },
    card: { padding: 15, borderRadius: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
    roleLabel: { fontSize: 12, marginBottom: 2 },
    svcName: { fontSize: 16, fontWeight: '600' },
    date: { fontSize: 14, marginTop: 2 },
    status: { fontSize: 12, fontWeight: 'bold', marginTop: 5 },
    actionBtn: { padding: 10, borderRadius: 10 },

    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    modalContent: { width: '100%', borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 15 },
    saveButton: { padding: 15, borderRadius: 12, alignItems: 'center' }
});

export default ServiceAppointmentsScreen;
