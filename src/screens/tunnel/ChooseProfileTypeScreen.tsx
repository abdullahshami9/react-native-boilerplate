import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { TunnelService } from '../../services/TunnelService';
import TunnelWrapper from '../../components/TunnelWrapper';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const ChooseProfileTypeScreen = ({ navigation }: any) => {
    const { userInfo, updateProfileLocal } = useContext(AuthContext); // We might need to add updateProfileLocal to AuthContext
    const [loading, setLoading] = useState(false);

    const handleSelect = async (type: 'Individual' | 'Business') => {
        setLoading(true);
        try {
            await TunnelService.updateUserType(userInfo.id, type);
            // Navigate to next step
            if (type === 'Individual') {
                navigation.navigate('PersonalDetails');
            } else {
                navigation.navigate('BusinessLocation');
            }
        } catch (error) {
            console.error(error);
            // Show alert
        } finally {
            setLoading(false);
        }
    };

    return (
        <TunnelWrapper title="Choose Your Profile Type" showBack={false}>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleSelect('Individual')}
                    disabled={loading}
                >
                    <View style={styles.iconContainer}>
                        <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2">
                            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <Circle cx="12" cy="7" r="4" />
                        </Svg>
                    </View>
                    <Text style={styles.cardTitle}>Personal Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleSelect('Business')}
                    disabled={loading}
                >
                    <View style={styles.iconContainer}>
                        <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2">
                             <Path d="M3 21h18" />
                             <Rect x="5" y="7" width="4" height="14" />
                             <Rect x="15" y="7" width="4" height="14" />
                             <Path d="M9 7h6v14H9z" />
                             <Path d="M3 7h18v0" />
                        </Svg>
                    </View>
                    <Text style={styles.cardTitle}>Business Profile</Text>
                </TouchableOpacity>

                {loading && <ActivityIndicator size="large" color="#4A5568" style={{ marginTop: 20 }} />}

                {/* Illustration at bottom */}
                <View style={styles.illustrationContainer}>
                    {/* Placeholder for the illustration in the design */}
                     <Svg width="150" height="100" viewBox="0 0 200 150">
                        {/* Simple artistic elements */}
                        <Circle cx="100" cy="75" r="50" fill="#E2E8F0" opacity="0.5" />
                     </Svg>
                </View>
            </View>
        </TunnelWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        gap: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    iconContainer: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#F7FAFC',
        borderRadius: 50,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
    },
    illustrationContainer: {
        alignItems: 'center',
        marginTop: 'auto',
    }
});

export default ChooseProfileTypeScreen;
