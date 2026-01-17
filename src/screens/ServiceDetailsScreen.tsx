import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { CONFIG } from '../Config';
import Svg, { Path, Circle } from 'react-native-svg';

const ServiceDetailsScreen = ({ route, navigation }: any) => {
    const { service } = route.params;
    const { userInfo } = useContext(AuthContext);

    const handleBook = () => {
        if (!userInfo) {
            Alert.alert('Login Required', 'Please login to book a service');
            return;
        }
        navigation.navigate('Booking', { service });
    };

    return (
        <ScrollView style={styles.container}>
            <Image
                source={{ uri: service.image_url ? `${CONFIG.API_URL}/${service.image_url}` : 'https://via.placeholder.com/400x300' }}
                style={styles.image}
            />

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{service.name}</Text>
                    <Text style={styles.price}>${service.price}</Text>
                </View>

                <View style={styles.metaRow}>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2">
                         <Circle cx="12" cy="12" r="10" />
                         <Path d="M12 6v6l4 2" />
                    </Svg>
                    <Text style={styles.metaText}>{service.duration_mins} mins</Text>
                </View>

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{service.description || 'No description provided.'}</Text>

                <View style={styles.providerInfo}>
                    <Text style={styles.providerLabel}>Provided by</Text>
                    {/* If we had provider name in service object, show it. Otherwise maybe fetch. Assuming service object has it or we just show Generic for now */}
                    <Text style={styles.providerName}>Business ID: {service.user_id}</Text>
                </View>

                <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
                    <Text style={styles.bookButtonText}>Book Appointment</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    image: { width: '100%', height: 250, resizeMode: 'cover' },
    content: { padding: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#2D3748', flex: 1 },
    price: { fontSize: 22, fontWeight: 'bold', color: '#38A169' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    metaText: { marginLeft: 6, color: '#718096', fontSize: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
    description: { fontSize: 16, color: '#4A5568', lineHeight: 24, marginBottom: 30 },
    providerInfo: { padding: 15, backgroundColor: '#F7FAFC', borderRadius: 12, marginBottom: 30 },
    providerLabel: { fontSize: 14, color: '#A0AEC0' },
    providerName: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginTop: 4 },
    bookButton: { backgroundColor: '#2D3748', paddingVertical: 18, borderRadius: 30, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    bookButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default ServiceDetailsScreen;
