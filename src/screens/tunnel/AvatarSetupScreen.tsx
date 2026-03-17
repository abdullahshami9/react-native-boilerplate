import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { AuthContext } from '../../context/AuthContext';
import TunnelWrapper from '../../components/TunnelWrapper';
import Svg, { Circle } from 'react-native-svg';
import { CONFIG } from '../../Config';
import axios from 'axios';
import { useTheme } from '../../theme/useTheme';
import { Dropdown } from 'react-native-element-dropdown';

const AvatarSetupScreen = ({ navigation }: any) => {
    const { userInfo, userToken } = useContext(AuthContext);
    const theme = useTheme();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0); // 0: Start, 1: Camera Scan, 2: Body Details Form

    // Camera states
    const device = useCameraDevice('front');
    const { hasPermission, requestPermission } = useCameraPermission();
    const camera = useRef<Camera>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStep, setRecordingStep] = useState(0);

    // Form states
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [skinTone, setSkinTone] = useState('#FAD6B1');
    const [bodySize, setBodySize] = useState('M');

    const INSTRUCTIONS = [
        "Position your face in the circle.",
        "Turn your head slowly to the LEFT...",
        "Turn your head slowly to the RIGHT...",
        "Look slightly UP and DOWN...",
        "Processing Face Scan..."
    ];

    const bodySizeOptions = [
        { label: 'Small (S)', value: 'S' },
        { label: 'Medium (M)', value: 'M' },
        { label: 'Large (L)', value: 'L' },
        { label: 'Extra Large (XL)', value: 'XL' },
    ];

    const skinTones = [
        '#FFDFC4', '#F0D5BE', '#EECEB3', '#E1B899', '#E5C298',
        '#FFDCB2', '#E5B887', '#E5A073', '#D6A171', '#C67856',
        '#A5725D', '#9A7156', '#87513C', '#684534', '#462E25'
    ];

    useEffect(() => {
        if (step === 1 && Platform.OS !== 'web') {
            requestPermission();
        }
    }, [step, requestPermission]);

    const startScan = async () => {
        if (!camera.current) return;

        try {
            setIsRecording(true);
            setRecordingStep(1);

            if (Platform.OS !== 'web') {
                camera.current.startRecording({
                    onRecordingFinished: (video) => {
                        console.log("Video captured:", video.path);
                        setIsRecording(false);
                        setStep(2); // Move to form
                    },
                    onRecordingError: (error) => {
                        console.error(error);
                        setIsRecording(false);
                        setStep(2); // Move to form even on error for testing/MVP
                    }
                });
            }

            setTimeout(() => setRecordingStep(2), 2000);
            setTimeout(() => setRecordingStep(3), 4000);
            setTimeout(() => {
                setRecordingStep(4);
                if (Platform.OS !== 'web') {
                    camera.current?.stopRecording();
                } else {
                    setIsRecording(false);
                    setStep(2);
                }
            }, 6000);

        } catch (e) {
            console.error(e);
            setStep(2);
        }
    };

    const submitAvatarSetup = async () => {
        if (!height || !weight) {
            Alert.alert("Error", "Please fill in all details.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/tunnel/avatar-setup`, {
                user_id: userInfo.id,
                height: parseFloat(height),
                weight: parseFloat(weight),
                skin_tone: skinTone,
                body_size: bodySize,
                // Passing a demo standard male/female or neutral avatar based on Doppl inspiration
                avatar_url: "https://models.readyplayer.me/64b73b5b699276c1a8264e03.glb"
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.data.success) {
                // Determine next step based on profile type
                if (userInfo.user_type === 'Individual') {
                    navigation.navigate('PersonalDetails');
                } else if (userInfo.user_type === 'Business') {
                    navigation.navigate('BusinessLocation');
                } else {
                    navigation.navigate('IdentityGate');
                }
            } else {
                Alert.alert("Error", "Failed to save avatar data.");
            }
        } catch (error) {
            console.error("Avatar Setup Error:", error);
            Alert.alert("Error", "Could not complete avatar setup.");
        } finally {
            setLoading(false);
        }
    };

    const renderStart = () => (
        <View style={styles.centerContainer}>
            <View style={[styles.iconCircle, { backgroundColor: theme.inputBg }]}>
                <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="8" r="4" stroke={theme.primary} strokeWidth="2" />
                    <Svg.Path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" />
                </Svg>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Let's create your 3D Avatar</Text>
            <Text style={[styles.subtitle, { color: theme.subText }]}>
                To give you the best virtual try-on experience, we need to create a 3D model that matches your body profile.
            </Text>

            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={() => setStep(1)}>
                <Text style={styles.primaryButtonText}>Start Face Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={() => setStep(2)}>
                <Text style={[styles.skipButtonText, { color: theme.subText }]}>Skip Face Scan</Text>
            </TouchableOpacity>
        </View>
    );

    const renderCameraScan = () => {
        if (Platform.OS === 'web') {
            return (
                <View style={styles.centerContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>Web Camera Simulation</Text>
                    <Text style={[styles.subtitle, { color: theme.subText }]}>Camera not supported on Web Demo. Proceeding to body details.</Text>
                    <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 20 }]} onPress={() => setStep(2)}>
                        <Text style={styles.primaryButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (!hasPermission || !device) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={{ marginTop: 10, color: theme.text }}>Requesting Camera Access...</Text>
                </View>
            );
        }

        return (
            <View style={styles.cameraContainer}>
                <Camera
                    ref={camera}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    video={true}
                    audio={false}
                />
                <View style={styles.cameraOverlay}>
                    <Svg height="300" width="300" viewBox="0 0 100 100">
                        <Circle cx="50" cy="50" r="40" stroke={isRecording ? "#48BB78" : "white"} strokeWidth="2" fill="none" />
                    </Svg>
                </View>

                {isRecording && (
                    <View style={styles.instructionBox}>
                        <Text style={styles.instructionText}>
                            {INSTRUCTIONS[recordingStep]}
                        </Text>
                    </View>
                )}

                {!isRecording && (
                    <View style={styles.cameraFooter}>
                        <Text style={styles.hintText}>Position your face and tap to start</Text>
                        <TouchableOpacity style={styles.recordButton} onPress={startScan}>
                            <View style={styles.recordInner} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const renderBodyDetails = () => (
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Body Profile</Text>
            <Text style={[styles.formSubtitle, { color: theme.subText }]}>
                Provide your measurements for accurate clothing fitment.
            </Text>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Height (cm)</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                    placeholder="e.g. 175"
                    placeholderTextColor={theme.subText}
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Weight (kg)</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                    placeholder="e.g. 70"
                    placeholderTextColor={theme.subText}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>General Size</Text>
                <Dropdown
                    style={[styles.dropdown, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                    placeholderStyle={[styles.dropdownText, { color: theme.subText }]}
                    selectedTextStyle={[styles.dropdownText, { color: theme.text }]}
                    data={bodySizeOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Size"
                    value={bodySize}
                    onChange={item => setBodySize(item.value)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Skin Tone</Text>
                <View style={styles.colorPalette}>
                    {skinTones.map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorCircle,
                                { backgroundColor: color },
                                skinTone === color && styles.colorCircleSelected
                            ]}
                            onPress={() => setSkinTone(color)}
                        />
                    ))}
                </View>
            </View>

            <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 30 }]}
                onPress={submitAvatarSetup}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Generate Avatar & Continue</Text>}
            </TouchableOpacity>
        </ScrollView>
    );

    return (
        <TunnelWrapper title="Virtual Try-On Setup" onBack={() => {
            if (step > 0) setStep(step - 1);
            else navigation.goBack();
        }}>
            <View style={styles.container}>
                {step === 0 && renderStart()}
                {step === 1 && renderCameraScan()}
                {step === 2 && renderBodyDetails()}
            </View>
        </TunnelWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    primaryButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    skipButton: {
        marginTop: 20,
        padding: 10,
    },
    skipButtonText: {
        fontSize: 15,
        fontWeight: '500',
    },

    // Camera Styles
    cameraContainer: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'black',
        margin: 10,
    },
    cameraOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    instructionBox: {
        position: 'absolute',
        top: 40,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    instructionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cameraFooter: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    hintText: {
        color: 'white',
        marginBottom: 15,
        fontSize: 14,
        fontWeight: '500',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 4,
    },
    recordButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E53E3E',
    },

    // Form Styles
    formContainer: {
        padding: 24,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 15,
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    dropdown: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    dropdownText: {
        fontSize: 16,
    },
    colorPalette: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    colorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    colorCircleSelected: {
        borderWidth: 3,
        borderColor: '#3182CE',
        transform: [{ scale: 1.1 }],
    }
});

export default AvatarSetupScreen;