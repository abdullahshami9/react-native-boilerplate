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
