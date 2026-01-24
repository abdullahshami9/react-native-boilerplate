import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import ChipInput from '../../../components/ChipInput';
import Svg, { Path, Circle } from 'react-native-svg';
import CustomAlert from '../../../components/CustomAlert';
import { useTheme } from '../../../theme/useTheme';

const PersonalDetailsScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' | 'info' });
    const theme = useTheme();

    const showAlert = (title: string, message: string, type: 'error' | 'success' | 'info' = 'error') => {
        setAlertConfig({ visible: true, title, message, type });
    };

    const predefinedInterests = ["Clothing", "Home Decor", "Fashion", "Watches", "Sports"];

    const handleAddInterest = (interest: string) => {
        if (!interests.includes(interest)) {
            setInterests([...interests, interest]);
        }
    };

    const handleRemoveInterest = (interest: string) => {
        setInterests(interests.filter(i => i !== interest));
    };

    const togglePredefined = (interest: string) => {
        if (interests.includes(interest)) {
            handleRemoveInterest(interest);
        } else {
            handleAddInterest(interest);
        }
    };

    const handleNext = async () => {
        if (!username.trim()) {
            showAlert("Required", "Please enter a username.");
            return;
        }
        setLoading(true);
        try {
            await TunnelService.updatePersonalAdditionalInfo(userInfo.id, { username, gender, interests });
            navigation.navigate('PersonalSkills');
        } catch (error: any) {
            console.error(error);
            showAlert("Error", error.message || "Failed to update details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Personal Details" onBack={() => navigation.goBack()}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Username */}
                <View style={styles.section}>
                    <Text style={styles.label}>Choose a Username</Text>
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

                {/* Gender */}
                <View style={styles.section}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.genderRow}>
                        {['Male', 'Female', 'Other'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                                onPress={() => setGender(g)}
                            >
                                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Interests */}
                <View style={styles.section}>
                    <Text style={styles.label}>Interests</Text>
                    <View style={styles.predefinedContainer}>
                        {predefinedInterests.map(i => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.chip, interests.includes(i) && styles.chipActive]}
                                onPress={() => togglePredefined(i)}
                            >
                                <Text style={[styles.chipText, interests.includes(i) && styles.chipTextActive]}>{i}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={[styles.label, { marginTop: 10, fontSize: 12 }]}>Add Others:</Text>
                    <ChipInput
                        chips={interests.filter(i => !predefinedInterests.includes(i))}
                        onAddChip={handleAddInterest}
                        onRemoveChip={handleRemoveInterest}
                        placeholder="Type and press add..."
                    />
                </View>

                <View style={styles.spacer} />

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    disabled={loading}
                >
                    <Text style={styles.nextButtonText}>{loading ? 'Saving...' : 'Next'}</Text>
                </TouchableOpacity>

            </ScrollView>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
        </TunnelWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
    },
    section: {
        marginBottom: 25,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 10,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 50,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 15,
    },
    genderBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    genderBtnActive: {
        backgroundColor: '#2D3748',
        borderColor: '#2D3748',
    },
    genderText: {
        color: '#4A5568',
        fontWeight: '600',
    },
    genderTextActive: {
        color: '#fff',
    },
    predefinedContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipActive: {
        backgroundColor: '#2D3748',
        borderColor: '#2D3748',
    },
    chipText: {
        color: '#4A5568',
        fontSize: 14,
    },
    chipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    spacer: {
        height: 30,
    },
    nextButton: {
        paddingVertical: 16,
        borderRadius: 30,
        backgroundColor: '#2D3748',
        alignItems: 'center',
    },
    nextButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default PersonalDetailsScreen;
