import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, FlatList } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import CustomAlert from '../../../components/CustomAlert';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';
import AddressSelector from '../../../components/AddressSelector';

const BusinessTypeContactScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [bizType, setBizType] = useState<'Service Based' | 'Product Based'>('Service Based');

    // Service Fields
    const [experience, setExperience] = useState('');
    const [serviceCategory, setServiceCategory] = useState('');

    // Product Fields
    const [warehouseCapacity, setWarehouseCapacity] = useState('');
    const [deliveryRange, setDeliveryRange] = useState('');

    // Nationwide / Address Logic
    const [isNationwide, setIsNationwide] = useState(true);
    const [operationalAreas, setOperationalAreas] = useState<any[]>([]); // List of added areas
    const [showAddressSelector, setShowAddressSelector] = useState(false);

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

            // Validate Operational Areas
            if (!isNationwide && operationalAreas.length === 0) {
                setAlertConfig({ visible: true, title: 'Missing Info', message: 'Please add at least one operational area or select Nationwide.', type: 'error' });
                setLoading(false);
                return;
            }

            // Construct Operational Info string
            const areaInfo = isNationwide ? "Nationwide" : operationalAreas.map(a => a.address).join('; ');
            description += ` Operational Areas: ${areaInfo}`;

            await TunnelService.updateBusinessType(userInfo.id, {
                business_type: bizType,
                description: description,
            });
            navigation.navigate('BusinessIndustry');
        } catch (error) {
            console.error(error);
            setAlertConfig({ visible: true, title: 'Error', message: 'Failed to save details', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = (address: string, details: any) => {
        // Simple check to avoid duplicates
        if (!operationalAreas.find(a => a.address === address)) {
            setOperationalAreas([...operationalAreas, { address, details }]);
        }
        setShowAddressSelector(false);
    };

    const removeArea = (index: number) => {
        const newAreas = [...operationalAreas];
        newAreas.splice(index, 1);
        setOperationalAreas(newAreas);
    };

    // Numeric input handler
    const handleNumericChange = (text: string, setter: (val: string) => void) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setter(numericValue);
    };

    return (
        <TunnelWrapper title="Business Profile - Type & Details" onBack={() => navigation.goBack()}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Type Selection Tiles */}
                <View style={styles.tilesContainer}>
                    <TouchableOpacity
                        style={[styles.tile, bizType === 'Service Based' && styles.tileActive]}
                        onPress={() => setBizType('Service Based')}
                    >
                        <View style={[styles.tileIcon, bizType === 'Service Based' && styles.tileIconActive]}>
                            {/* Tools / Service Icon */}
                            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={bizType === 'Service Based' ? "#3182CE" : "#A0AEC0"} strokeWidth="2">
                                <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </Svg>
                        </View>
                        <Text style={[styles.tileText, bizType === 'Service Based' && styles.tileTextActive]}>Service Based</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tile, bizType === 'Product Based' && styles.tileActive]}
                        onPress={() => setBizType('Product Based')}
                    >
                        <View style={[styles.tileIcon, bizType === 'Product Based' && styles.tileIconActive]}>
                            {/* Box / Product Icon */}
                            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={bizType === 'Product Based' ? "#3182CE" : "#A0AEC0"} strokeWidth="2">
                                <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></Path>
                                <Polyline points="3.27 6.96 12 12.01 20.73 6.96"></Polyline>
                                <Line x1="12" y1="22.08" x2="12" y2="12"></Line>
                            </Svg>
                        </View>
                        <Text style={[styles.tileText, bizType === 'Product Based' && styles.tileTextActive]}>Product Based</Text>
                    </TouchableOpacity>
                </View>

                {/* Dynamic Details Fields */}
                <View style={styles.sectionContainer}>
                    {bizType === 'Service Based' ? (
                        <>
                            <Text style={styles.sectionTitle}>Service Details</Text>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Years of Experience"
                                    placeholderTextColor="#A0AEC0"
                                    value={experience}
                                    onChangeText={(t) => handleNumericChange(t, setExperience)}
                                    keyboardType="numeric"
                                />
                                <Text style={styles.inputSuffix}>Years</Text>
                            </View>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Specialization ID (Numeric)"
                                    placeholderTextColor="#A0AEC0"
                                    value={serviceCategory}
                                    onChangeText={(t) => handleNumericChange(t, setServiceCategory)} // Strict numeric as requested
                                    keyboardType="numeric"
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.sectionTitle}>Product Operations</Text>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Warehouse Capacity"
                                    placeholderTextColor="#A0AEC0"
                                    value={warehouseCapacity}
                                    onChangeText={(t) => handleNumericChange(t, setWarehouseCapacity)}
                                    keyboardType="numeric"
                                />
                                <Text style={styles.inputSuffix}>Units</Text>
                            </View>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Delivery Range ID (Numeric)"
                                    placeholderTextColor="#A0AEC0"
                                    value={deliveryRange}
                                    onChangeText={(t) => handleNumericChange(t, setDeliveryRange)} // Strict numeric as requested
                                    keyboardType="numeric"
                                />
                            </View>
                        </>
                    )}
                </View>

                {/* Operations Area Logic */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Operational Areas</Text>

                    <TouchableOpacity style={styles.nationwideToggle} onPress={() => setIsNationwide(!isNationwide)}>
                        <View style={[styles.checkbox, isNationwide && styles.checkboxActive]}>
                            {isNationwide && <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><Polyline points="20 6 9 17 4 12" /></Svg>}
                        </View>
                        <Text style={styles.toggleText}>Nationwide (All Pakistan)</Text>
                    </TouchableOpacity>

                    {!isNationwide && (
                        <View style={styles.areasContainer}>
                            {operationalAreas.map((area, index) => (
                                <View key={index} style={styles.areaChip}>
                                    <Text style={styles.areaText} numberOfLines={1}>{area.address}</Text>
                                    <TouchableOpacity onPress={() => removeArea(index)} hitSlop={10}>
                                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2"><Line x1="18" y1="6" x2="6" y2="18"></Line><Line x1="6" y1="6" x2="18" y2="18"></Line></Svg>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity style={styles.addAreaButton} onPress={() => setShowAddressSelector(true)}>
                                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3182CE" strokeWidth="2"><Line x1="12" y1="5" x2="12" y2="19"></Line><Line x1="5" y1="12" x2="19" y2="12"></Line></Svg>
                                <Text style={styles.addAreaText}>Add Another Area</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Embedded Address Selector (Conditional) */}
                {showAddressSelector && !isNationwide && (
                    <View style={styles.addressSelectorContainer}>
                        <View style={styles.addressHeader}>
                            <Text style={styles.addressTitle}>Select New Area</Text>
                            <TouchableOpacity onPress={() => setShowAddressSelector(false)}>
                                <Text style={{ color: '#E53E3E', fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                        <AddressSelector
                            onAddressChange={handleAddAddress}
                        />
                    </View>
                )}


                <View style={styles.spacer} />

                {!showAddressSelector && (
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
                )}

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
        gap: 20,
        paddingBottom: 40,
    },
    tilesContainer: {
        flexDirection: 'row',
        gap: 15,
    },
    tile: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        gap: 12,
    },
    tileActive: {
        borderColor: '#3182CE',
        backgroundColor: '#EBF8FF',
    },
    tileIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F7FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tileIconActive: {
        backgroundColor: '#BEE3F8',
    },
    tileText: {
        fontWeight: '600',
        color: '#A0AEC0',
        fontSize: 14,
    },
    tileTextActive: {
        color: '#2C5282',
        fontWeight: 'bold',
    },
    sectionContainer: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D3748',
        marginLeft: 4,
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
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
    },
    inputSuffix: {
        color: '#A0AEC0',
        fontWeight: '500',
        fontSize: 14,
        marginLeft: 10,
    },
    nationwideToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#A0AEC0',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: '#3182CE',
        borderColor: '#3182CE',
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2D3748',
    },
    areasContainer: {
        gap: 10,
        marginTop: 5,
    },
    areaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F7FAFC',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    areaText: {
        color: '#4A5568',
        fontWeight: '500',
        flex: 1,
        marginRight: 10,
    },
    addAreaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3182CE',
        borderStyle: 'dashed',
        backgroundColor: '#EBF8FF',
    },
    addAreaText: {
        color: '#3182CE',
        fontWeight: '600',
        marginLeft: 8,
    },
    addressSelectorContainer: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        padding: 16,
        backgroundColor: '#F7FAFC',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    addressTitle: {
        fontWeight: '700',
        color: '#2D3748',
    },
    spacer: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
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
