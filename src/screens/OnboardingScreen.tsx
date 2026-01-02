import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, StatusBar as RNStatusBar, Image, TouchableOpacity } from 'react-native';
const OnboardingScreen = ({ navigation }: any) => {
  const [isNavigating, setIsNavigating] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only auto-navigate if user hasn't already clicked something
      if (!isNavigating) {
        navigation.navigate('Login');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation, isNavigating]);

  const handleRegister = () => {
    setIsNavigating(true);
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <RNStatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/logo-provision.png')} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Image source={require('../assets/starter-img.png')} style={styles.illustrationImage} resizeMode="contain" />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Lorem ipsum{'\n'}dolor.</Text>
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        </Text>
      </View>

      {/* Register Button */}
      <View style={styles.registerContainer}>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EEF3',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  time: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a202c',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  statusIcon: {
    fontSize: 14,
    marginLeft: 4,
  },
  header: {
    paddingTop: 60, // Added padding for status bar
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoImage: {
    width: 150,
    height: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 28,
    color: '#4A5568',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A5568',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 44,
  },
  description: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  registerContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#4A5568',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
