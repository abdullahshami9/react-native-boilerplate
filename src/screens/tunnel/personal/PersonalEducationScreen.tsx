import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { TunnelService } from '../../../services/TunnelService';
import TunnelWrapper from '../../../components/TunnelWrapper';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import Svg, { Path } from 'react-native-svg';

const PersonalEducationScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [degree, setDegree] = useState('');
    const [institution, setInstitution] = useState('');
    const [year, setYear] = useState('');
    const [resumeFile, setResumeFile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleUploadResume = async () => {
        try {
            const result = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.images],
            });
            setResumeFile(result);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
            } else {
                throw err;
            }
        }
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            // 1. Save Education
            if (degree && institution) {
                await TunnelService.updatePersonalEducation(userInfo.id, { degree, institution, year });
            }

            // 2. Upload Resume if selected
            if (resumeFile) {
                await TunnelService.uploadResume(resumeFile, userInfo.id);
            }

            navigation.navigate('PersonalLocationJob');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Personal Profile - Education" onBack={() => navigation.goBack()}>
            <View style={styles.container}>
                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder="Degree"
                        placeholderTextColor="#A0AEC0"
                        value={degree}
                        onChangeText={setDegree}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder="University/Institution"
                        placeholderTextColor="#A0AEC0"
                        value={institution}
                        onChangeText={setInstitution}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder="Year"
                        placeholderTextColor="#A0AEC0"
                        keyboardType="numeric"
                        value={year}
                        onChangeText={setYear}
                    />
                </View>

                <TouchableOpacity style={styles.uploadButton} onPress={handleUploadResume}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <Path d="M17 8l-5-5-5 5" />
                        <Path d="M12 3v12" />
                    </Svg>
                    <Text style={styles.uploadButtonText}>
                        {resumeFile ? resumeFile.name : 'Upload Resume'}
                    </Text>
                </TouchableOpacity>

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
        backgroundColor: '#F7FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 56,
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
        color: '#2D3748',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4A5568',
        borderRadius: 30,
        height: 56,
        gap: 10,
        marginTop: 10,
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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

export default PersonalEducationScreen;
