import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

interface TunnelWrapperProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: React.ReactNode;
}

const TunnelWrapper: React.FC<TunnelWrapperProps> = ({
  children,
  title,
  showBack = true,
  onBack,
  headerRight
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M15 18L9 12L15 6" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        ) : <View style={styles.backButtonPlaceholder} />}

        <Text style={styles.headerTitle}></Text>
        {/* Title is typically in the content in the designs, not center header */}

        <View style={styles.headerRight}>
            {headerRight}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>{title}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  headerRight: {
      width: 40,
      alignItems: 'flex-end'
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginTop: 10,
    marginBottom: 24,
  }
});

export default TunnelWrapper;
