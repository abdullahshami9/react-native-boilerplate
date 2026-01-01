import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, StatusBar as RNStatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import Svg, { Circle, Rect, Path, Ellipse, G, Defs, Stop, LinearGradient } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const FloatingIcon = ({ color, style, delay = 0 }: { color: string; style: any; delay?: number }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [delay, translateY]);

  return (
    <Animated.View style={[style, { transform: [{ translateY }] }]}>
      <View style={[styles.circleIcon, { backgroundColor: color, borderColor: '#CBD5E0', borderWidth: color === '#E2E8F0' ? 3 : 0 }]} />
    </Animated.View>
  );
};

const OnboardingScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#E8EEF3" />
      
      {/* Status Bar Mockup */}
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.statusIcons}>
          <Text style={styles.statusIcon}>📶</Text>
          <Text style={styles.statusIcon}>📡</Text>
          <Text style={styles.statusIcon}>🔋</Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>✦</Text>
          <Text style={styles.logoText}>Logo</Text>
        </View>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationWrapper}>
          <View style={styles.backgroundCircle} />
          
          <View style={styles.personScene}>
             <Svg viewBox="0 0 300 250" style={styles.illustrationSvg}>
              {/* Chair */}
              <Ellipse cx="100" cy="180" rx="35" ry="25" fill="#C5D9E8" />
              <Ellipse cx="100" cy="140" rx="25" ry="35" fill="#C5D9E8" />
              <Rect x="60" y="195" width="80" height="8" rx="4" fill="#2D3748" />
              
              {/* Desk */}
              <Rect x="160" y="175" width="100" height="12" rx="6" fill="#F7FAFC" stroke="#2D3748" strokeWidth="2" />
              
              {/* Person Body */}
              <Ellipse cx="115" cy="160" rx="30" ry="28" fill="#2D3748" />
              
              {/* Head */}
              <Ellipse cx="115" cy="125" rx="15" ry="17" fill="#FED7D7" />
              <Path d="M 105 115 Q 115 108 125 115" fill="#4A9EFF" />
              
              {/* Arms */}
              <Ellipse cx="90" cy="155" rx="22" ry="10" fill="#2D3748" transform="rotate(-30 90 155)" />
              <Ellipse cx="145" cy="160" rx="22" ry="10" fill="#2D3748" transform="rotate(20 145 160)" />
              
              {/* Laptop */}
              <Rect x="165" y="155" width="45" height="30" rx="3" fill="#A0AEC0" stroke="#2D3748" strokeWidth="2" />
              <Rect x="163" y="183" width="49" height="6" rx="3" fill="#E2E8F0" stroke="#2D3748" strokeWidth="2" />
              
              {/* Coffee Cup */}
              <Rect x="85" y="168" width="16" height="20" rx="4" fill="#5BC4F0" stroke="#2D3748" strokeWidth="2" />
            </Svg>
          </View>

          {/* Floating Icons */}
          <FloatingIcon color="#4A9EFF" style={[styles.floatingIcon, { top: '25%', right: '15%' }]} delay={0} />
          <FloatingIcon color="#42C5F0" style={[styles.floatingIcon, { top: '40%', right: '8%' }]} delay={500} />
          <FloatingIcon color="#5BC4F0" style={[styles.floatingIcon, { top: '20%', right: '28%' }]} delay={1000} />
          
          <Animated.View style={[styles.floatingIcon, { top: '15%', right: '35%' }]}>
             <View style={[styles.circleIcon, { backgroundColor: '#7FC8F5', width: 30, height: 30 }]} />
          </Animated.View>
          
          <FloatingIcon color="#E2E8F0" style={[styles.floatingIcon, { top: '10%', left: '22%' }]} delay={2000} />

        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Lorem ipsum{'\n'}dolor.</Text>
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        </Text>
      </View>

      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator}>
        <TouchableOpacity style={styles.indicator} onPress={() => navigation.navigate('Login')} />
      </View>
    </SafeAreaView>
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
    paddingVertical: 20,
    alignItems: 'center',
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
  illustrationWrapper: {
    width: 350,
    height: 300,
    position: 'relative',
  },
  backgroundCircle: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: 150, // Approx circle
    backgroundColor: '#D4E0EB',
    top: '7.5%',
    left: '7.5%',
  },
  personScene: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  illustrationSvg: {
    width: '100%',
    height: '100%',
  },
  floatingIcon: {
    position: 'absolute',
  },
  circleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  bottomIndicator: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  indicator: {
    width: 120,
    height: 5,
    backgroundColor: '#2D3748',
    borderRadius: 3,
  },
});

export default OnboardingScreen;
