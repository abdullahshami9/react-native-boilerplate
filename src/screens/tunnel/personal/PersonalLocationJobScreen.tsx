import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import MapView, { Marker } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';

const PersonalLocationJobScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [location, setLocation] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    // Resume logic removed as it's now in Education screen

    const handleNext = async () => {
        setLoading(true);
        try {
            // Save details
            await TunnelService.updatePersonalDetails(userInfo.id, { address: location, jobTitle });

            // Resume upload removed from here

            navigation.navigate('PaymentIntegration');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Personal Profile - Location & Job" onBack={() => navigation.goBack()}>
            <View style={styles.container}>

                {/* Map Placeholder */}
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
                                <Circle cx="12" cy="10" r="3" />
                            </Svg>
                        </View>
                        <TextInput
                            style={styles.overlayInput}
                            placeholder="Current Location"
                            placeholderTextColor="#4A5568"
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder="Current Job Title"
                        placeholderTextColor="#A0AEC0"
                        value={jobTitle}
                        onChangeText={setJobTitle}
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

// SVG Circle helper
const Circle = ({ cx, cy, r }: any) => (
    <Svg>
        <Path d={`M ${cx} ${cy} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`} fill="currentColor" />
    </Svg>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 16,
    },
    mapContainer: {
        height: 200,
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
        marginTop: -25, // Center vertically
    },
    locationIcon: {
        marginRight: 10,
    },
    overlayInput: {
        flex: 1,
        color: '#2D3748',
    },
    inputGroup: {
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 56,
        justifyContent: 'center',
    },
    input: {
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

export default PersonalLocationJobScreen;
