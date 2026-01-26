import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { DataService } from '../../services/DataService';

// Safely import Viro
let ViroComponents: any = {};
try {
  ViroComponents = require('@viro-community/react-viro');
} catch (e) {
  console.warn("Viro not found:", e);
}

const {
  ViroARScene,
  ViroARSceneNavigator,
  ViroARImageMarker,
  ViroAmbientLight,
  ViroNode,
  ViroARTrackingTargets,
  ViroText,
} = ViroComponents;

// Register Targets safely outside if Viro exists
if (ViroARTrackingTargets) {
  try {
    ViroARTrackingTargets.createTargets({
      "businessCard": {
        source: require('../../assets/card_target.png'),
        orientation: "Up",
        physicalWidth: 0.09
      },
    });
  } catch (e) {
    console.warn("Target creation failed:", e);
  }
}

const ARCardScene = (props: any) => {
  const [textVisible, setTextVisible] = useState(false);

  const _onAnchorFound = (anchor: any) => {
    setTextVisible(true);
    if (props.sceneNavigator.viroAppProps?.onFound) {
      props.sceneNavigator.viroAppProps.onFound(anchor);
    }
  };

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" />
      <ViroARImageMarker target={"businessCard"} onAnchorFound={_onAnchorFound}>
        {textVisible && (
          <ViroNode rotation={[-90, 0, 0]}>
            <ViroText text="Card Detected!" scale={[0.1, 0.1, 0.1]} style={{ fontSize: 20, color: '#00FF00' }} />
          </ViroNode>
        )}
      </ViroARImageMarker>
    </ViroARScene>
  );
};

const ARCardScannerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const mode = (route.params as any)?.mode;
  const { userInfo } = useContext(AuthContext);
  const [scannedUserId, setScannedUserId] = useState<number | null>(null);

  const handleCardFound = (anchor: any) => {
    console.log("Card Anchor Found");
    if (mode === 'booking') {
      checkProvider(2); // Demo Provider ID
    }
  };

  const checkProvider = async (providerId: number) => {
    if (scannedUserId === providerId) return;
    setScannedUserId(providerId);

    try {
      const profile = await DataService.getProfile(providerId);
      if (profile.is_business) {
        Alert.alert(
          "Provider Found",
          `Book with ${profile.name}?`,
          [
            { text: "Cancel", style: "cancel", onPress: () => setScannedUserId(null) },
            { text: "View Services", onPress: () => (navigation as any).navigate('ServiceDetails', { service: { ...profile, user_id: providerId } }) }
          ]
        );
      } else {
        Alert.alert("Invalid Provider", "This user is not a business provider.");
      }
    } catch (err) {
      Alert.alert("Error", "Could not fetch provider details.");
    }
  };

  // Fallback if Viro is missing or on simple Simulator
  if (!ViroARSceneNavigator) {
    return (
      <View style={styles.container}>
        <View style={[styles.arView, { backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: 'white', marginBottom: 20 }}>AR Not Supported on this device</Text>
          {mode === 'booking' && (
            <TouchableOpacity
              style={{ backgroundColor: 'white', padding: 15, borderRadius: 10 }}
              onPress={() => handleCardFound(null)}
            >
              <Text style={{ fontWeight: 'bold' }}>Simulate Scan (Debug)</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        initialScene={{
          scene: ARCardScene,
        }}
        viroAppProps={{ onFound: handleCardFound }}
        style={styles.arView}
      />
      {mode === 'booking' && (
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10 }}
          onPress={() => handleCardFound(null)}
        >
          <Text style={{ fontWeight: 'bold' }}>Simulate Scan (Debug)</Text>
        </TouchableOpacity>
      )}

      <View style={styles.overlay}>
        <Text style={styles.instructionText}>Point camera at the Business Card</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center'
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 5
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 20
  },
  closeText: {
    color: 'white',
    fontWeight: '600'
  }
});

export default ARCardScannerScreen;
