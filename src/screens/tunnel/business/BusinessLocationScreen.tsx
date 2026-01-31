import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import AddressSelector from '../../../components/AddressSelector';
import Svg, { Path, Circle } from 'react-native-svg';
import Geolocation from 'react-native-geolocation-service';
import CustomAlert from '../../../components/CustomAlert';
import { useTheme } from '../../../theme/useTheme';

const BusinessLocationScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [address, setAddress] = useState('');
    const [addressDetails, setAddressDetails] = useState<any>({});
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' | 'info' });
    const theme = useTheme();

    const showAlert = (title: string, message: string, type: 'error' | 'success' | 'info' = 'error') => {
        setAlertConfig({ visible: true, title, message, type });
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            const auth = await Geolocation.requestAuthorization("whenInUse");
            if (auth === "granted") return true;
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
            showAlert('Permission Denied', 'Location permission is required.');
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
                showAlert('Error', 'Failed to get location: ' + error.message);
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
            showAlert("Missing Address", "Please select a business address.");
            return;
        }
        if (!username.trim()) {
            showAlert("Missing Username", "Please enter a username.");
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
            navigation.navigate('BusinessIndustry', { address: address });
        } catch (error: any) {
            console.error(error);
            showAlert('Error', error.message || 'Failed to save details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Business Headquarters" onBack={() => navigation.goBack()}>
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

                {/* Location Display Area - Premium Redesign */}
                <View style={styles.locationCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2.5">
                                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <Circle cx="12" cy="10" r="3" />
                            </Svg>
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Business Coordinates</Text>
                            <Text style={styles.cardSubtitle}>Precise Geolocation</Text>
                        </View>
                    </View>

                    {coords ? (
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>LATITUDE</Text>
                                <Text style={styles.statValue}>{coords.lat.toFixed(6)}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>LONGITUDE</Text>
                                <Text style={styles.statValue}>{coords.lng.toFixed(6)}</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.noCoordsText}>Location not set</Text>
                        </View>
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
                    onAddressChange={(addr, details) => {
                        setAddress(addr);
                        setAddressDetails(details);
                    }}
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
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
        </TunnelWrapper >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 16,
    },
    locationCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        marginBottom: 10,
        // Premium Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F7FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#718096',
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F7FAFC',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#A0AEC0',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D3748',
        fontVariant: ['tabular-nums'],
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E2E8F0',
    },
    emptyStateContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 16,
        marginBottom: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#CBD5E0',
    },
    noCoordsText: {
        color: '#718096',
        fontStyle: 'italic',
        fontSize: 14,
    },
    locateButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#CBD5E0',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 50,
        alignSelf: 'center',
        minWidth: '60%',
        alignItems: 'center',
    },
    locateButtonText: {
        color: '#718096',
        fontWeight: '600',
        fontSize: 14,
    },
    mapLinkButton: {
        marginTop: 16,
        alignSelf: 'center',
    },
    mapLinkText: {
        color: '#4A5568',
        textDecorationLine: 'underline',
        fontWeight: '500',
        fontSize: 13,
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
