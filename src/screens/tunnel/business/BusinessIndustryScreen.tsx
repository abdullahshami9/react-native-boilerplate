import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, FlatList } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import Svg, { Path } from 'react-native-svg';

const BusinessIndustryScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [industry, setIndustry] = useState('');
    const [category, setCategory] = useState(''); // Child Industry
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        setLoading(true);
        try {
            await TunnelService.updateBusinessIndustry(userInfo.id, {
                industry: industry,
                category: category
            });
            navigation.navigate('PaymentIntegration');
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

                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder="Parent industry"
                        placeholderTextColor="#A0AEC0"
                        value={industry}
                        onChangeText={setIndustry}
                    />
                    <View style={styles.inputIcon}>
                         <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                            <Path d="M6 9l6 6 6-6" />
                        </Svg>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder="Child industry"
                        placeholderTextColor="#A0AEC0"
                        value={category}
                        onChangeText={setCategory}
                    />
                    <View style={styles.inputIcon}>
                         <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2">
                            <Path d="M6 9l6 6 6-6" />
                        </Svg>
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
