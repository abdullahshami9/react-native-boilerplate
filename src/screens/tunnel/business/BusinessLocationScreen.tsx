import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import AddressSelector from '../../../components/AddressSelector';
import Svg, { Path, Circle } from 'react-native-svg';
import Geolocation from 'react-native-geolocation-service';

const BusinessLocationScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [address, setAddress] = useState('');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            const auth = await Geolocation.requestAuthorization("whenInUse");
            if(auth === "granted") return true;
        }

        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "We need access to your location to set your business address.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return false;
    };

    const handleGetCurrentLocation = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Location permission is required.');
            return;
        }

        setLocating(true);
        Geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocating(false);
            },
            (error) => {
                console.log(error.code, error.message);
                Alert.alert('Error', 'Failed to get location: ' + error.message);
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const handleViewMap = () => {
        if (!coords) return;
        const url = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const handleNext = async () => {
        if (!address) {
            Alert.alert("Missing Address", "Please select a business address.");
            return;
        }
        if (!username.trim()) {
            Alert.alert("Missing Username", "Please enter a username.");
            return;
        }

        setLoading(true);
        try {
            // Save Username
            await TunnelService.updatePersonalAdditionalInfo(userInfo.id, { username, gender: '', interests: [] });

            // Save Location
            await TunnelService.updateBusinessLocation(userInfo.id, {
                address: address,
                lat: coords ? coords.lat : 0,
                lng: coords ? coords.lng : 0
            });
            navigation.navigate('BusinessTypeContact');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to save details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Business Profile - Location" onBack={() => navigation.goBack()}>
            <View style={styles.container}>

                {/* Username Section */}
                <View style={{ marginBottom: 20 }}>
                     <Text style={{ fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8, marginLeft: 4 }}>Username</Text>
                     <View style={styles.inputGroup}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" style={{ marginRight: 10 }}>
                            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <Circle cx="12" cy="7" r="4" />
                        </Svg>
                        <TextInput
                            style={styles.input}
                            placeholder="username"
                            placeholderTextColor="#A0AEC0"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Location Display Area */}
                <View style={styles.locationContainer}>
                    <View style={styles.locationHeader}>
                        <View style={styles.iconCircle}>
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2B6CB0" strokeWidth="2">
                                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                            </Svg>
                        </View>
                        <Text style={styles.locationTitle}>Business Coordinates</Text>
                    </View>

                    {coords ? (
                        <View style={styles.coordsBox}>
                            <Text style={styles.coordText}>Lat: {coords.lat.toFixed(6)}</Text>
                            <Text style={styles.coordText}>Lng: {coords.lng.toFixed(6)}</Text>
                        </View>
                    ) : (
                        <Text style={styles.noCoordsText}>No location selected</Text>
                    )}

                    <TouchableOpacity
                        style={styles.locateButton}
                        onPress={handleGetCurrentLocation}
                        disabled={locating}
                    >
                        <Text style={styles.locateButtonText}>
                            {locating ? "Locating..." : "Use Current Location"}
                        </Text>
                    </TouchableOpacity>

                    {coords && (
                        <TouchableOpacity style={styles.mapLinkButton} onPress={handleViewMap}>
                            <Text style={styles.mapLinkText}>View on Google Maps</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <AddressSelector
                     onAddressChange={(addr) => setAddress(addr)}
                />

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
    locationContainer: {
        backgroundColor: '#EBF8FF',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#BEE3F8'
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#BEE3F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    locationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C5282',
    },
    coordsBox: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 15,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        width: '100%',
        justifyContent: 'center',
    },
    coordText: {
        fontSize: 16,
        color: '#4A5568',
        fontWeight: '500',
    },
    noCoordsText: {
        color: '#718096',
        marginBottom: 15,
        fontStyle: 'italic',
    },
    locateButton: {
        backgroundColor: '#3182CE',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    locateButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    mapLinkButton: {
        marginTop: 15,
    },
    mapLinkText: {
        color: '#3182CE',
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
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
