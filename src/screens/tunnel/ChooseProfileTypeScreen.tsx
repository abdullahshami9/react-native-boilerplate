import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { TunnelService } from '../../services/TunnelService';
import TunnelWrapper from '../../components/TunnelWrapper';
import { resolveImage } from '../../utils/ImageHelper';

const ChooseProfileTypeScreen = ({ navigation }: any) => {
    const { userInfo } = useContext(AuthContext);
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
                    <View style={styles.imageContainer}>
                        <Image
                            source={resolveImage('asset:leisure_relax')}
                            style={styles.cardImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.cardTitle}>Personal Profile</Text>
                    <Text style={styles.cardDesc}>For shopping, booking, and connecting.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleSelect('Business')}
                    disabled={loading}
                >
                    <View style={styles.imageContainer}>
                        <Image
                            source={resolveImage('asset:business_startup_growth')}
                            style={styles.cardImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.cardTitle}>Business Profile</Text>
                    <Text style={styles.cardDesc}>Sell products, offer services, and grow.</Text>
                </TouchableOpacity>

                {loading && <ActivityIndicator size="large" color="#4A5568" style={{ marginTop: 20 }} />}
            </View>
        </TunnelWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        gap: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        flex: 1,
        justifyContent: 'center'
    },
    imageContainer: {
        height: 120,
        width: '100%',
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardImage: {
        width: 150,
        height: 120,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D3748',
        marginBottom: 5,
    },
    cardDesc: {
        fontSize: 12,
        color: '#718096',
        textAlign: 'center'
    }
});

export default ChooseProfileTypeScreen;
