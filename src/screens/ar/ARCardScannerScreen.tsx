import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { AuthContext } from '../../context/AuthContext';
import { DataService } from '../../services/DataService';

// Safely import Viro
let ViroComponents: any = {};
let ViroAvailable = false;
try {
  ViroComponents = require('@viro-community/react-viro');
  if (ViroComponents && ViroComponents.ViroARSceneNavigator) {
    ViroAvailable = true;
  }
} catch (e) {
  console.warn("Viro not found:", e);
}

const {
  ViroARScene,
  ViroARSceneNavigator,
  ViroARImageMarker,
  ViroAmbientLight,
  ViroNode,
  Viro3DObject,
  ViroARTrackingTargets,
  ViroText,
} = ViroComponents || {};

// Register Targets safely outside if Viro exists
if (ViroAvailable && ViroARTrackingTargets) {
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
  const [showAvatar, setShowAvatar] = useState(false);

  const _onAnchorFound = (anchor: any) => {
    setShowAvatar(true);
    if (props.sceneNavigator.viroAppProps?.onFound) {
      props.sceneNavigator.viroAppProps.onFound(anchor);
    }
  };

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={1000} />
      <ViroARImageMarker target={"businessCard"} onAnchorFound={_onAnchorFound}>
        {showAvatar && (
          <Viro3DObject
            source={{ uri: "https://models.readyplayer.me/64b73b5b699276c1a8264e03.glb" }} // Demo Avatar
            type="GLB"
            scale={[0.1, 0.1, 0.1]} // Adjust scale for AR
            position={[0, 0, 0]}
            rotation={[-90, 0, 0]}
          />
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

  // HTML for 3D View Fallback (Model Viewer)
  // Uses ReadyPlayerMe avatar to simulate the "Face Mapped" avatar
  const avatarHtml = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.1.1/model-viewer.min.js"></script>
          <style>
            body { margin: 0; background-color: #1A202C; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }
            model-viewer { width: 100%; height: 100%; }
            .badge { position: absolute; bottom: 20px; color: white; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 20px; }
          </style>
        </head>
        <body>
          <model-viewer 
            src="https://models.readyplayer.me/64b73b5b699276c1a8264e03.glb" 
            alt="3D Avatar" 
            auto-rotate 
            camera-controls 
            ar
            shadow-intensity="1"
          >
          </model-viewer>
          <div class="badge">Virtual Avatar View</div>
        </body>
      </html>
  `;

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

  // FALLBACK: If Viro is unavailable, show 3D Web View
  if (!ViroAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.arView}>
          <WebView
            originWhitelist={['*']}
            source={{ html: avatarHtml }}
            style={{ flex: 1 }}
          />
          {mode === 'booking' && (
            <TouchableOpacity
              style={{ position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10 }}
              onPress={() => handleCardFound(null)}
            >
              <Text style={{ fontWeight: 'bold' }}>Book Now (Simulated)</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.overlay}>
          <Text style={[styles.instructionText, { marginBottom: 10, fontSize: 14 }]}>AR Unavailable. Showing 3D Avatar.</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // NORMAL VIRO AR MODE
  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        initialScene={{
          scene: ARCardScene,
        }}
        viroAppProps={{ onFound: handleCardFound }}
        style={styles.arView}
      />
      {/* Debug button for Simulator even if Viro checks pass but camera fails */}
      {mode === 'booking' && (
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, opacity: 0.8 }}
          onPress={() => handleCardFound(null)}
        >
          <Text style={{ fontWeight: 'bold' }}>Simulate Scan</Text>
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
