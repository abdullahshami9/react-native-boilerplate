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
