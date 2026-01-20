import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroARImageMarker,
  Viro3DObject,
  ViroAmbientLight,
  ViroSpotLight,
  ViroNode,
  ViroARTrackingTargets,
} from '@viro-community/react-viro';
import { useNavigation } from '@react-navigation/native';

// Register tracking targets moved effectively to inside component to avoid crash on load
// ViroARTrackingTargets.createTargets({...})

const ARCardScene = () => {
  const [avatarVisible, setAvatarVisible] = useState(false);

  const _onAnchorFound = () => {
    setAvatarVisible(true);
  };

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" />
      <ViroSpotLight innerAngle={5} outerAngle={90} direction={[0, -1, -.2]}
        position={[0, 3, 1]} color="#ffffff" castsShadow={true} />

      <ViroARImageMarker target={"businessCard"} onAnchorFound={_onAnchorFound}>
        <ViroNode scale={[0.1, 0.1, 0.1]} rotation={[-90, 0, 0]}>
          {/* Placeholder 3D Avatar */}
          {avatarVisible && (
            <Viro3DObject
              source={{ uri: "https://github.com/khronosgroup/glTF-Sample-Models/raw/master/2.0/Duck/glTF-Binary/Duck.glb" }} // Placeholder GLB
              type="GLB"
              scale={[0.1, 0.1, 0.1]}
              position={[0, 0, 0]}
            />
          )}
        </ViroNode>
      </ViroARImageMarker>
    </ViroARScene>
  );
};

const ARCardScannerScreen = () => {
  const navigation = useNavigation();

  React.useEffect(() => {
    try {
      // Register tracking targets safely
      ViroARTrackingTargets.createTargets({
        "businessCard": {
          source: require('../../assets/card_target.png'), // Placeholder target
          orientation: "Up",
          physicalWidth: 0.09 // Real world width in meters (standard business card is ~9cm)
        },
      });
    } catch (error) {
      console.warn("Failed to initialize Viro AR Targets", error);
    }
  }, []);

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        initialScene={{
          scene: ARCardScene,
        }}
        style={styles.arView}
      />

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
