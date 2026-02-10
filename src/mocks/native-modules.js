/**
 * Mock implementation for Native Modules on Web
 */
import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

// ReactNativeBiometrics Mock
class ReactNativeBiometrics {
    constructor(options) {
        this.options = options;
    }

    isSensorAvailable() {
        return Promise.resolve({
            available: false,
            biometryType: undefined,
            error: 'Biometrics not supported on web',
        });
    }

    createKeys() {
        return Promise.resolve({
            publicKey: 'mock-public-key',
        });
    }

    deleteKeys() {
        return Promise.resolve(true);
    }

    simplePrompt(options) {
        return Promise.resolve({
            success: true,
        });
    }
}

export default ReactNativeBiometrics;

// BiometryTypes constant
export const BiometryTypes = {
    TouchID: 'TouchID',
    FaceID: 'FaceID',
    Biometrics: 'Biometrics',
};

// Generic mock for other default exports if needed (though we just replaced the default)
// If other modules rely on a default export being a simple object, they might break. 
// But based on webpack.config.js aliases, this file is aliased for many modules.
// We need to support them all.
// The previous "mock" object was a catch-all.
// Let's create a Hybrid export that can act as both if possible, or just add the other properties to the class prototype or static?
// No, `ReactNativeBiometrics` uses `new`. Others might use `import ... from ...`.
// Let's check `webpack.config.js` again.
// It aliases: `react-native-vision-camera`, `react-native-fs`, `react-native-device-info`, `react-native-biometrics`, etc. all to this SAME file.
// This is a bit messy. `react-native-fs` exports constants and methods, not a class.
// `react-native-device-info` exports methods.
// `react-native-biometrics` exports a default class.

// To support all, the default export should probably be a Proxy or a flexible object.
// BUT `new ReactNativeBiometrics()` MUST work.
// So the default export MUST be a constructor function (or class).

// Let's try to make the default export a function that returns the mock object, 
// but also has the static methods attached to it? 
// Or just a class that has static methods?
// `react-native-fs` usage: `import FS from 'react-native-fs'; FS.readFile(...)`
// If `FS` is a class, `FS.readFile` would be a static method.
// `react-native-biometrics` usage: `import RnBiometrics from '...'; const rn = new RnBiometrics();`

// So I will make the default export a Class, and assign static methods to it that cover the other modules' needs.

const mockMethods = {
    addListener: () => { },
    removeListeners: () => { },
    // FS
    readFile: () => Promise.resolve(''),
    writeFile: () => Promise.resolve(),
    mkdir: () => Promise.resolve(),
    DocumentDirectoryPath: '/',
    // Device Info
    getUniqueId: () => 'web-id-123',
    getVersion: () => '1.0.0',
    // ... add other methods from the original file if they were on the default export?
    // The original file had named exports for many things, which is good.
    // But `react-native-fs` acts as a default export usually?
    // Let's check the original file content again.
    // It had `const mock = { ... }; export default mock;`
    // And named exports for Camera, etc.
    // Webpack aliases `react-native-fs` to this file. 
    // If I import `react-native-fs`, I get the default export.
    // So the default export must have `readFile`, etc.
};

// So `ReactNativeBiometrics` (the class) must ALSO have `readFile` as a static property?
// Yes.

Object.assign(ReactNativeBiometrics, mockMethods);
Object.assign(ReactNativeBiometrics.prototype, mockMethods); // Just in case? No, usually not needed for `FS.readFile`.

// Wait, the named exports in the file are fine.
// But the default export needs to serve two masters:
// 1. `new Class()` (Biometrics)
// 2. `Object.method()` (FS, DeviceInfo, etc.)

// So:


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
export const BlurView = ({ children }) => <View style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>{children}</View>;
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
