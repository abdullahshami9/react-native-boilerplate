import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TunnelWrapper from '../../components/TunnelWrapper';

const IdentityGateScreen = ({ navigation }: any) => {
    return (
        <TunnelWrapper title="Identity Verification" onBack={() => navigation.goBack()}>
            <View style={styles.container}>
                <Text style={styles.text}>Camera access for Identity Verification is not fully supported on this web preview.</Text>
                <Text style={styles.subText}>Please use the mobile app for full verification.</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('PaymentIntegration')}
                >
                    <Text style={styles.buttonText}>Skip Verification (Web Dev)</Text>
                </TouchableOpacity>
            </View>
        </TunnelWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
        color: '#2D3748'
    },
    subText: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 30,
        textAlign: 'center'
    },
    button: {
        backgroundColor: '#3182CE',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default IdentityGateScreen;
