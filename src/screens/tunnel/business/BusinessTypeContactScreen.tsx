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

    // Service Fields
    const [experience, setExperience] = useState('');
    const [serviceCategory, setServiceCategory] = useState('');

    // Product Fields
    const [warehouseCapacity, setWarehouseCapacity] = useState('');
    const [deliveryRange, setDeliveryRange] = useState('');

    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' | 'info', onConfirm: undefined as undefined | (() => void) });

    const handleNext = async () => {
        setLoading(true);
        try {
            let description = '';
            if (bizType === 'Service Based') {
                if (!experience || !serviceCategory) {
                    setAlertConfig({ visible: true, title: 'Missing Info', message: 'Please fill all service details.', type: 'error' });
                    setLoading(false);
                    return;
                }
                description = `Experience: ${experience} years. Specialization: ${serviceCategory}.`;
            } else {
                 if (!warehouseCapacity || !deliveryRange) {
                    setAlertConfig({ visible: true, title: 'Missing Info', message: 'Please fill all product details.', type: 'error' });
                    setLoading(false);
                    return;
                }
                description = `Warehouse: ${warehouseCapacity}. Delivery: ${deliveryRange}.`;
            }

            await TunnelService.updateBusinessType(userInfo.id, {
                business_type: bizType,
                description: description,
                // Removed redundant phone/email as per request
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
        <TunnelWrapper title="Business Profile - Type & Details" onBack={() => navigation.goBack()}>
            <ScrollView contentContainerStyle={styles.container}>

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

                {/* Conditional Fields */}
                <View style={styles.dynamicFields}>
                    {bizType === 'Service Based' ? (
                        <>
                            <Text style={styles.sectionLabel}>Service Details</Text>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Years of Experience (e.g. 5)"
                                    placeholderTextColor="#A0AEC0"
                                    value={experience}
                                    onChangeText={setExperience}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Specialization (e.g. Residential, Industrial)"
                                    placeholderTextColor="#A0AEC0"
                                    value={serviceCategory}
                                    onChangeText={setServiceCategory}
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.sectionLabel}>Product Operations</Text>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Warehouse Capacity (e.g. 1000 units)"
                                    placeholderTextColor="#A0AEC0"
                                    value={warehouseCapacity}
                                    onChangeText={setWarehouseCapacity}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Delivery Range (e.g. Nationwide, Local)"
                                    placeholderTextColor="#A0AEC0"
                                    value={deliveryRange}
                                    onChangeText={setDeliveryRange}
                                />
                            </View>
                        </>
                    )}
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
            </ScrollView>
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
        flexGrow: 1,
        gap: 16,
        paddingBottom: 20,
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
    dynamicFields: {
        gap: 15,
        marginTop: 10,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 5,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 20,
        height: 56,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#2D3748',
    },
    spacer: {
        flex: 1,
        minHeight: 20,
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
