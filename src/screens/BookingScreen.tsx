import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import { useTheme } from '../theme/useTheme';
import CustomAlert from '../components/CustomAlert';
import Svg, { Path } from 'react-native-svg';

const BookingScreen = ({ route, navigation }: any) => {
    const { service } = route.params;
    const { userInfo } = useContext(AuthContext);
    const theme = useTheme();

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [staffList, setStaffList] = useState<any[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
    const [selectedShift, setSelectedShift] = useState<'Day' | 'Night' | null>(null);

    // Modal for Staff
    const [staffModalVisible, setStaffModalVisible] = useState(false);

    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' as 'info' | 'success' | 'error', onConfirm: undefined as (() => void) | undefined });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await DataService.getStaff(service.user_id);
            if (res.success) {
                setStaffList(res.staff);
            }
        } catch (e) { console.error(e); }
    };

    const handleBook = async () => {
        if (!date || !time) {
            setAlertConfig({ visible: true, title: 'Missing Info', message: 'Please select a date and time.', type: 'error', onConfirm: undefined });
            return;
        }

        if (service.service_type === 'Shift' && !selectedShift) {
            setAlertConfig({ visible: true, title: 'Missing Info', message: 'Please select a shift (Day/Night).', type: 'error', onConfirm: undefined });
            return;
        }

        setLoading(true);
        try {
            // Append time to date
            const appointmentDate = `${date} ${time}:00`;

            const res = await DataService.bookAppointment(
                service.user_id,
                userInfo.id,
                service.id,
                appointmentDate,
                service.duration_mins,
                // Pass staff ID if selected
                // (Using any typecast if bookAppointment signature isn't updated in TS yet, but JS allows extra args)
                // @ts-ignore
                selectedStaff
            );

            if (res.success) {
                setAlertConfig({
                    visible: true,
                    title: 'Success',
                    message: res.message || 'Booking Request Sent!',
                    type: 'success',
                    onConfirm: () => navigation.goBack()
                });
            }
        } catch (e: any) {
            setAlertConfig({ visible: true, title: 'Booking Failed', message: e.message || 'Could not complete booking.', type: 'error', onConfirm: undefined });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.inputBg }]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Book Service</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={[styles.svcName, { color: theme.text }]}>{service.name}</Text>
                <Text style={[styles.svcMeta, { color: theme.subText }]}>{service.service_type} • {service.duration_mins} mins</Text>

                {/* Shift Selection */}
                {service.service_type === 'Shift' && (
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.text }]}>Select Shift</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {['Day', 'Night'].map(shift => {
                                let priceDisplay = '';
                                try {
                                    const pricing = JSON.parse(service.pricing_structure || '{}');
                                    priceDisplay = pricing[shift.toLowerCase()];
                                } catch (e) {}

                                return (
                                    <TouchableOpacity
                                        key={shift}
                                        style={[styles.optionBtn, { backgroundColor: selectedShift === shift ? theme.primary : theme.inputBg }]}
                                        onPress={() => setSelectedShift(shift as 'Day' | 'Night')}
                                    >
                                        <Text style={{ color: selectedShift === shift ? 'white' : theme.text, fontWeight: '600' }}>{shift}</Text>
                                        <Text style={{ color: selectedShift === shift ? 'white' : theme.subText, fontSize: 12 }}>{priceDisplay} PKR</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Date & Time */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.text }]}>Date (YYYY-MM-DD)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                        placeholder="2026-05-20"
                        placeholderTextColor={theme.subText}
                        value={date}
                        onChangeText={setDate}
                    />
                    <Text style={[styles.label, { color: theme.text }]}>Time (HH:MM)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                        placeholder="10:00"
                        placeholderTextColor={theme.subText}
                        value={time}
                        onChangeText={setTime}
                    />
                </View>

                {/* Staff Selection */}
                {staffList.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.text }]}>Select Staff (Optional)</Text>
                        <TouchableOpacity style={[styles.dropdown, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]} onPress={() => setStaffModalVisible(true)}>
                            <Text style={{ color: selectedStaff ? theme.text : theme.subText }}>
                                {selectedStaff ? staffList.find(s => s.id === selectedStaff)?.name : 'Any Available Staff'}
                            </Text>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2"><Path d="M6 9l6 6 6-6" /></Svg>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.primary }]} onPress={handleBook} disabled={loading}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{loading ? 'Processing...' : 'Confirm Booking'}</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Staff Modal */}
            <Modal visible={staffModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Select Staff</Text>
                        <TouchableOpacity style={styles.staffItem} onPress={() => { setSelectedStaff(null); setStaffModalVisible(false); }}>
                            <Text style={{ color: theme.text }}>Any Available Staff</Text>
                        </TouchableOpacity>
                        {staffList.map(staff => (
                            <TouchableOpacity key={staff.id} style={styles.staffItem} onPress={() => { setSelectedStaff(staff.id); setStaffModalVisible(false); }}>
                                <Text style={{ color: theme.text }}>{staff.name} <Text style={{ color: theme.subText }}>({staff.role})</Text></Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setStaffModalVisible(false)}>
                            <Text style={{ color: theme.subText }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={alertConfig.onConfirm}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backButton: { padding: 5, borderRadius: 20 },
    svcName: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
    svcMeta: { fontSize: 14, marginBottom: 20 },
    section: { marginBottom: 25 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    input: { borderWidth: 1, borderRadius: 10, padding: 15, marginBottom: 10, fontSize: 16 },
    optionBtn: { padding: 15, borderRadius: 10, flex: 1, alignItems: 'center' },
    dropdown: { borderWidth: 1, borderRadius: 10, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    confirmBtn: { padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 10 },

    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    staffItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }
});

export default BookingScreen;
