import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import CustomAlert from '../../../components/CustomAlert';
import Svg, { Path, Circle } from 'react-native-svg';

const BusinessTypeContactScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [bizType, setBizType] = useState<'Service Based' | 'Product Based'>('Service Based');
    const [altPhone, setAltPhone] = useState('');
    const [bizEmail, setBizEmail] = useState('');
    const [phone, setPhone] = useState(''); // Default to user phone maybe?
    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' | 'info', onConfirm: undefined as undefined | (() => void) });

    const handleNext = async () => {
        setLoading(true);
        try {
            await TunnelService.updateBusinessType(userInfo.id, {
                business_type: bizType,
                description: `Alt Phone: ${altPhone}`, // Storing alt phone in description for now
                phone: phone,
                email: bizEmail
            });
            navigation.navigate('BusinessIndustry');
        } catch (error) {
            console.error(error);
            setAlertConfig({ visible: true, title: 'Error', message: 'Failed to save details', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Business Profile - Type & Contact" onBack={() => navigation.goBack()}>
            <View style={styles.container}>

                {/* Radio Buttons */}
                <View style={styles.radioGroup}>
                    <TouchableOpacity style={styles.radioButton} onPress={() => setBizType('Service Based')}>
                        <View style={[styles.radioOuter, bizType === 'Service Based' && styles.radioActive]}>
                            {bizType === 'Service Based' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioText}>Service Based</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.radioButton} onPress={() => setBizType('Product Based')}>
                        <View style={[styles.radioOuter, bizType === 'Product Based' && styles.radioActive]}>
                            {bizType === 'Product Based' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.radioText}>Product Based</Text>
                    </TouchableOpacity>
                </View>

                {/* Inputs */}
                <View style={styles.inputGroup}>
                    <View style={styles.inputIcon}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                            <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </Svg>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Alternative Number"
                        placeholderTextColor="#A0AEC0"
                        value={altPhone}
                        onChangeText={setAltPhone}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.inputIcon}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                            <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <Path d="M22 6l-10 7L2 6" />
                        </Svg>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Business Email"
                        placeholderTextColor="#A0AEC0"
                        value={bizEmail}
                        onChangeText={setBizEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.inputIcon}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                            <Path d="M12 18h.01" />
                            <Path d="M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
                        </Svg>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Phone no"
                        placeholderTextColor="#A0AEC0"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
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
        gap: 16,
    },
    radioGroup: {
        flexDirection: 'column',
        gap: 12,
        marginBottom: 10,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#A0AEC0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioActive: {
        borderColor: '#2D3748',
    },
    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#2D3748',
    },
    radioText: {
        fontSize: 16,
        color: '#4A5568',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 20,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
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

export default BusinessTypeContactScreen;
