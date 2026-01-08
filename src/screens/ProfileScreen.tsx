import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Switch, TextInput, Modal, TouchableWithoutFeedback, Platform, Animated, PanResponder, Alert } from 'react-native';
import Svg, { Path, Circle, Line, Plus, X, Trash } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { BlurView } from "@react-native-community/blur";
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
    const { logout, userInfo, updateProfile } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userInfo?.name || '');
    const [phone, setPhone] = useState(userInfo?.phone || '');

    // Raabtaa Data State
    const [skills, setSkills] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // New Input State
    const [newSkill, setNewSkill] = useState('');
    const [newProduct, setNewProduct] = useState({ name: '', price: '' });

    // Settings Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Animation Values
    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only capture if dragging down significantly (threshold prevents taking button clicks)
                return Math.abs(gestureState.dy) > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    // Move the sheet down with the gesture
                    slideAnim.setValue(gestureState.dy);
                    // Fade out blur based on drag distance (max 300px drag)
                    const newOpacity = 1 - (gestureState.dy / 400);
                    fadeAnim.setValue(Math.max(0, newOpacity));
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    // Close if dragged down enough
                    closeModal();
                } else {
                    // Snap back to open if not dragged enough
                    Animated.parallel([
                        Animated.spring(slideAnim, {
                            toValue: 0,
                            useNativeDriver: true,
                        }),
                        Animated.timing(fadeAnim, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: true,
                        })
                    ]).start();
                }
            },
        })
    ).current;

    const isBusinessUser = userInfo?.user_type === 'business';

    useEffect(() => {
        if (userInfo?.id) {
            fetchData();
        }
    }, [userInfo?.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (isBusinessUser) {
                const res = await DataService.getProducts(userInfo.id);
                if (res.success) setProducts(res.products);
            } else {
                const res = await DataService.getSkills(userInfo.id);
                if (res.success) setSkills(res.skills);
            }
        } catch (error) {
            console.log("Error fetching profile data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async () => {
        if (!newSkill.trim()) return;
        try {
            const res = await DataService.addSkill(userInfo.id, newSkill);
            if (res.success) {
                setSkills([...skills, { id: res.id, skill_name: newSkill }]);
                setNewSkill('');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteSkill = async (id: number) => {
        try {
            const res = await DataService.deleteSkill(id);
            if (res.success) {
                setSkills(skills.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price) return;
        try {
            const res = await DataService.addProduct({
                user_id: userInfo.id,
                name: newProduct.name,
                price: newProduct.price,
                description: 'New Product', // localized properly in real app
                image_url: ''
            });
            if (res.success) {
                await fetchData(); // Refresh list
                setNewProduct({ name: '', price: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };


    const openModal = () => {
        setModalVisible(true);
        // Reset values
        slideAnim.setValue(height);
        fadeAnim.setValue(0);

        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            setModalVisible(false);
            // Reset pan
            pan.setValue({ x: 0, y: 0 });
        });
    };

    const handleSave = async () => {
        try {
            await updateProfile(name, phone);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleDarkMode = () => setDarkMode(previousState => !previousState);

    const handleEditProfile = () => {
        closeModal();
        setIsEditing(true);
    };

    const handleLogout = () => {
        closeModal();
        logout();
    };

    const handlePrintCard = () => {
        closeModal();
        console.log("Print Card");
    };

    const handleConnectSocials = () => {
        closeModal();
        console.log("Connect Socials");
    };

    return (
        <View style={styles.container}>
            {/* Dark Header Background */}
            <View style={styles.headerBackground}>
                {/* Header Top Bar */}
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={openModal} style={styles.iconButton}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            <Circle cx="12" cy="12" r="3" />
                            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </Svg>
                    </TouchableOpacity>
                </View>

                {/* QR Code Area */}
                <View style={styles.qrContainer}>
                    <View style={styles.qrWrapper}>
                        <QRCode
                            value={`raabtaa://user/${userInfo?.id}` || "https://example.com"}
                            size={120}
                            backgroundColor="white"
                            color="black"
                        />
                    </View>
                </View>
            </View>

            {/* Content Body */}
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                    <Image
                        source={{
                            uri: isBusinessUser
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
                            <View style={styles.userTypeBadge}>
                                <Text style={styles.userTypeBadgeText}>{isBusinessUser ? 'Business' : 'Individual'}</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Dynamic Content Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{isBusinessUser ? 'Product Catalog' : 'Professional Skills'}</Text>

                    {/* Skills List (Individual) */}
                    {!isBusinessUser && (
                        <View>
                            <View style={styles.tagsContainer}>
                                {skills.map((skill: any, index: number) => (
                                    <TouchableOpacity key={index} style={styles.tag} onPress={() => isEditing && handleDeleteSkill(skill.id)}>
                                        <Text style={styles.tagText}>{skill.skill_name}</Text>
                                        {isEditing && (
                                            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="3" style={{ marginLeft: 5 }}>
                                                <Path d="M18 6L6 18M6 6l12 12"></Path>
                                            </Svg>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {isEditing && (
                                <View style={styles.addInputRow}>
                                    <TextInput
                                        style={styles.smallInput}
                                        placeholder="Add Skill..."
                                        value={newSkill}
                                        onChangeText={setNewSkill}
                                    />
                                    <TouchableOpacity onPress={handleAddSkill} style={styles.addButton}>
                                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                            <Path d="M12 5v14M5 12h14"></Path>
                                        </Svg>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Products List (Business) */}
                    {isBusinessUser && (
                        <View>
                            {products.length === 0 && !isEditing && <Text style={{ color: '#A0AEC0', textAlign: 'center' }}>No products added.</Text>}
                            {products.map((prod: any, index: number) => (
                                <View key={index} style={styles.productListItem}>
                                    <Text style={styles.productListItemName}>{prod.name}</Text>
                                    <Text style={styles.productListItemPrice}>{prod.price} PKR</Text>
                                </View>
                            ))}

                            {isEditing && (
                                <View style={styles.addProductForm}>
                                    <TextInput
                                        style={[styles.smallInput, { flex: 2, marginRight: 5 }]}
                                        placeholder="Product Name"
                                        value={newProduct.name}
                                        onChangeText={(t) => setNewProduct(prev => ({ ...prev, name: t }))}
                                    />
                                    <TextInput
                                        style={[styles.smallInput, { flex: 1, marginRight: 5 }]}
                                        placeholder="Price"
                                        keyboardType="numeric"
                                        value={newProduct.price}
                                        onChangeText={(t) => setNewProduct(prev => ({ ...prev, price: t }))}
                                    />
                                    <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
                                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                            <Path d="M12 5v14M5 12h14"></Path>
                                        </Svg>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Edit Save Button if editing */}
                {isEditing && (
                    <TouchableOpacity style={styles.mainButton} onPress={handleSave}>
                        <Text style={styles.mainButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                )}

                {/* Bottom Spacer */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Custom Bottom Sheet (No Modal, Absolute Overlay) */}
            {modalVisible && (
                <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
                    {/* Background Blur with Fade Animation */}
                    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
                        <BlurView
                            style={StyleSheet.absoluteFill}
                            blurType="dark"
                            blurAmount={10}
                            reducedTransparencyFallbackColor="black"
                        />
                        {/* Tap background to close */}
                        <TouchableWithoutFeedback onPress={closeModal}>
                            <View style={styles.dismissArea} />
                        </TouchableWithoutFeedback>
                    </Animated.View>

                    {/* Draggable Sheet */}
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                        {...panResponder.panHandlers}
                    >
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHandle} />
                        </View>

                        <View style={styles.menuContainer}>
                            {/* Edit Profile Option */}
                            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
                                <View style={styles.iconContainer}>
                                    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                                        <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </Svg>
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.menuItemText}>Edit Profile</Text>
                                    <Text style={styles.menuItemSubText}>Update your personal information</Text>
                                </View>
                                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBD5E0" strokeWidth="2">
                                    <Path d="M9 18l6-6-6-6" />
                                </Svg>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            {/* Print Card Option */}
                            <TouchableOpacity style={styles.menuItem} onPress={handlePrintCard}>
                                <View style={styles.iconContainer}>
                                    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                                        <Path d="M6 9V2h12v7" />
                                        <Path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                        <Path d="M6 14h12v8H6z" />
                                    </Svg>
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.menuItemText}>Print Card</Text>
                                    <Text style={styles.menuItemSubText}>Share your profile card</Text>
                                </View>
                                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBD5E0" strokeWidth="2">
                                    <Path d="M9 18l6-6-6-6" />
                                </Svg>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            {/* Connect Socials Option */}
                            <TouchableOpacity style={styles.menuItem} onPress={handleConnectSocials}>
                                <View style={styles.iconContainer}>
                                    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                                        <Path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                        <Path d="M2 9h4v12H2z" />
                                        <Circle cx="4" cy="4" r="2" />
                                    </Svg>
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.menuItemText}>Connect Socials</Text>
                                    <Text style={styles.menuItemSubText}>Link your social accounts</Text>
                                </View>
                                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBD5E0" strokeWidth="2">
                                    <Path d="M9 18l6-6-6-6" />
                                </Svg>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            {/* Dark Mode Option */}
                            <View style={styles.menuItem}>
                                <View style={styles.iconContainer}>
                                    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                                        <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </Svg>
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.menuItemText}>Dark Mode</Text>
                                    <Text style={styles.menuItemSubText}>Switch app appearance</Text>
                                </View>
                                <Switch
                                    trackColor={{ false: "#E2E8F0", true: "#2D3748" }}
                                    thumbColor={darkMode ? "#fff" : "#fff"}
                                    ios_backgroundColor="#E2E8F0"
                                    onValueChange={toggleDarkMode}
                                    value={darkMode}
                                />
                            </View>

                            <View style={styles.divider} />

                            {/* Logout Option */}
                            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                                <View style={[styles.iconContainer, { backgroundColor: '#FFF5F5' }]}>
                                    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2">
                                        <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <Path d="M16 17l5-5-5-5" />
                                        <Path d="M21 12H9" />
                                    </Svg>
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.menuItemText, { color: '#E53E3E' }]}>Logout</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.modalFooter}>
                            <Text style={styles.footerText}>App Version 1.0.0</Text>
                            <Text style={styles.footerSubText}>by Programental</Text>
                        </View>
                    </Animated.View>
                </View>
            )}
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
        height: 280, // Increased height
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
        alignItems: 'center',
        paddingBottom: 50,
    },
    avatarWrapper: {
        marginTop: -50, // Pull up
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#F7FAFC', // Match bg
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        zIndex: 2,
    },
    avatar: {
        width: 92,
        height: 92,
        borderRadius: 46,
    },
    infoSection: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 5,
    },
    roleText: {
        fontSize: 14,
        color: '#718096',
    },
    userTypeBadge: {
        marginTop: 5,
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    userTypeBadgeText: {
        fontSize: 12,
        color: '#4A5568',
        fontWeight: '600',
    },
    sectionContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 15,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 10,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EDF2F7',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    tagText: {
        color: '#4A5568',
        fontSize: 14,
        fontWeight: '500',
    },
    addInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    smallInput: {
        flex: 1,
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        marginRight: 10,
    },
    addButton: {
        backgroundColor: '#4A9EFF',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addProductForm: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
    productListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F7FAFC',
    },
    productListItemName: {
        fontSize: 16,
        color: '#2D3748',
    },
    productListItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A5568',
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
        marginBottom: 20,
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
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 25,
        paddingBottom: 80, // Increased to ensure footer is visible
        paddingTop: 15,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 25,
        paddingVertical: 10, // Increase hit area
    },
    modalHandle: {
        width: 50,
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
    },
    menuContainer: {
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#EDF2F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: '#2D3748',
        fontWeight: '600',
        marginBottom: 2,
    },
    menuItemSubText: {
        fontSize: 12,
        color: '#A0AEC0',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 10,
        marginLeft: 60, // Align with text
    },
    modalFooter: {
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F7FAFC',
        paddingTop: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#718096',
        fontWeight: '600',
    },
    footerSubText: {
        fontSize: 11,
        color: '#A0AEC0',
        marginTop: 4,
    }
});

export default ProfileScreen;
