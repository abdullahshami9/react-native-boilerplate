import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import ChipInput from '../../../components/ChipInput';

const PersonalSkillsScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [skills, setSkills] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleAddChip = (chip: string) => {
        setSkills([...skills, chip]);
    };

    const handleRemoveChip = (chip: string) => {
        setSkills(skills.filter(s => s !== chip));
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            await TunnelService.updatePersonalSkills(userInfo.id, skills);
            navigation.navigate('PersonalEducation');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Personal Profile - Skills" onBack={() => navigation.goBack()}>
            <ScrollView style={styles.container} keyboardShouldPersistTaps="always">
                <Text style={styles.subtitle}>Multi-select</Text>

                <ChipInput
                    chips={skills}
                    onAddChip={handleAddChip}
                    onRemoveChip={handleRemoveChip}
                    placeholder="Add a skill (e.g. Design)"
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
            </ScrollView>
        </TunnelWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    subtitle: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 12,
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

export default PersonalSkillsScreen;
