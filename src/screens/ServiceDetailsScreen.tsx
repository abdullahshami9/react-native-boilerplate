import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { CONFIG } from '../Config';
import Svg, { Path, Circle } from 'react-native-svg';
import CustomAlert from '../components/CustomAlert';

const ServiceDetailsScreen = ({ route, navigation }: any) => {
    const { service } = route.params;
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' | 'info' });

    const theme = {
        bg: isDarkMode ? '#1A202C' : '#FFFFFF',
        text: isDarkMode ? '#F7FAFC' : '#2D3748',
        subText: isDarkMode ? '#A0AEC0' : '#718096',
        cardBg: isDarkMode ? '#2D3748' : '#F7FAFC',
        price: '#38A169',
    };

    const handleBook = () => {
        if (!userInfo) {
            setAlertConfig({ visible: true, title: 'Login Required', message: 'Please login to book a service', type: 'info' });
            return;
        }
        navigation.navigate('Booking', { service });
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
            />

            <Image
                source={{ uri: service.image_url ? `${CONFIG.API_URL}/${service.image_url}` : 'https://via.placeholder.com/400x300' }}
                style={styles.image}
            />

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: theme.text }]}>{service.name}</Text>
                    <Text style={[styles.price, { color: theme.price }]}>${service.price}</Text>
                </View>

                <View style={styles.metaRow}>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2">
                         <Circle cx="12" cy="12" r="10" />
                         <Path d="M12 6v6l4 2" />
                    </Svg>
                    <Text style={[styles.metaText, { color: theme.subText }]}>{service.duration_mins} mins</Text>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
                <Text style={[styles.description, { color: theme.subText }]}>{service.description || 'No description provided.'}</Text>

                <View style={[styles.providerInfo, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.providerLabel, { color: theme.subText }]}>Provided by</Text>
                    <Text style={[styles.providerName, { color: theme.text }]}>Business ID: {service.user_id}</Text>
                </View>

                <TouchableOpacity style={[styles.bookButton, { backgroundColor: isDarkMode ? '#4A9EFF' : '#2D3748' }]} onPress={handleBook}>
                    <Text style={styles.bookButtonText}>Book Appointment</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    image: { width: '100%', height: 250, resizeMode: 'cover' },
    content: { padding: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', flex: 1 },
    price: { fontSize: 22, fontWeight: 'bold' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    metaText: { marginLeft: 6, fontSize: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    description: { fontSize: 16, lineHeight: 24, marginBottom: 30 },
    providerInfo: { padding: 15, borderRadius: 12, marginBottom: 30 },
    providerLabel: { fontSize: 14 },
    providerName: { fontSize: 16, fontWeight: '600', marginTop: 4 },
    bookButton: { paddingVertical: 18, borderRadius: 30, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    bookButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default ServiceDetailsScreen;
