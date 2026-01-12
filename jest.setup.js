jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-device-info', () => {
  return {
    getUniqueId: jest.fn(() => Promise.resolve('mock-mac-address')),
  };
});

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock NativeModules
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    RN.NativeModules.NavBarColor = {
        setBackgroundColor: jest.fn(),
    };
    return RN;
});

// Mock Reanimated - Simple Mock
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
        View: View,
        Text: require('react-native').Text,
        ScrollView: require('react-native').ScrollView,
        createAnimatedComponent: (component) => component,
        event: jest.fn(),
        Value: jest.fn(),
        timing: jest.fn(() => ({ start: jest.fn() })),
        spring: jest.fn(() => ({ start: jest.fn() })),
        parallel: jest.fn(() => ({ start: jest.fn() })),
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedScrollHandler: jest.fn(() => jest.fn()),
    interpolate: jest.fn(),
    Extrapolate: { CLAMP: 'clamp' },
    withSpring: jest.fn(),
    withTiming: jest.fn(),
    runOnJS: jest.fn((fn) => fn),
  };
});

// Mock react-native-qrcode-svg
jest.mock('react-native-qrcode-svg', () => 'QRCode');

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
    launchImageLibrary: jest.fn(),
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const socket = {
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    join: jest.fn() // Add join if used
  };
  return {
    io: jest.fn(() => socket),
  };
});
