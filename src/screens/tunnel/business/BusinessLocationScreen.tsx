import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import MapView, { Marker } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';

const BusinessLocationScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        setLoading(true);
        try {
            await TunnelService.updateBusinessLocation(userInfo.id, {
                address: address,
                lat: 0, // Placeholder
                lng: 0  // Placeholder
            });
            navigation.navigate('BusinessTypeContact');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Business Profile - Location" onBack={() => navigation.goBack()}>
            <View style={styles.container}>

                {/* Map View */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 37.78825,
                            longitude: -122.4324,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        <Marker
                            coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
                            title={"Selected Location"}
                            draggable
                        />
                    </MapView>
                    <View style={styles.locationInputOverlay}>
                        <View style={styles.locationIcon}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2">
                                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                            </Svg>
                        </View>
                        <TextInput
                            style={styles.overlayInput}
                            placeholder="Business Location"
                            placeholderTextColor="#4A5568"
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.inputIcon}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                        </Svg>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="123 Business Road, City"
                        placeholderTextColor="#A0AEC0"
                        value={address}
                        onChangeText={setAddress}
                    />
                </View>

                <View style={styles.spacer} />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNext}
                        disabled={loading}
                    >
                        <Text style={styles.nextButtonText}>{loading ? 'Saving...' : 'Next'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TunnelWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 16,
    },
    mapContainer: {
        height: 250,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 10,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    locationInputOverlay: {
        position: 'absolute',
        top: '50%',
        left: '10%',
        right: '10%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 50,
        marginTop: -25,
    },
    locationIcon: {
        marginRight: 10,
    },
    overlayInput: {
        flex: 1,
        color: '#2D3748',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
    },
    spacer: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    backButton: {
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 30,
        backgroundColor: '#E2E8F0',
    },
    backButtonText: {
        color: '#4A5568',
        fontWeight: '600',
    },
    nextButton: {
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 30,
        backgroundColor: '#2D3748',
    },
    nextButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default BusinessLocationScreen;
