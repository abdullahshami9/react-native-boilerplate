import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';

const PersonalLocationJobScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [location, setLocation] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        setLoading(true);
        try {
            // Save details
            await TunnelService.updatePersonalDetails(userInfo.id, { address: location, jobTitle });
            navigation.navigate('IdentityGate');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save details');
        } finally {
            setLoading(false);
        }
    };

    const openExternalMap = () => {
        const query = location ? encodeURIComponent(location) : '';
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <TunnelWrapper title="Personal Profile - Location & Job" onBack={() => navigation.goBack()}>
            <View style={styles.container}>

                {/* Location Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Location</Text>
                    <View style={styles.inputGroup}>
                        <View style={styles.iconContainer}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <SvgCircle cx="12" cy="10" r="3" />
                            </Svg>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your address (e.g. New York, NY)"
                            placeholderTextColor="#A0AEC0"
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                    <TouchableOpacity onPress={openExternalMap} style={styles.linkButton}>
                        <Text style={styles.linkText}>Find on Google Maps</Text>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3182CE" strokeWidth="2">
                            <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <Path d="M15 3h6v6" />
                            <Path d="M10 14L21 3" />
                        </Svg>
                    </TouchableOpacity>
                </View>

                {/* Job Title Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>Job Title</Text>
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.input}
                            placeholder="Current Job Title"
                            placeholderTextColor="#A0AEC0"
                            value={jobTitle}
                            onChangeText={setJobTitle}
                        />
                    </View>
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
        paddingTop: 10,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4A5568',
        marginBottom: 8,
        marginLeft: 4,
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
    iconContainer: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginLeft: 4,
        gap: 6,
    },
    linkText: {
        color: '#3182CE',
        fontSize: 14,
        fontWeight: '500',
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
