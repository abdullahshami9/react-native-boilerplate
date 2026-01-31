import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';

const { width, height } = Dimensions.get('window');

interface TermsModalProps {
    visible: boolean;
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, onClose }) => {
    const theme = useTheme();
    const isDark = theme.bg === '#0b141a';
    const [isAtBottom, setIsAtBottom] = React.useState(false);

    React.useEffect(() => {
        if (visible) {
            setIsAtBottom(false);
        }
    }, [visible]);

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            setIsAtBottom(true);
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <BlurView
                    style={styles.absolute}
                    blurType={isDark ? "dark" : "light"}
                    blurAmount={3}
                    reducedTransparencyFallbackColor="white"
                />
                <View style={[styles.modalView, { backgroundColor: theme.cardBg }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Terms and Conditions</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <Path d="M18 6L6 18M6 6L18 18" stroke={theme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        <Text style={[styles.termsText, { color: theme.subText }]}>
                            <Text style={styles.bold}>Last Updated: January 1, 2026</Text>
                            {'\n\n'}
                            Welcome to our application. By accessing or using our mobile application and services, you agree to be bound by these Terms and Conditions.
                            {'\n\n'}
                            <Text style={styles.bold}>1. Acceptance of Terms</Text>
                            {'\n'}
                            By creating an account, accessing, or using usage of the Service, you confirm that you have read, understood, and agree to these terms. If you do not agree, you may not use the Service.
                            {'\n\n'}
                            <Text style={styles.bold}>2. User Accounts</Text>
                            {'\n'}
                            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when registering.
                            {'\n\n'}
                            <Text style={styles.bold}>3. Privacy Policy</Text>
                            {'\n'}
                            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using the Service, you agree to our data practices as described in the Privacy Policy.
                            {'\n\n'}
                            <Text style={styles.bold}>4. Prohibited Conduct</Text>
                            {'\n'}
                            You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You may not attempt to gain unauthorized access to any part of the Service or related systems.
                            {'\n\n'}
                            <Text style={styles.bold}>5. Intellectual Property</Text>
                            {'\n'}
                            All content, features, and functionality of the Service, including but not limited to text, graphics, logos, and software, are the exclusive property of the Company and are protected by intellectual property laws.
                            {'\n\n'}
                            <Text style={styles.bold}>6. Termination</Text>
                            {'\n'}
                            We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                            {'\n\n'}
                            <Text style={styles.bold}>7. Modifications to Terms</Text>
                            {'\n'}
                            We reserve the right to modify these terms at any time. We will provide notice of significant changes. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
                            {'\n\n'}
                            <Text style={styles.bold}>8. Limitation of Liability</Text>
                            {'\n'}
                            To the maximum extent permitted by law, the Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
                            {'\n\n'}
                            Please read these terms carefully before proceeding.
                        </Text>
                    </ScrollView>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            {
                                backgroundColor: isAtBottom ? theme.secondary : theme.inputBorder,
                                opacity: isAtBottom ? 1 : 0.7
                            }
                        ]}
                        onPress={onClose}
                        disabled={!isAtBottom}
                    >
                        <Text style={[styles.buttonText, { color: isAtBottom ? 'white' : theme.subText }]}>
                            {isAtBottom ? 'I Understand' : 'Scroll to Read All'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    modalView: {
        width: width * 0.9,
        height: height * 0.8,
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    termsText: {
        fontSize: 14,
        lineHeight: 22,
    },
    bold: {
        fontWeight: 'bold',
    },
    button: {
        marginTop: 15,
        borderRadius: 12,
        padding: 15,
        elevation: 2,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    }
});

export default TermsModal;
