import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import CustomAlert from '../../../components/CustomAlert';
import Svg, { Path } from 'react-native-svg';

const BusinessIndustryScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [industry, setIndustry] = useState('');
    const [category, setCategory] = useState('');
    const [customIndustry, setCustomIndustry] = useState('');
    const [customCategory, setCustomCategory] = useState('');

    // Modal & Selection State
    const [modalVisible, setModalVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState<'Industry' | 'Category' | null>(null);
    const [searchText, setSearchText] = useState('');

    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' | 'info', onConfirm: undefined as undefined | (() => void) });

    const INDUSTRIES = [
        { name: 'Technology', children: ['Software', 'Hardware', 'IT Services'] },
        { name: 'Healthcare', children: ['Hospital', 'Clinic', 'Pharmacy'] },
        { name: 'Retail', children: ['E-commerce', 'Store', 'Wholesale'] },
        { name: 'Education', children: ['School', 'University', 'Online Course'] },
        { name: 'Other', children: [] }
    ];

    const [loading, setLoading] = useState(false);

    const openSelection = (step: 'Industry' | 'Category') => {
        setCurrentStep(step);
        setSearchText('');
        setModalVisible(true);
    };

    const handleSelect = (item: any) => {
        setSearchText('');

        if (currentStep === 'Industry') {
            const industryName = item.name;
            setIndustry(industryName);
            setCategory(''); // Reset category on industry change
            setCustomIndustry('');
            setCustomCategory('');

            // Auto-transition logic (Always transition, even for Other)
            setCurrentStep('Category');
        } else if (currentStep === 'Category') {
            setCategory(item);
            setModalVisible(false); // Close on final selection
        }
    };

    const getListData = () => {
        let data: any[] = [];

        if (currentStep === 'Industry') {
            data = INDUSTRIES;
        } else if (currentStep === 'Category') {
            const selectedIndustryData = INDUSTRIES.find(i => i.name === industry);
            data = selectedIndustryData ? selectedIndustryData.children : [];
            // Add 'Other' only if not already present (though children array is usually strings)
            // But we want 'Other' as an option for category too
            if (!data.includes('Other')) data = [...data, 'Other'];
        }

        if (searchText) {
            const lower = searchText.toLowerCase();
            return data.filter(d => {
                const name = typeof d === 'string' ? d : d.name;
                return name.toLowerCase().includes(lower);
            });
        }
        return data;
    };

    const renderItem = ({ item }: any) => {
        const name = typeof item === 'string' ? item : item.name;
        return (
            <TouchableOpacity style={styles.modalItem} onPress={() => handleSelect(item)}>
                <Text style={styles.modalItemText}>{name}</Text>
            </TouchableOpacity>
        );
    };

    const handleNext = async () => {
        const finalIndustry = industry === 'Other' ? customIndustry : industry;
        let finalCategory = category;

        if (industry === 'Other' || category === 'Other') {
            finalCategory = customCategory;
        }

        if (!finalIndustry || !finalIndustry.trim()) {
            setAlertConfig({ visible: true, title: 'Missing Details', message: 'Please select or enter your Industry.', type: 'error', onConfirm: undefined });
            return;
        }

        if (!finalCategory || !finalCategory.trim()) {
            setAlertConfig({ visible: true, title: 'Missing Details', message: 'Please select or enter your Category.', type: 'error', onConfirm: undefined });
            return;
        }

        setLoading(true);
        try {
            await TunnelService.updateBusinessIndustry(userInfo.id, {
                industry: finalIndustry,
                category: finalCategory
            });
            navigation.navigate('BusinessTypeContact');
        } catch (error) {
            console.error(error);
            setAlertConfig({ visible: true, title: 'Error', message: 'Failed to save details', type: 'error', onConfirm: undefined });
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Business Profile - Industry" onBack={() => navigation.goBack()}>
            <View style={styles.container}>

                <TouchableOpacity style={styles.inputGroup} onPress={() => openSelection('Industry')}>
                    <Text style={[styles.input, !industry && styles.placeholderText]}>
                        {industry || "Select Parent Industry"}
                    </Text>
                    <View style={styles.inputIcon}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                            <Path d="M6 9l6 6 6-6" />
                        </Svg>
                    </View>
                </TouchableOpacity>

                {industry === 'Other' && (
                    <View style={[styles.inputGroup, { marginTop: 10 }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Custom Industry"
                            placeholderTextColor="#A0AEC0"
                            value={customIndustry}
                            onChangeText={setCustomIndustry}
                        />
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.inputGroup, { marginTop: 16, opacity: (!industry || industry === 'Other') ? 0.5 : 1 }]}
                    onPress={() => (industry && industry !== 'Other') && openSelection('Category')}
                    disabled={!industry || industry === 'Other'}
                >
                    <Text style={[styles.input, !category && styles.placeholderText]}>
                        {industry === 'Other' ? "Custom Category (Enter below)" : (category || "Select Child Industry")}
                    </Text>
                    <View style={styles.inputIcon}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                            <Path d="M6 9l6 6 6-6" />
                        </Svg>
                    </View>
                </TouchableOpacity>

                {(industry === 'Other' || category === 'Other') && (
                    <View style={[styles.inputGroup, { marginTop: 10 }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Custom Category"
                            placeholderTextColor="#A0AEC0"
                            value={customCategory}
                            onChangeText={setCustomCategory}
                        />
                    </View>
                )}

                {/* Unified Selection Modal */}
                <Modal visible={modalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select {currentStep}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2"><Path d="M18 6L6 18M6 6l12 12" /></Svg>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.searchInput}
                                placeholder={`Search ${currentStep}...`}
                                value={searchText}
                                onChangeText={setSearchText}
                                autoFocus={false}
                            />

                            <FlatList
                                data={getListData()}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={renderItem}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                style={{ maxHeight: 400 }}
                            />
                        </View>
                    </View>
                </Modal>

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
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 56,
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
    },
    placeholderText: {
        color: '#A0AEC0',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        position: 'relative',
        minHeight: 40,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        padding: 4,
    },
    searchInput: {
        backgroundColor: '#F7FAFC',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 15,
        color: '#2D3748',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalItemText: {
        fontSize: 16,
        color: '#4A5568',
        textAlign: 'center',
    },
    inputIcon: {
        marginLeft: 10,
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

export default BusinessIndustryScreen;
