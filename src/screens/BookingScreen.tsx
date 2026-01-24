import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import CustomAlert from '../components/CustomAlert';

const BookingScreen = ({ route, navigation }: any) => {
    const { service } = route.params;
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' as 'success' | 'error' });

    const theme = {
        bg: isDarkMode ? '#1A202C' : '#FFFFFF',
        text: isDarkMode ? '#F7FAFC' : '#2D3748',
        subText: isDarkMode ? '#A0AEC0' : '#718096',
        cardBg: isDarkMode ? '#2D3748' : '#fff',
        inputBg: isDarkMode ? '#2D3748' : '#fff',
        borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
        headerBg: isDarkMode ? '#2D3748' : '#fff',
    };

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

            let rules = service.booking_rules;
            if (typeof rules === 'string') {
                try { rules = JSON.parse(rules); } catch(e) {}
            }

            if (rules?.type === 'day_night') {
                // Day/Night Logic
                // Day = 10:00 (600 mins), Night = 20:00 (1200 mins)
                const slotsToCheck = [
                    { label: 'Day Shift', time: '10:00', start: 600 },
                    { label: 'Night Shift', time: '20:00', start: 1200 }
                ];

                const generatedSlots: string[] = [];

                slotsToCheck.forEach(slot => {
                    // Check if occupied
                    const isBusy = busySlots.some((busy: any) => {
                        const busyDate = new Date(busy.appointment_date);
                        const busyStart = busyDate.getHours() * 60 + busyDate.getMinutes();
                        // Simple check: if start time matches approx
                        return Math.abs(busyStart - slot.start) < 60; // 1 hour buffer
                    });

                    if (!isBusy) {
                        generatedSlots.push(slot.time); // Use time as value, but maybe label for display?
                        // For MVP simplicity, we display '10:00' and '20:00' but user knows context if title says "Day/Night"
                        // Or we can change the UI to show labels.
                        // I'll stick to time format for consistency with availableSlots type, but render conditionally?
                    }
                });

                setAvailableSlots(generatedSlots);

            } else {
                // Duration Logic
                const generatedSlots = [];
                let startTime = 9 * 60; // 9:00 AM in minutes
                const endTime = 17 * 60; // 5:00 PM

                const serviceDuration = service.duration_mins || 30;

                while (startTime + serviceDuration <= endTime) {
                    const hour = Math.floor(startTime / 60);
                    const mins = startTime % 60;
                    const timeString = `${hour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

                    // Check collision
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

                    startTime += 30;
                }
                setAvailableSlots(generatedSlots);
            }

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
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
             <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
            />

            <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
                <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                <Text style={[styles.duration, { color: theme.subText }]}>{service.duration_mins} min • ${service.price}</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Date</Text>
                <FlatList
                    horizontal
                    data={days}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.toISOString()}
                    renderItem={({ item }) => {
                        const isSelected = item.toDateString() === selectedDate.toDateString();
                        return (
                            <TouchableOpacity
                                style={[styles.dateCard, { borderColor: theme.borderColor }, isSelected && styles.selectedDate]}
                                onPress={() => setSelectedDate(item)}
                            >
                                <Text style={[styles.dayText, { color: theme.subText }, isSelected && styles.selectedText]}>
                                    {item.toLocaleDateString('en-US', { weekday: 'short' })}
                                </Text>
                                <Text style={[styles.dateNum, { color: theme.text }, isSelected && styles.selectedText]}>
                                    {item.getDate()}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                    contentContainerStyle={styles.dateList}
                />
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Time</Text>
                {loadingSlots ? (
                    <ActivityIndicator color={theme.text} />
                ) : (
                    <View style={styles.slotsGrid}>
                        {availableSlots.length === 0 ? (
                             <Text style={[styles.noSlots, { color: theme.subText }]}>No slots available on this date.</Text>
                        ) : (
                            availableSlots.map(slot => (
                                <TouchableOpacity
                                    key={slot}
                                    style={[styles.slot, { borderColor: theme.borderColor }, selectedSlot === slot && styles.selectedSlot]}
                                    onPress={() => setSelectedSlot(slot)}
                                >
                                    <Text style={[styles.slotText, { color: theme.text }, selectedSlot === slot && styles.selectedSlotText]}>{slot}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}
            </View>

            <View style={[styles.footer, { borderTopColor: theme.borderColor }]}>
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
