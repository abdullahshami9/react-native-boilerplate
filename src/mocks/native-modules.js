/**
 * Mock implementation for Native Modules on Web
 */

// Generic mock
const mock = {
    addListener: () => { },
    removeListeners: () => { },
    // Add other common methods if needed
};

export default mock;

// Camera
export const Camera = () => null;
export const useCameraDevice = () => null;
export const useCameraPermission = () => ({ hasPermission: false, requestPermission: () => { } });

// FS
export const readFile = () => Promise.resolve('');
export const writeFile = () => Promise.resolve();
export const mkdir = () => Promise.resolve();

// Device Info
export const getUniqueId = () => 'web-id';
export const getVersion = () => '1.0.0';

// Geolocation
export const Geolocation = {
    getCurrentPosition: () => { },
    watchPosition: () => { },
    clearWatch: () => { },
};

// Image Picker
export const launchCamera = () => Promise.resolve({ didCancel: true });
export const launchImageLibrary = () => Promise.resolve({ didCancel: true });

// Document Picker
export const pick = () => Promise.resolve([]);
export const types = { allFiles: 'allFiles', images: 'images', plainText: 'plainText', audio: 'audio', pdf: 'pdf', zip: 'zip', csv: 'csv', doc: 'doc', docx: 'docx', ppt: 'ppt', pptx: 'pptx', xls: 'xls', xlsx: 'xlsx' };

// Blur
export const BlurView = ({ children }) => children;
export const VibrancyView = ({ children }) => children;

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
