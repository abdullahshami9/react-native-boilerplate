import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { TunnelService } from '../../services/TunnelService';
import TunnelWrapper from '../../components/TunnelWrapper';
import CustomAlert from '../../components/CustomAlert';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const PaymentIntegrationScreen = ({ navigation }: any) => {
    const { userInfo, updateProfileLocal } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    // Payment State
    const [selectedMethod, setSelectedMethod] = useState<'Nayapay' | 'Easypaisa' | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountTitle, setAccountTitle] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' | 'info', onConfirm: undefined as undefined | (() => void) });

    const handleFetchTitle = async () => {
        // Strict Validation
        const phoneRegex = /^03[0-9]{9}$/;
        if (!phoneRegex.test(accountNumber)) {
            setAlertConfig({ visible: true, title: 'Invalid Number', message: 'Please enter a valid 11-digit mobile number (03XXXXXXXXX).', type: 'error', onConfirm: undefined });
            return;
        }

        setVerifying(true);
        try {
            // Real API Call
            const response = await TunnelService.verifyRaastAccount(accountNumber);

            // Assume response contains consumerName based on Raast standards/history
            if (response && (response.consumerName || response.title)) {
                setAccountTitle(response.consumerName || response.title);
            } else {
                setAlertConfig({ visible: true, title: 'Verification Failed', message: 'Could not fetch account details. Please check the number.', type: 'error', onConfirm: undefined });
            }
        } catch (error: any) {
            console.error(error);
            setAlertConfig({
                visible: true,
                title: 'Verification Failed',
                message: error.message || 'Could not verify account. Please try again.',
                type: 'error',
                onConfirm: undefined
            });
        } finally {
            setVerifying(false);
        }
    };

    const handleConfirmVerify = () => {
        setIsVerified(true);
        setAlertConfig({ visible: true, title: 'Verified', message: 'Account verified successfully.', type: 'success', onConfirm: undefined });
    };

    const resetState = () => {
        setIsVerified(false);
        setAccountTitle(null);
        setAccountNumber('');
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            await TunnelService.completeTunnel(userInfo.id);

            // Update local context
            if (updateProfileLocal) {
                updateProfileLocal({ ...userInfo, is_tunnel_completed: 1 });
            }

        } catch (error) {
            console.error(error);
            setAlertConfig({ visible: true, title: 'Error', message: 'Failed to complete tunnel', type: 'error', onConfirm: undefined });
        } finally {
            setLoading(false);
        }
    };

    const renderPaymentCard = (method: 'Nayapay' | 'Easypaisa', color: string) => {
        const isSelected = selectedMethod === method;
        return (
            <TouchableOpacity
                style={[styles.paymentCard, isSelected && styles.paymentCardActive, { borderColor: isSelected ? color : '#E2E8F0' }]}
                onPress={() => {
                    if (selectedMethod !== method) {
                        setSelectedMethod(method);
                        resetState();
                    }
                }}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: color }}>{method[0]}</Text>
                    </View>
                    <Text style={[styles.cardTitle, isSelected && { color: color }]}>{method}</Text>
                    {isSelected && <View style={[styles.radio, { borderColor: color, backgroundColor: color }]} />}
                    {!isSelected && <View style={styles.radio} />}
                </View>

                {isSelected && (
                    <View style={styles.verificationContainer}>
                        <Text style={styles.inputLabel}>Enter Account Number</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="03XXXXXXXXX"
                                placeholderTextColor="#A0AEC0"
                                value={accountNumber}
                                onChangeText={(t) => {
                                    setAccountNumber(t);
                                    if (isVerified || accountTitle) {
                                        setIsVerified(false);
                                        setAccountTitle(null);
                                    }
                                }}
                                keyboardType="phone-pad"
                                maxLength={11}
                            />
                        </View>

                        {/* Verification Flow */}
                        {!isVerified && !accountTitle && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: color, marginTop: 10 }]}
                                onPress={handleFetchTitle}
                                disabled={verifying}
                            >
                                {verifying ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.actionButtonText}>Fetch Title</Text>}
                            </TouchableOpacity>
                        )}

                        {accountTitle && !isVerified && (
                            <View style={styles.confirmationBox}>
                                <Text style={styles.accountTitleLabel}>Account Title:</Text>
                                <Text style={styles.accountTitleValue}>{accountTitle}</Text>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: color, marginTop: 10 }]}
                                    onPress={handleConfirmVerify}
                                >
                                    <Text style={styles.actionButtonText}>Confirm & Verify</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {isVerified && (
                            <View style={styles.verifiedContainer}>
                                <View style={styles.verifiedBadge}>
                                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><Path d="M20 6L9 17l-5-5" /></Svg>
                                </View>
                                <View>
                                    <Text style={styles.accountTitleValue}>{accountTitle}</Text>
                                    <Text style={styles.successText}>Verified ✓</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <TunnelWrapper title="Payment Integration" onBack={() => navigation.goBack()}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

                {/* Illustration from Assets */}
                <View style={styles.illustrationContainer}>
                    <Image
                        source={require('../../assets/Blues illustrations/Scenes/1x/Social media, Delivery, Business _ fast, speed, account, graph, success, happy.png')}
                        style={styles.illustration}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Link Your Wallet</Text>
                    <Text style={styles.subtitle}>Connect your specialized account for instant payouts.</Text>
                </View>

                <View style={styles.cardsContainer}>
                    {renderPaymentCard('Nayapay', '#FF8C00')}
                    {renderPaymentCard('Easypaisa', '#38A169')}
                </View>

                <View style={styles.spacer} />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.skipButton} onPress={handleFinish}>
                        <Text style={styles.skipText}>Skip Setup</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.finishButton, isVerified && styles.finishButtonActive]}
                        onPress={handleFinish}
                        disabled={loading}
                    >
                        <Text style={styles.finishButtonText}>{loading ? 'Completing...' : 'Finish Setup'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={alertConfig.onConfirm}
            />
        </TunnelWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    illustrationContainer: {
        height: 200,
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustration: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    textContainer: {
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#718096',
        lineHeight: 22,
    },
    cardsContainer: {
        gap: 16,
    },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    paymentCardActive: {
        backgroundColor: '#F7FAFC',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A5568',
        flex: 1,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#CBD5E0',
    },
    verificationContainer: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#718096',
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#CBD5E0',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 48,
        color: '#2D3748',
        fontSize: 16,
    },
    verifyButton: {
        height: 48,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifyText: {
        color: 'white',
        fontWeight: 'bold',
    },
    actionButton: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    confirmationBox: {
        marginTop: 15,
        backgroundColor: '#F7FAFC',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    accountTitleLabel: {
        fontSize: 13,
        color: '#718096',
        marginBottom: 4,
    },
    accountTitleValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    verifiedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        backgroundColor: '#F0FFF4',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#C6F6D5',
    },
    verifiedBadge: {
        height: 36,
        width: 36,
        borderRadius: 18,
        backgroundColor: '#38A169',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    successText: {
        color: '#38A169',
        fontWeight: '600',
        fontSize: 13,
    },
    spacer: {
        flex: 1,
        minHeight: 20,
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    skipButton: {
        padding: 16,
    },
    skipText: {
        color: '#718096',
        fontWeight: '600',
    },
    finishButton: {
        backgroundColor: '#CBD5E0',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
    },
    finishButtonActive: {
        backgroundColor: '#2D3748',
    },
    finishButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default PaymentIntegrationScreen;
