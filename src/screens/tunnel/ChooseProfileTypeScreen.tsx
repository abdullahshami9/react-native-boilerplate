import React, { useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { TunnelService } from '../../services/TunnelService';
import TunnelWrapper from '../../components/TunnelWrapper';
import { resolveImage } from '../../utils/ImageHelper';
import { useTheme } from '../../theme/useTheme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ChooseProfileTypeScreen = ({ navigation }: any) => {
    const { userInfo, updateProfileLocal } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const individualScale = useRef(new Animated.Value(1)).current;
    const businessScale = useRef(new Animated.Value(1)).current;
    const guestScale = useRef(new Animated.Value(1)).current;

    // For fade out effect on unselected card
    const individualOpacity = useRef(new Animated.Value(1)).current;
    const businessOpacity = useRef(new Animated.Value(1)).current;
    const guestOpacity = useRef(new Animated.Value(1)).current;

    const animatePress = (scale: Animated.Value, toValue: number) => {
        Animated.spring(scale, {
            toValue,
            useNativeDriver: true,
            friction: 5,
            tension: 40
        }).start();
    };

    const handleSelect = (type: 'Individual' | 'Business' | 'Guest') => {
        // Optimistic UI - Rely on animation.

        // Animation Sequence
        if (type === 'Individual') {
            Animated.parallel([
                Animated.timing(businessOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
                Animated.timing(guestOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
                Animated.spring(individualScale, { toValue: 1.05, useNativeDriver: true })
            ]).start();
        } else if (type === 'Business') {
            Animated.parallel([
                Animated.timing(individualOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
                Animated.timing(guestOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
                Animated.spring(businessScale, { toValue: 1.05, useNativeDriver: true })
            ]).start();
        } else if (type === 'Guest') {
            Animated.parallel([
                Animated.timing(individualOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
                Animated.timing(businessOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
                Animated.spring(guestScale, { toValue: 1.05, useNativeDriver: true })
            ]).start();
        }

        // Handle Guest Mode immediately via Context bypass
        if (type === 'Guest') {
            // Fire and Forget APIs
            Promise.all([
                TunnelService.updateUserType(userInfo.id, type),
                TunnelService.completeTunnel(userInfo.id)
            ]).catch(err => {
                console.error("Background Guest Setup Failed:", err);
            });

            setTimeout(() => {
                if (updateProfileLocal) {
                    updateProfileLocal({ ...userInfo, user_type: type, is_tunnel_completed: 1 });
                }
                // App.tsx automatically transitions to Main Stack!
            }, 150);
            return;
        }

        // For Individual & Business
        if (updateProfileLocal) {
            updateProfileLocal({ ...userInfo, user_type: type });
        }

        TunnelService.updateUserType(userInfo.id, type).catch(err => {
            console.error("Background UserType Update Failed:", err);
        });

        // Navigate after short delay for animation visibility
        setTimeout(() => {
            if (type === 'Individual') {
                navigation.navigate('PersonalDetails');
            } else if (type === 'Business') {
                navigation.navigate('BusinessLocation');
            }

            // Cleanup animations after navigation happens (runs in background)
            setTimeout(() => {
                individualOpacity.setValue(1);
                businessOpacity.setValue(1);
                guestOpacity.setValue(1);
                individualScale.setValue(1);
                businessScale.setValue(1);
                guestScale.setValue(1);
            }, 500);
        }, 150);
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
                    image="asset:shopping_sale"
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

                <Card
                    type="Guest"
                    title="Guest Mode"
                    desc="Explore the app quickly without full setup."
                    image="asset:social_startup"
                    scale={guestScale}
                    opacity={guestOpacity}
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
        paddingBottom: 20,
        justifyContent: 'space-between', // Distribute cards evenly
    },
    card: {
        borderRadius: 20,
        padding: 16, // Reduced padding
        alignItems: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        flex: 1,
        justifyContent: 'center',
        marginBottom: 16, // Space between cards
    },
    imageContainer: {
        height: 100, // Reduced height
        width: '100%',
        marginBottom: 10, // Reduced margin
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardImage: {
        width: 140, // Reduced size
        height: 100,
    },
    textContainer: {
        alignItems: 'center',
        gap: 4 // Reduced gap
    },
    cardTitle: {
        fontSize: 18, // Reduced font size
        fontWeight: '700',
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: 13, // Reduced font size
        lineHeight: 18,
        textAlign: 'center',
        paddingHorizontal: 8 // Reduced padding
    }
});

export default ChooseProfileTypeScreen;
