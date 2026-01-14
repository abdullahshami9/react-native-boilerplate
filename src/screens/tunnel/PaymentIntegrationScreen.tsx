import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { TunnelService } from '../../services/TunnelService';
import TunnelWrapper from '../../components/TunnelWrapper';
import Svg, { Path, Circle } from 'react-native-svg';

const PaymentIntegrationScreen = ({ navigation }: any) => {
    const { userInfo, updateProfileLocal } = useContext(AuthContext); // updateProfileLocal needs implementation
    const [loading, setLoading] = useState(false);

    const handleFinish = async () => {
        setLoading(true);
        try {
            await TunnelService.completeTunnel(userInfo.id);

            // Update local context
            if (updateProfileLocal) {
                updateProfileLocal({ ...userInfo, is_tunnel_completed: 1 });
            }

            // Navigation should automatically switch to Main Stack in App.tsx due to context change,
            // but if not, we can force it or wait.
            // App.tsx logic: {userToken !== null && isTunnelCompleted ? <Main> : <Tunnel>}

            // If updateProfileLocal isn't available yet (I will add it), we might need to reload or re-fetch.
            // For now, assume it will be there.

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to complete tunnel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Integrate Payment" onBack={() => navigation.goBack()}>
            <View style={styles.container}>

                <TouchableOpacity style={styles.paymentOption}>
                    <View style={styles.iconContainer}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2">
                            <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </Svg>
                    </View>
                    <Text style={styles.optionText}>Link Noyopay</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.paymentOption}>
                    <View style={styles.iconContainer}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F855A" strokeWidth="2">
                            <Circle cx="12" cy="12" r="10" />
                            <Path d="M16 12l-4-4-4 4M12 16V9" />
                        </Svg>
                    </View>
                    <Text style={styles.optionText}>Link Eesipoisa</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={handleFinish}>
                    <Text style={styles.skipText}>Skip for Now</Text>
                </TouchableOpacity>

                <View style={styles.spacer} />

                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                    <Svg width="150" height="100" viewBox="0 0 200 150">
                        <Circle cx="100" cy="75" r="50" fill="#E2E8F0" opacity="0.5" />
                         <Path d="M80 75h40M100 55v40" stroke="#CBD5E0" strokeWidth="4" />
                    </Svg>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.finishButton}
                        onPress={handleFinish}
                        disabled={loading}
                    >
                        <Text style={styles.finishButtonText}>{loading ? 'Finishing...' : 'Finish'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TunnelWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 16,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingVertical: 16,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        marginRight: 16,
        width: 30,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    skipText: {
        fontSize: 14,
        color: '#718096',
        fontWeight: '500',
    },
    spacer: {
        flex: 1,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    backButton: {
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 30,
        backgroundColor: '#E2E8F0',
    },
    backButtonText: {
        color: '#4A5568',
        fontWeight: '600',
    },
    finishButton: {
        flex: 1,
        marginLeft: 16,
        paddingVertical: 14,
        borderRadius: 30,
        backgroundColor: '#A0AEC0', // Color from design looks greyish/green
        alignItems: 'center',
    },
    finishButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default PaymentIntegrationScreen;
