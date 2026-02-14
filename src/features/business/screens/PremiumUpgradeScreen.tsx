import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import Svg, { Path, Circle, Check } from 'react-native-svg';
import { useTheme } from '../../../theme/useTheme';
import { DataService } from '../../../services/DataService';
import AnimatedButton from '../../../shared/components/AnimatedButton';
import StandardLoader from '../../../components/StandardLoader';

const { width } = Dimensions.get('window');

const PremiumUpgradeScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            // Simulate Payment Processing Delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const res = await DataService.subscribeBusiness();
            if (res.success) {
                Alert.alert("Success", "Welcome to Premium! Your business features are now unlocked.", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        "Unlimited Product Listings",
        "Priority Search Ranking",
        "Advanced Analytics Dashboard",
        "Verified Business Badge",
        "Zero Commission on Orders"
    ];

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
                        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </Svg>
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Go Premium</Text>
                <Text style={[styles.subtitle, { color: theme.subText }]}>Unlock the full potential of your business on Raabtaa.</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
                <Text style={[styles.price, { color: theme.text }]}>2,500 PKR<Text style={{ fontSize: 16, color: theme.subText }}>/month</Text></Text>
                <View style={styles.divider} />

                {features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                        <View style={styles.checkIcon}>
                            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <Path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </View>
                        <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
                    </View>
                ))}
            </View>

            <AnimatedButton style={styles.button} onPress={handleUpgrade}>
                <Text style={styles.buttonText}>Upgrade Now</Text>
            </AnimatedButton>

            <TouchableOpacity style={styles.skipButton} onPress={() => navigation.goBack()}>
                <Text style={[styles.skipText, { color: theme.subText }]}>Maybe Later</Text>
            </TouchableOpacity>

            <StandardLoader visible={loading} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    card: {
        width: '100%',
        borderRadius: 20,
        padding: 25,
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    price: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginBottom: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    checkIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#00a884',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    featureText: {
        fontSize: 16,
        fontWeight: '500',
    },
    button: {
        width: '100%',
        backgroundColor: '#00a884',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: "#00a884",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default PremiumUpgradeScreen;
