import React, { useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { TunnelService } from '../../services/TunnelService';
import TunnelWrapper from '../../components/TunnelWrapper';
import { resolveImage } from '../../utils/ImageHelper';
import { useTheme } from '../../theme/useTheme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ChooseProfileTypeScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const individualScale = useRef(new Animated.Value(1)).current;
    const businessScale = useRef(new Animated.Value(1)).current;

    // For fade out effect on unselected card
    const individualOpacity = useRef(new Animated.Value(1)).current;
    const businessOpacity = useRef(new Animated.Value(1)).current;

    const animatePress = (scale: Animated.Value, toValue: number) => {
        Animated.spring(scale, {
            toValue,
            useNativeDriver: true,
            friction: 5,
            tension: 40
        }).start();
    };

    const handleSelect = (type: 'Individual' | 'Business') => {
        // Optimistic UI - No loading indicator needed if transition is smooth enough
        // or we use a very subtle one. Here we rely on the animation.

        // Animation Sequence
        if (type === 'Individual') {
            Animated.parallel([
                Animated.timing(businessOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
                Animated.spring(individualScale, { toValue: 1.05, useNativeDriver: true })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(individualOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
                Animated.spring(businessScale, { toValue: 1.05, useNativeDriver: true })
            ]).start();
        }

        // Fire and Forget API call - don't block navigation
        TunnelService.updateUserType(userInfo.id, type).catch(err => {
            console.error("Background UserType Update Failed:", err);
            // In a robust app, we might retry or handle this on the next screen
        });

        // Navigate after short delay for animation visibility
        setTimeout(() => {
            // Navigate to next step
            if (type === 'Individual') {
                navigation.navigate('PersonalDetails');
            } else {
                navigation.navigate('BusinessLocation');
            }

            // Cleanup animations after navigation happens (runs in background)
            setTimeout(() => {
                individualOpacity.setValue(1);
                businessOpacity.setValue(1);
                individualScale.setValue(1);
                businessScale.setValue(1);
            }, 500);
        }, 150); // Reduced delay for snappier feel
    };

    const Card = ({ type, title, desc, image, scale, opacity }: any) => (
        <AnimatedTouchable
            style={[
                styles.card,
                {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.borderColor,
                    transform: [{ scale }],
                    opacity
                }
            ]}
            activeOpacity={0.9}
            onPress={() => handleSelect(type)}
            onPressIn={() => animatePress(scale, 0.96)}
            onPressOut={() => animatePress(scale, 1)}
            disabled={loading}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={resolveImage(image)}
                    style={styles.cardImage}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
                <Text style={[styles.cardDesc, { color: theme.subText }]}>{desc}</Text>
            </View>
        </AnimatedTouchable>
    );

    return (
        <TunnelWrapper title="How would you like to proceed?" showBack={false}>
            <View style={styles.container}>
                <Card
                    type="Individual"
                    title="Personal Profile"
                    desc="For shopping, booking, and connecting with friends."
                    image="asset:leisure_relax"
                    scale={individualScale}
                    opacity={individualOpacity}
                />

                <Card
                    type="Business"
                    title="Business Profile"
                    desc="Sell products, offer services, and grow your brand."
                    image="asset:business_startup_growth"
                    scale={businessScale}
                    opacity={businessOpacity}
                />

                {loading && <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />}
            </View>
        </TunnelWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        gap: 24,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 6, // Increased elevation for 'pop'
        borderWidth: 1,
        flex: 1,
        justifyContent: 'center'
    },
    imageContainer: {
        height: 140,
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardImage: {
        width: 180,
        height: 140,
    },
    textContainer: {
        alignItems: 'center',
        gap: 8
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        paddingHorizontal: 10
    }
});

export default ChooseProfileTypeScreen;
