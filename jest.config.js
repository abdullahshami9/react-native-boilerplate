module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-svg|react-native-safe-area-context|react-native-screens|@react-native-async-storage|react-native-qrcode-svg|react-native-image-picker|react-native-reanimated|react-native-worklets)/)',
  ],
  setupFiles: ['./jest.setup.js'],
};
