import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { AuthContext } from '../../context/AuthContext';
import TunnelWrapper from '../../components/TunnelWrapper';
import CustomAlert from '../../components/CustomAlert';
import Svg, { Circle } from 'react-native-svg';
import { CONFIG } from '../../Config';

const IdentityGateScreen = ({ navigation }: any) => {
    const { userInfo, userToken } = useContext(AuthContext);
    const device = useCameraDevice('front');
    const { hasPermission, requestPermission } = useCameraPermission();

    const camera = useRef<Camera>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStep, setRecordingStep] = useState(0); // 0: Ready, 1: Left, 2: Right, 3: Up/Down, 4: Done
    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' | 'info', onConfirm: undefined as undefined | (() => void) });

    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    const INSTRUCTIONS = [
        "Position your face in the circle.",
        "Turn your head slowly to the LEFT...",
        "Turn your head slowly to the RIGHT...",
        "Look slightly UP and DOWN...",
        "Processing..."
    ];

    const startScan = async () => {
        if (!camera.current) return;

        try {
            setIsRecording(true);
            setRecordingStep(1); // Start instructions

            // Simulate guided capture flow with timers (Production would use MLKit face detection for angles)
            // But requirement is "Guided 360 face capture UI"

            camera.current.startRecording({
                onRecordingFinished: (video) => {
                    console.log("Video captured:", video.path);
                    setIsRecording(false);
                    uploadScan(video.path);
                },
                onRecordingError: (error) => {
                    console.error(error);
                    Alert.alert("Error", "Recording failed.");
                    setIsRecording(false);
                }
            });

            // Guide the user through steps
            setTimeout(() => setRecordingStep(2), 2000); // Right
            setTimeout(() => setRecordingStep(3), 4000); // Up/Down
            setTimeout(() => {
                setRecordingStep(4);
                camera.current?.stopRecording();
            }, 6000); // Finish

        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not start camera.");
        }
    };

    const uploadScan = async (path: string) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('userId', userInfo.id.toString());
        formData.append('scan', {
            uri: 'file://' + path,
            type: 'video/mp4',
            name: `face_scan_${userInfo.id}.mp4`
        });

        try {
            // Using fetch directly because axios setup might vary in headers
            const response = await fetch(`${CONFIG.API_URL}/api/identity/scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${userToken}` // Assuming token is available
                },
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                setAlertConfig({
                    visible: true,
                    title: "Success",
                    message: "Identity verified securely.",
                    type: 'success',
                    onConfirm: () => navigation.navigate('PaymentIntegration')
                });
            } else {
                setAlertConfig({ visible: true, title: "Failed", message: "Verification failed. Please try again.", type: 'error', onConfirm: undefined });
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!hasPermission) {
        return (
            <View style={styles.center}>
                <Text>Camera permission is required for Identity Verification.</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.btn}><Text style={styles.btnText}>Grant Permission</Text></TouchableOpacity>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={styles.center}>
                <Text>No Camera Device Found</Text>
            </View>
        );
    }

    return (
        <TunnelWrapper title="Identity Verification" onBack={() => navigation.goBack()}>
            <View style={styles.container}>
                <Text style={styles.subtitle}>
                    Before connecting financial accounts, we need to verify your identity with a secure face scan.
                </Text>

                <View style={styles.cameraContainer}>
                    <Camera
                        ref={camera}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={true}
                        video={true}
                        audio={false}
                    />

                    {/* Overlay */}
                    <View style={styles.overlay}>
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
                </View>

                <View style={styles.footer}>
                    {!isRecording && !loading && (
                        <TouchableOpacity style={styles.recordButton} onPress={startScan}>
                            <View style={styles.recordInner} />
                        </TouchableOpacity>
                    )}

                    {loading && (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color="#3182CE" />
                            <Text style={styles.loadingText}>Verifying Identity...</Text>
                        </View>
                    )}

                    {!isRecording && !loading && (
                        <Text style={styles.hintText}>Tap button to start 6-second scan</Text>
                    )}
                </View>
            </View>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={alertConfig.onConfirm}
                confirmText="Continue"
            />
        </TunnelWrapper >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    subtitle: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20
    },
    cameraContainer: {
        width: 300,
        height: 400,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    instructionBox: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 10
    },
    instructionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    footer: {
        marginTop: 30,
        alignItems: 'center'
    },
    recordButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    recordInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E53E3E'
    },
    hintText: {
        marginTop: 10,
        color: '#A0AEC0'
    },
    loadingBox: {
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        color: '#3182CE',
        fontWeight: '600'
    },
    btn: {
        marginTop: 20,
        backgroundColor: '#3182CE',
        padding: 10,
        borderRadius: 8
    },
    btnText: {
        color: 'white'
    }
});

export default IdentityGateScreen;
