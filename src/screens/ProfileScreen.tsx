import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Switch, TextInput } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
    const { logout, userInfo, updateProfile } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userInfo?.name || '');
    const [phone, setPhone] = useState(userInfo?.phone || '');

    // We can keep the view toggle for design purposes if user is business, 
    // but the main request is "login user can edit their info".
    // We will assume "isBusiness" view logic remains for displaying different layouts if they ARE a business, 
    // but let's base it on actual user_type for the default view.
    const isBusinessUser = userInfo?.user_type === 'business';
    const [isBusinessView, setIsBusinessView] = useState(isBusinessUser);

    const handleSave = async () => {
        try {
            await updateProfile({ id: userInfo.id, name, phone, email: userInfo.email });
            setIsEditing(false);
            // Optionally show success alert
        } catch (error) {
            console.error(error);
            // Optionally show error alert
        }
    };

    return (
        <View style={styles.container}>
            {/* Dark Header Background */}
            <View style={styles.headerBackground}>
                {/* Header Top Bar */}
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.iconButton}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            {isEditing ? (
                                <Path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            ) : (
                                <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            )}
                            {isEditing ? (
                                <Path d="M17 21v-8h-6v8" /> // Save icon-ish
                            ) : (
                                <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            )}
                        </Svg>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={logout} style={[styles.iconButton, { marginLeft: 15 }]}>
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
                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                    <Image
                        source={{
                            uri: isBusinessView
                                ? 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?fit=crop&w=200&h=200'
                                : 'https://randomuser.me/api/portraits/men/32.jpg'
                        }}
                        style={styles.avatar}
                    />
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    {isEditing ? (
                        <View style={styles.editForm}>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Name"
                            />
                            <TextInput
                                style={[styles.input, { marginTop: 10 }]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Phone"
                                keyboardType="phone-pad"
                            />
                        </View>
                    ) : (
                        <>
                            <Text style={styles.nameText}>{userInfo?.name || 'Name'}</Text>
                            <Text style={styles.roleText}>{userInfo?.email}</Text>
                            <Text style={[styles.roleText, { fontSize: 14, marginTop: 5 }]}>{userInfo?.phone}</Text>
                        </>
                    )}
                </View>

                {/* Edit Save Button if editing */}
                {isEditing && (
                    <TouchableOpacity style={styles.mainButton} onPress={handleSave}>
                        <Text style={styles.mainButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                )}

                {/* Normal Action Button (Hidden if editing maybe? or kept) */}
                {!isEditing && (
                    <TouchableOpacity style={styles.mainButton}>
                        <Text style={styles.mainButtonText}>
                            {isBusinessView ? 'View Products' : 'Connect'}
                        </Text>
                    </TouchableOpacity>
                )}
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
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconButton: {
        padding: 5,
    },
    logoutIcon: {
        padding: 5,
    },
    editForm: {
        width: '100%',
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    input: {
        width: '100%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: '#2D3748',
        textAlign: 'center',
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
