import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import CustomAlert from '../components/CustomAlert';

const BookingScreen = ({ route, navigation }: any) => {
    const { service } = route.params;
    const { userInfo } = useContext(AuthContext);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' as 'success' | 'error' });

    // Generate next 14 days
    const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    useEffect(() => {
        fetchSlots();
    }, [selectedDate]);

    const fetchSlots = async () => {
        setLoadingSlots(true);
        setSelectedSlot(null);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const data = await DataService.getAppointmentSlots(service.user_id, dateStr);
            const busySlots = data.busySlots || [];

            // Generate slots (9 AM to 5 PM, every 30 mins)
            // Ideally we check service duration. If service is 60 mins, we need 60 min slots?
            // For simplicity, we use fixed start times (9:00, 9:30, ...) and check overlap.

            const generatedSlots = [];
            let startTime = 9 * 60; // 9:00 AM in minutes
            const endTime = 17 * 60; // 5:00 PM

            const serviceDuration = service.duration_mins || 30;

            while (startTime + serviceDuration <= endTime) {
                const hour = Math.floor(startTime / 60);
                const mins = startTime % 60;
                const timeString = `${hour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

                // Check collision
                // A slot is busy if [slotStart, slotEnd] overlaps with any [busyStart, busyEnd]
                // Need to parse busySlots
                const isBusy = busySlots.some((busy: any) => {
                    const busyDate = new Date(busy.appointment_date);
                    const busyStart = busyDate.getHours() * 60 + busyDate.getMinutes();
                    const busyEnd = busyStart + (busy.duration_mins || 30);

                    const slotStart = startTime;
                    const slotEnd = startTime + serviceDuration;

                    return (slotStart < busyEnd && slotEnd > busyStart);
                });

                if (!isBusy) {
                    generatedSlots.push(timeString);
                }

                startTime += 30; // Increment by 30 mins for next potential slot
            }
            setAvailableSlots(generatedSlots);

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleConfirm = async () => {
        if (!selectedSlot) return;

        setSubmitting(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const dateTimeStr = `${dateStr} ${selectedSlot}:00`;

            await DataService.bookAppointment(
                service.user_id,
                userInfo.id,
                service.id,
                dateTimeStr,
                service.duration_mins
            );

            setAlertConfig({ visible: true, title: 'Confirmed!', message: 'Your appointment has been booked.', type: 'success' });
            // Navigate back after delay
            setTimeout(() => {
                navigation.popToTop(); // Go back to root
            }, 2000);

        } catch (error) {
             setAlertConfig({ visible: true, title: 'Error', message: 'Booking failed. Try again.', type: 'error' });
             setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
             <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
            />

            <View style={styles.header}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.duration}>{service.duration_mins} min • ${service.price}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Date</Text>
                <FlatList
                    horizontal
                    data={days}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.toISOString()}
                    renderItem={({ item }) => {
                        const isSelected = item.toDateString() === selectedDate.toDateString();
                        return (
                            <TouchableOpacity
                                style={[styles.dateCard, isSelected && styles.selectedDate]}
                                onPress={() => setSelectedDate(item)}
                            >
                                <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                                    {item.toLocaleDateString('en-US', { weekday: 'short' })}
                                </Text>
                                <Text style={[styles.dateNum, isSelected && styles.selectedText]}>
                                    {item.getDate()}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                    contentContainerStyle={styles.dateList}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Time</Text>
                {loadingSlots ? (
                    <ActivityIndicator color="#2D3748" />
                ) : (
                    <View style={styles.slotsGrid}>
                        {availableSlots.length === 0 ? (
                             <Text style={styles.noSlots}>No slots available on this date.</Text>
                        ) : (
                            availableSlots.map(slot => (
                                <TouchableOpacity
                                    key={slot}
                                    style={[styles.slot, selectedSlot === slot && styles.selectedSlot]}
                                    onPress={() => setSelectedSlot(slot)}
                                >
                                    <Text style={[styles.slotText, selectedSlot === slot && styles.selectedSlotText]}>{slot}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.confirmButton, (!selectedSlot || submitting) && styles.disabledButton]}
                    onPress={handleConfirm}
                    disabled={!selectedSlot || submitting}
                >
                    <Text style={styles.confirmText}>{submitting ? 'Booking...' : 'Confirm Booking'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { padding: 20, borderBottomWidth: 1, borderColor: '#F7FAFC' },
    serviceName: { fontSize: 22, fontWeight: 'bold', color: '#2D3748' },
    duration: { fontSize: 16, color: '#718096', marginTop: 4 },
    section: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748', marginBottom: 15 },
    dateList: { gap: 10 },
    dateCard: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', minWidth: 60 },
    selectedDate: { backgroundColor: '#2D3748', borderColor: '#2D3748' },
    dayText: { fontSize: 12, color: '#A0AEC0', marginBottom: 4 },
    dateNum: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
    selectedText: { color: 'white' },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    slot: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E0' },
    selectedSlot: { backgroundColor: '#3182CE', borderColor: '#3182CE' },
    slotText: { color: '#4A5568', fontWeight: '500' },
    selectedSlotText: { color: 'white' },
    noSlots: { color: '#A0AEC0', fontStyle: 'italic' },
    footer: { marginTop: 'auto', padding: 20, borderTopWidth: 1, borderColor: '#EDF2F7' },
    confirmButton: { backgroundColor: '#2D3748', padding: 18, borderRadius: 30, alignItems: 'center' },
    disabledButton: { opacity: 0.5 },
    confirmText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default BookingScreen;
