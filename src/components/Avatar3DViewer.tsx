import React from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface Avatar3DViewerProps {
    avatarUrl: string;
    width?: number | string;
    height?: number | string;
    backgroundColor?: string;
}

const Avatar3DViewer: React.FC<Avatar3DViewerProps> = ({
    avatarUrl,
    width = '100%',
    height = '100%',
    backgroundColor = 'transparent'
}) => {

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-color: ${backgroundColor};
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    overflow: hidden;
                }
            </style>
        </head>
        <body>
            <model-viewer
                src="${avatarUrl}"
                alt="3D Avatar"
                auto-rotate
                camera-controls
                shadow-intensity="1"
                style="width:100%;height:100%;background:#1a1a2e"
            ></model-viewer>
        </body>
        </html>
    `;

    if (Platform.OS === 'web') {
        // Render an iframe for React Native Web
        return (
            <View style={[styles.container, { width, height, backgroundColor }]}>
                <iframe
                    srcDoc={htmlContent}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="3D Avatar Viewer"
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { width, height, backgroundColor }]}>
            <WebView
                key={avatarUrl}
                source={{ html: htmlContent }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                scrollEnabled={false}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                originWhitelist={['*']}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#3182CE" />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    }
});

export default Avatar3DViewer;