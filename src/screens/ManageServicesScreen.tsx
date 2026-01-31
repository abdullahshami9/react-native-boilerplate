import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { DataService } from '../services/DataService';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../theme/useTheme';
import CustomAlert from '../components/CustomAlert';

const ManageServicesScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const theme = useTheme();
    const [services, setServices] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState('');
    const [serviceType, setServiceType] = useState('Hourly'); // Hourly, Shift, MultiDay
    const [location, setLocation] = useState('OnSite'); // OnSite, Home, Both
    const [cancellation, setCancellation] = useState('');
    const [autoApprove, setAutoApprove] = useState(false);

    // Shift Pricing
    const [dayPrice, setDayPrice] = useState('');
    const [nightPrice, setNightPrice] = useState('');

    // Staff Management
    const [staffModalVisible, setStaffModalVisible] = useState(false);
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffRole, setNewStaffRole] = useState('');

    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' as 'info' | 'success' | 'error' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [svcRes, staffRes] = await Promise.all([
                DataService.getServices(userInfo.id),
                DataService.getStaff(userInfo.id)
            ]);
            if (svcRes.success) setServices(svcRes.services);
            if (staffRes.success) setStaff(staffRes.staff);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async () => {
        if (!newStaffName) return;
        try {
            const res = await DataService.addStaff(userInfo.id, newStaffName, newStaffRole);
            if (res.success) {
                setStaff([...staff, res.staff]);
                setNewStaffName('');
                setNewStaffRole('');
                setStaffModalVisible(false);
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteStaff = async (id: number) => {
        try {
            await DataService.deleteStaff(id);
            setStaff(staff.filter(s => s.id !== id));
        } catch (e) { console.error(e); }
    };

    const openServiceModal = (service: any = null) => {
        setEditingService(service);
        if (service) {
            setName(service.name);
            setDescription(service.description);
            setDuration(String(service.duration_mins));
            setPrice(String(service.price));
            setServiceType(service.service_type || 'Hourly');
            setLocation(service.service_location || 'OnSite');
            setCancellation(service.cancellation_policy || '');
            setAutoApprove(service.auto_approve === 1 || service.auto_approve === true);

            if (service.service_type === 'Shift' && service.pricing_structure) {
                const pricing = JSON.parse(service.pricing_structure);
                setDayPrice(String(pricing.day || ''));
                setNightPrice(String(pricing.night || ''));
            } else {
                setDayPrice('');
                setNightPrice('');
            }
        } else {
            setName('');
            setDescription('');
            setDuration('');
            setPrice('');
            setServiceType('Hourly');
            setLocation('OnSite');
            setCancellation('');
            setAutoApprove(false);
            setDayPrice('');
            setNightPrice('');
        }
        setModalVisible(true);
    };

    const handleSaveService = async () => {
        if (!name || !duration) {
            setAlertConfig({ visible: true, title: 'Missing Fields', message: 'Name and Duration are required.', type: 'error' });
            return;
        }

        const payload: any = {
            user_id: userInfo.id,
            name,
            description,
            duration_mins: parseInt(duration),
            service_type: serviceType,
            service_location: location,
            cancellation_policy: cancellation,
            auto_approve: autoApprove
        };

        if (serviceType === 'Shift') {
            payload.pricing_structure = { day: parseFloat(dayPrice) || 0, night: parseFloat(nightPrice) || 0 };
            payload.price = parseFloat(dayPrice) || 0; // Default sort price
        } else {
            payload.price = parseFloat(price) || 0;
        }

        try {
            let res;
            if (editingService) {
                res = await DataService.updateService(editingService.id, payload);
            } else {
                res = await DataService.addService(payload);
            }

            if (res.success) {
                setModalVisible(false);
                fetchData();
                setAlertConfig({ visible: true, title: 'Success', message: 'Service saved successfully!', type: 'success' });
            }
        } catch (e) {
            setAlertConfig({ visible: true, title: 'Error', message: 'Failed to save service.', type: 'error' });
        }
    };

    const handleDeleteService = async (id: number) => {
        try {
            await DataService.deleteService(id);
            setServices(services.filter(s => s.id !== id));
        } catch (e) { console.error(e); }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.inputBg }]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Services</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={{ padding: 20 }}>
                <TouchableOpacity style={[styles.staffBtn, { backgroundColor: theme.cardBg }]} onPress={() => setStaffModalVisible(true)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="2" style={{ marginRight: 10 }}>
                            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </Svg>
                        <Text style={{ color: theme.text, fontWeight: '600' }}>Manage Staff ({staff.length})</Text>
                    </View>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2"><Path d="M9 18l6-6-6-6" /></Svg>
                </TouchableOpacity>
            </View>

            <FlatList
                data={services}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.svcName, { color: theme.text }]}>{item.name}</Text>
                            <Text style={[styles.svcMeta, { color: theme.subText }]}>{item.service_type} • {item.duration_mins} min</Text>
                            <Text style={[styles.svcPrice, { color: theme.primary }]}>
                                {item.service_type === 'Shift'
                                    ? `Day: ${JSON.parse(item.pricing_structure || '{}').day} / Night: ${JSON.parse(item.pricing_structure || '{}').night}`
                                    : `${item.price} PKR`
                                }
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={() => openServiceModal(item)} style={[styles.iconBtn, { backgroundColor: theme.inputBg }]}>
                                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Svg>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteService(item.id)} style={[styles.iconBtn, { backgroundColor: '#FED7D7' }]}>
                                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2"><Path d="M3 6h18" /><Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Svg>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => openServiceModal()}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><Path d="M12 5v14M5 12h14" /></Svg>
            </TouchableOpacity>

            {/* Service Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg, height: '90%' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{editingService ? 'Edit Service' : 'New Service'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ color: theme.subText }}>Close</Text></TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="Service Name" placeholderTextColor={theme.subText} value={name} onChangeText={setName} />
                            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="Description" placeholderTextColor={theme.subText} multiline value={description} onChangeText={setDescription} />

                            <Text style={{ color: theme.text, marginBottom: 8, fontWeight: '600' }}>Service Type</Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                                {['Hourly', 'Shift', 'MultiDay'].map(t => (
                                    <TouchableOpacity key={t} onPress={() => setServiceType(t)} style={[styles.chip, { backgroundColor: serviceType === t ? theme.primary : theme.inputBg }]}>
                                        <Text style={{ color: serviceType === t ? 'white' : theme.subText }}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {serviceType === 'Shift' ? (
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: theme.subText, marginBottom: 5 }}>Day Price</Text>
                                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="0" keyboardType="numeric" value={dayPrice} onChangeText={setDayPrice} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: theme.subText, marginBottom: 5 }}>Night Price</Text>
                                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="0" keyboardType="numeric" value={nightPrice} onChangeText={setNightPrice} />
                                    </View>
                                </View>
                            ) : (
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="Price (PKR)" keyboardType="numeric" value={price} onChangeText={setPrice} />
                            )}

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.subText, marginBottom: 5 }}>Duration (mins)</Text>
                                    <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="30" keyboardType="numeric" value={duration} onChangeText={setDuration} />
                                </View>
                            </View>

                            <Text style={{ color: theme.text, marginBottom: 8, fontWeight: '600' }}>Location</Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                                {['OnSite', 'Home', 'Both'].map(l => (
                                    <TouchableOpacity key={l} onPress={() => setLocation(l)} style={[styles.chip, { backgroundColor: location === l ? theme.primary : theme.inputBg }]}>
                                        <Text style={{ color: location === l ? 'white' : theme.subText }}>{l}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="Cancellation Policy (e.g. 24h notice)" placeholderTextColor={theme.subText} multiline value={cancellation} onChangeText={setCancellation} />

                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }} onPress={() => setAutoApprove(!autoApprove)}>
                                <Text style={{ color: theme.text, fontWeight: '600' }}>Auto-Approve Appointments</Text>
                                <View style={{ width: 40, height: 20, borderRadius: 10, backgroundColor: autoApprove ? theme.primary : theme.inputBorder, justifyContent: 'center', paddingHorizontal: 2 }}>
                                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'white', alignSelf: autoApprove ? 'flex-end' : 'flex-start' }} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSaveService}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Save Service</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Staff Modal */}
            <Modal visible={staffModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg, maxHeight: '70%' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Manage Staff</Text>
                            <TouchableOpacity onPress={() => setStaffModalVisible(false)}><Text style={{ color: theme.subText }}>Close</Text></TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                            <TextInput style={[styles.input, { flex: 2, marginBottom: 0, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="Name" placeholderTextColor={theme.subText} value={newStaffName} onChangeText={setNewStaffName} />
                            <TextInput style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]} placeholder="Role" placeholderTextColor={theme.subText} value={newStaffRole} onChangeText={setNewStaffRole} />
                            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.primary, width: 40, height: 40 }]} onPress={handleAddStaff}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={staff}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={[styles.card, { backgroundColor: theme.inputBg, flexDirection: 'row', alignItems: 'center' }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: theme.text, fontWeight: '600' }}>{item.name}</Text>
                                        <Text style={{ color: theme.subText }}>{item.role}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteStaff(item.id)}>
                                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2"><Path d="M18 6L6 18M6 6l12 12" /></Svg>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onDismiss={() => setAlertConfig(prev => ({...prev, visible: false}))} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backButton: { padding: 5, borderRadius: 20 },

    staffBtn: { padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    card: { padding: 15, borderRadius: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    svcName: { fontSize: 16, fontWeight: '600' },
    svcMeta: { fontSize: 12, marginTop: 4 },
    svcPrice: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
    iconBtn: { padding: 8, borderRadius: 20 },

    fab: { position: 'absolute', bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 5 },

    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 15 },
    chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    saveButton: { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 }
});

export default ManageServicesScreen;
