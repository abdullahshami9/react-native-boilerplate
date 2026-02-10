/**
 * Mock implementation for Native Modules on Web
 */
import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

// Generic mock
const mock = {
    addListener: () => { },
    removeListeners: () => { },
};

export default mock;

// Camera
export const Camera = forwardRef((props, ref) => {
    const [isRecording, setIsRecording] = useState(false);
    const callbacks = useRef({});

    useImperativeHandle(ref, () => ({
        startRecording: (options) => {
            console.log('[Mock Camera] Start Recording', options);
            setIsRecording(true);
            if (options) {
                callbacks.current.onFinished = options.onRecordingFinished;
                callbacks.current.onError = options.onRecordingError;
            }
        },
        stopRecording: async () => {
            console.log('[Mock Camera] Stop Recording');
            setIsRecording(false);
            if (callbacks.current.onFinished) {
                // Return a mock video path.
                // In a real web app, we'd record a MediaStream.
                // For now, return a placeholder.
                callbacks.current.onFinished({ path: 'web_mock_video.mp4', duration: 5 });
            }
        },
        takePhoto: async () => {
            return { path: 'web_mock_photo.jpg' };
        }
    }));

    return (
        <View style={[props.style, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: 'white', marginBottom: 10 }}>[Web Camera Mock]</Text>
            <Text style={{ color: '#ccc', textAlign: 'center', padding: 20 }}>
                Camera features are simulated on web.
            </Text>
            {isRecording && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: 'red', marginRight: 8 }} />
                    <Text style={{ color: 'red' }}>Recording...</Text>
                </View>
            )}
        </View>
    );
});

export const useCameraDevice = (position) => ({
    id: 'web-camera',
    position: position || 'back',
    supportsVideo: true,
    supportsPhoto: true,
});

export const useCameraPermission = () => ({
    hasPermission: true,
    requestPermission: () => Promise.resolve(true)
});

// FS
export const readFile = () => Promise.resolve('');
export const writeFile = () => Promise.resolve();
export const mkdir = () => Promise.resolve();
export const DocumentDirectoryPath = '/';

// Device Info
export const getUniqueId = () => 'web-id-123';
export const getVersion = () => '1.0.0';

// Geolocation
export const Geolocation = {
    getCurrentPosition: (success, error, options) => {
        // Mock San Francisco location or similar
        success({
            coords: {
                latitude: 37.78825,
                longitude: -122.4324,
                altitude: 0,
                accuracy: 5,
                heading: 0,
                speed: 0,
            },
            timestamp: Date.now(),
        });
    },
    watchPosition: (success) => {
         success({
            coords: {
                latitude: 37.78825,
                longitude: -122.4324,
            },
            timestamp: Date.now(),
        });
        return 1; // watchId
    },
    clearWatch: () => { },
};

// Image Picker
export const launchCamera = () => Promise.resolve({ didCancel: true });

export const launchImageLibrary = (options) => {
    return new Promise((resolve) => {
        if (typeof document !== 'undefined') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = options?.mediaType === 'video' ? 'video/*' : 'image/*';
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const blobUrl = URL.createObjectURL(file);
                    resolve({
                        didCancel: false,
                        assets: [{
                            uri: blobUrl,
                            fileName: file.name,
                            type: file.type,
                            fileSize: file.size,
                            originalFile: file // Custom property for web handling if needed
                        }]
                    });
                } else {
                    resolve({ didCancel: true });
                }
            };
            input.click();
        } else {
             resolve({ didCancel: true });
        }
    });
};

// Document Picker
export const pick = () => Promise.resolve([]);
export const types = { allFiles: 'allFiles', images: 'images', plainText: 'plainText', audio: 'audio', pdf: 'pdf', zip: 'zip', csv: 'csv', doc: 'doc', docx: 'docx', ppt: 'ppt', pptx: 'pptx', xls: 'xls', xlsx: 'xlsx' };

// Blur
export const BlurView = ({ children }) => <View style={{backgroundColor: 'rgba(255,255,255,0.8)'}}>{children}</View>;
export const VibrancyView = ({ children }) => <View>{children}</View>;

// Viro (AR)
export const ViroARSceneNavigator = () => null;
export const ViroARScene = () => null;
export const ViroText = () => null;
export const ViroConstants = {};
export const ViroBox = () => null;
export const ViroMaterials = { createMaterials: () => { } };
export const Viro3DObject = () => null;
export const ViroAmbientLight = () => null;
export const ViroSpotLight = () => null;
export const ViroNode = () => null;
export const ViroAnimations = { registerAnimations: () => { } };
export const Viroimage = () => null;
export const ViroARTrackingTargets = { createTargets: () => { } };
export const ViroARImageMarker = () => null;
