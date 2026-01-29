import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Linking } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import AddressSelector from '../../../components/AddressSelector';
import CustomAlert from '../../../components/CustomAlert';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';

const PersonalLocationJobScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [location, setLocation] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' | 'info', onConfirm: undefined as undefined | (() => void) });

    const handleNext = async () => {
        setLoading(true);
        try {
            // Save details
            await TunnelService.updatePersonalDetails(userInfo.id, { address: location, jobTitle });

            // Complete Tunnel for Personal User (Skip Identity Gate)
            await TunnelService.completeTunnel(userInfo.id);

            // Navigate to Home
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });

        } catch (error) {
            console.error(error);
            setAlertConfig({ visible: true, title: 'Error', message: 'Failed to save details', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Personal Profile - Location & Job" onBack={() => navigation.goBack()}>
            <View style={styles.container}>

                {/* Location Section */}
                <View style={styles.section}>
                    <AddressSelector
                        onAddressChange={(addr) => setLocation(addr)}
                    />
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
                        <Text style={styles.nextButtonText}>{loading ? 'Finish' : 'Finish'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={alertConfig.onConfirm}
            />
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
