import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Switch } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
    const { logout, userInfo } = useContext(AuthContext);
    // For demo purposes, we can toggle between Individual and Business views
    // In a real app, this would be determined by userInfo.user_type
    const [isBusiness, setIsBusiness] = useState(userInfo?.user_type === 'business');

    // Toggle function for demo
    const toggleUserType = () => setIsBusiness(!isBusiness);

    return (
        <View style={styles.container}>
            {/* Dark Header Background */}
            <View style={styles.headerBackground}>
                {/* Header Top Bar */}
                <View style={styles.headerTop}>
                    {/* Back Button (Optional in Tab, usually hidden or goes to Home) - Design shows none or specific */}
                    {/* We will add settings/logout here */}
                    <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <Path d="M16 17l5-5-5-5" />
                            <Path d="M21 12H9" />
                        </Svg>
                    </TouchableOpacity>
                </View>

                {/* QR Code Area */}
                <View style={styles.qrContainer}>
                    <View style={styles.qrWrapper}>
                        <QRCode
                            value={userInfo?.email || "https://example.com"}
                            size={120}
                            backgroundColor="white"
                            color="black"
                        />
                    </View>
                </View>
            </View>

            {/* Content Body */}
            <View style={styles.contentContainer}>
                {/* Curve Svg simulated by top borderRadius of contentContainer if absolute, 
                     but design shows the dark part overlapping. 
                     Let's use negative margin approach or absolute positioning. 
                 */}

                {/* Profile Image / Shop Logo */}
                <View style={styles.avatarWrapper}>
                    <Image
                        source={{
                            uri: isBusiness
                                ? 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?fit=crop&w=200&h=200' // Flower/Shop logo
                                : 'https://randomuser.me/api/portraits/men/32.jpg' // Person
                        }}
                        style={styles.avatar}
                    />
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.nameText}>{isBusiness ? 'Shop Name' : (userInfo?.name || 'Name Smith')}</Text>
                    <Text style={styles.roleText}>{isBusiness ? 'Shop Shop' : 'User Photo'}</Text>
                </View>

                {/* Tags / Skills - Only for Individual */}
                {!isBusiness && (
                    <View style={styles.tagsContainer}>
                        <View style={[styles.tag, styles.activeTag]}>
                            <Text style={styles.activeTagText}>Skill</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>Speestiling</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>Skills</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>Making</Text>
                        </View>
                    </View>
                )}

                {/* Main Action Button */}
                <TouchableOpacity style={styles.mainButton}>
                    <Text style={styles.mainButtonText}>
                        {isBusiness ? 'View Products' : 'Connect'}
                    </Text>
                </TouchableOpacity>

                {/* Toggle for Demo */}
                <View style={styles.demoToggle}>
                    <Text style={styles.demoText}>View as {isBusiness ? 'Business' : 'Individual'}</Text>
                    <Switch value={isBusiness} onValueChange={toggleUserType} trackColor={{ false: "#767577", true: "#4A5568" }} />
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    headerBackground: {
        backgroundColor: '#2D3748',
        height: '45%', // Takes up top portion
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        alignItems: 'center',
        paddingTop: 50,
        position: 'relative',
        zIndex: 1,
    },
    headerTop: {
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    logoutIcon: {
        padding: 5,
    },
    qrContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrWrapper: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 15,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: -60, // Pull up to overlap
        zIndex: 2,
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#F7FAFC', // Match bg
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    avatar: {
        width: 92,
        height: 92,
        borderRadius: 46,
    },
    infoSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 5,
    },
    roleText: {
        fontSize: 16,
        color: '#718096',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 30,
        paddingHorizontal: 30,
    },
    tag: {
        backgroundColor: '#EDF2F7',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    activeTag: {
        backgroundColor: '#4A9EFF', // Or blueish color from design
    },
    tagText: {
        color: '#718096',
        fontSize: 12,
        fontWeight: '600',
    },
    activeTagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    mainButton: {
        backgroundColor: '#2D3748',
        width: '80%',
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#2D3748',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    mainButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    demoToggle: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    demoText: {
        color: '#718096',
    }
});

export default ProfileScreen;
