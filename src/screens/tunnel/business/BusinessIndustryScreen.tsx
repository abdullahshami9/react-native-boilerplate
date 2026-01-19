import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, FlatList } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import Svg, { Path } from 'react-native-svg';

const BusinessIndustryScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [industry, setIndustry] = useState('');
    const [category, setCategory] = useState('');
    const [customIndustry, setCustomIndustry] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [showIndustryModal, setShowIndustryModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const INDUSTRIES = [
        { name: 'Technology', children: ['Software', 'Hardware', 'IT Services'] },
        { name: 'Healthcare', children: ['Hospital', 'Clinic', 'Pharmacy'] },
        { name: 'Retail', children: ['E-commerce', 'Store', 'Wholesale'] },
        { name: 'Education', children: ['School', 'University', 'Online Course'] },
        { name: 'Other', children: [] }
    ];

    const selectedIndustryData = INDUSTRIES.find(i => i.name === industry);
    const categories = selectedIndustryData ? selectedIndustryData.children : [];
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        const finalIndustry = industry === 'Other' ? customIndustry : industry;
        let finalCategory = category;

        if (industry === 'Other' || category === 'Other') {
            finalCategory = customCategory;
        }

        if (!finalIndustry || !finalIndustry.trim()) {
            Alert.alert('Missing Details', 'Please select or enter your Industry.');
            return;
        }

        if (!finalCategory || !finalCategory.trim()) {
            Alert.alert('Missing Details', 'Please select or enter your Category.');
            return;
        }

        setLoading(true);
        try {
            await TunnelService.updateBusinessIndustry(userInfo.id, {
                industry: finalIndustry,
                category: finalCategory
            });
            navigation.navigate('IdentityGate');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Business Profile - Industry" onBack={() => navigation.goBack()}>
            <View style={styles.container}>

                <TouchableOpacity style={styles.inputGroup} onPress={() => setShowIndustryModal(true)}>
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
                    style={[styles.inputGroup, { marginTop: 16, opacity: !industry ? 0.5 : 1 }]}
                    onPress={() => industry && setShowCategoryModal(true)}
                    disabled={!industry}
                >
                    <Text style={[styles.input, !category && styles.placeholderText]}>
                        {industry === 'Other' ? "Enter Custom Category below" : (category || "Select Child Industry")}
                    </Text>
                    <View style={styles.inputIcon}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                            <Path d="M6 9l6 6 6-6" />
                        </Svg>
                    </View>
                </TouchableOpacity>

                {(industry === 'Other' || (industry && category === 'Other')) && (
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

                {/* Industry Modal */}
                <Modal visible={showIndustryModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Industry</Text>
                            <FlatList
                                data={INDUSTRIES}
                                keyExtractor={(item) => item.name}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setIndustry(item.name);
                                            setCategory('');
                                            setCustomIndustry('');
                                            setCustomCategory('');
                                            setShowIndustryModal(false);
                                        }}
                                    >
                                        <Text style={styles.modalItemText}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowIndustryModal(false)}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Category Modal */}
                <Modal visible={showCategoryModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Category</Text>
                            <FlatList
                                data={industry === 'Other' ? ['Other'] : [...categories, 'Other']}
                                keyExtractor={(item, index) => item + index}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setCategory(item);
                                            setShowCategoryModal(false);
                                        }}
                                    >
                                        <Text style={styles.modalItemText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowCategoryModal(false)}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '50%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2D3748',
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalItemText: {
        fontSize: 16,
        color: '#4A5568',
    },
    closeButton: {
        marginTop: 15,
        alignItems: 'center',
        padding: 10,
    },
    closeButtonText: {
        color: '#E53E3E',
        fontSize: 16,
        fontWeight: '600',
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
