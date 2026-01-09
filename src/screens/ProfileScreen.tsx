import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Switch, TextInput, Modal, TouchableWithoutFeedback, Platform, Animated, PanResponder, Alert, Button, Clipboard } from 'react-native';
import Svg, { Path, Circle, Line, Plus, X, Trash, Rect } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { BlurView } from "@react-native-community/blur";
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import { launchImageLibrary } from 'react-native-image-picker';
import { CONFIG } from '../Config';

const { width, height } = Dimensions.get('window');

// Calendar Contribution Graph Component
const ContributionGraph = ({ appointments, onDateClick }: any) => {
    // Generate dates for the last month to next month (approx 60 days)
    // "Past one month and one month future" -> ~60 days centered on today
    // Let's generate -30 to +30
    const today = new Date();
    const days = [];
    for (let i = -30; i <= 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        days.push(d);
    }

    const getColor = (dateStr: string) => {
        const count = appointments.filter((a: any) => {
            if (!a.appointment_date) return false;
            const apptDate = a.appointment_date.split('T')[0];
            return apptDate === dateStr;
        }).length;
        if (count === 0) return '#EBEDF0';
        if (count === 1) return '#9BE9A8';
        if (count === 2) return '#40C463';
        if (count === 3) return '#30A14E';
        return '#216E39';
    };

    return (
        <View style={styles.calendarContainer}>
            <Text style={styles.calendarTitle}>Appointment Activity</Text>
            <View style={styles.calendarGrid}>
                {days.map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isToday = dateStr === today.toISOString().split('T')[0];
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.calendarCell,
                                { backgroundColor: getColor(dateStr) },
                                isToday && { borderWidth: 1, borderColor: '#2D3748' }
                            ]}
                            onPress={() => onDateClick(dateStr)}
                        />
                    );
                })}
            </View>
            <View style={styles.calendarLegend}>
                <Text style={styles.legendText}>Less</Text>
                <View style={[styles.legendBox, { backgroundColor: '#EBEDF0' }]} />
                <View style={[styles.legendBox, { backgroundColor: '#9BE9A8' }]} />
                <View style={[styles.legendBox, { backgroundColor: '#40C463' }]} />
                <View style={[styles.legendBox, { backgroundColor: '#30A14E' }]} />
                <View style={[styles.legendBox, { backgroundColor: '#216E39' }]} />
                <Text style={styles.legendText}>More</Text>
            </View>
        </View>
    );
};

const ProfileScreen = ({ navigation }: any) => {
    const { logout, userInfo, updateProfile, isDarkMode, toggleTheme } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userInfo?.name || '');
    const [phone, setPhone] = useState(userInfo?.phone || '');

    // Raabtaa Data State
    const [skills, setSkills] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // New Input State
    const [newSkill, setNewSkill] = useState('');
    const [newProduct, setNewProduct] = useState({ name: '', price: '' });

    // Settings Modal State
    const [modalVisible, setModalVisible] = useState(false);

    // Business Card Modal State
    const [businessCardVisible, setBusinessCardVisible] = useState(false);

    // Appointment Modal State
    const [apptModalVisible, setApptModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedAppts, setSelectedAppts] = useState<any[]>([]);

    // Animation Values
    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    slideAnim.setValue(gestureState.dy);
                    const newOpacity = 1 - (gestureState.dy / 400);
                    fadeAnim.setValue(Math.max(0, newOpacity));
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    closeModal();
                } else {
                    Animated.parallel([
                        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, }),
                        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true, })
                    ]).start();
                }
            },
        })
    ).current;

    const isBusinessUser = userInfo?.user_type === 'business';

    const theme = {
        bg: isDarkMode ? '#1A202C' : '#F7FAFC',
        text: isDarkMode ? '#F7FAFC' : '#2D3748',
        subText: isDarkMode ? '#A0AEC0' : '#718096',
        cardBg: isDarkMode ? '#2D3748' : '#fff',
        inputBg: isDarkMode ? '#2D3748' : '#fff',
        borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
        headerBg: isDarkMode ? '#2D3748' : '#fff',
    };

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

            // Fetch Appointments for Calendar
            const apptRes = await DataService.getAppointments(userInfo.id);
            if (apptRes.success) {
                setAppointments(apptRes.appointments);
            }
        } catch (error) {
            console.log("Error fetching profile data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (dateStr: string) => {
        const dayAppointments = appointments.filter((a: any) => {
            if (!a.appointment_date) return false;
            const apptDate = a.appointment_date.split('T')[0];
            return apptDate === dateStr;
        });

        setSelectedDate(dateStr);
        setSelectedAppts(dayAppointments);
        setApptModalVisible(true);
    };

    const changeDate = (daysToAdd: number) => {
        if (!selectedDate) return;
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + daysToAdd);
        const newDateStr = d.toISOString().split('T')[0];
        handleDateClick(newDateStr);
    }

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
                description: 'New Product',
                image_url: ''
            });
            if (res.success) {
                await fetchData();
                setNewProduct({ name: '', price: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUploadProfilePic = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (result.assets && result.assets.length > 0) {
            const file = result.assets[0];
            try {
                const res = await DataService.uploadProfilePic(userInfo.id, file);
                if (res.success) {
                    Alert.alert("Success", "Profile picture updated");
                }
            } catch (error) {
                Alert.alert("Error", "Failed to upload image");
            }
        }
    };

    const handleUploadProductImage = async (productId: number) => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (result.assets && result.assets.length > 0) {
            const file = result.assets[0];
            try {
                // For simplicity, using index 0 as main image
                const res = await DataService.uploadProductImage(productId, 0, file);
                if (res.success) {
                    Alert.alert("Success", "Product image uploaded");
                    fetchData();
                }
            } catch (error) {
                Alert.alert("Error", "Failed to upload image");
            }
        }
    };

    const openModal = () => {
        setModalVisible(true);
        slideAnim.setValue(height);
        fadeAnim.setValue(0);
        Animated.parallel([
            Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true, }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true, })
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true, }),
            Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true, })
        ]).start(() => {
            setModalVisible(false);
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

    const handleEditProfile = () => { closeModal(); setIsEditing(true); };
    const handleLogout = () => { closeModal(); logout(); };

    // Helper to get image URL
    const getProfilePicUrl = () => {
        if (userInfo?.profile_pic_url) {
            return `${CONFIG.API_URL}/${userInfo.profile_pic_url}?t=${new Date().getTime()}`;
        }
        return isBusinessUser
            ? 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?fit=crop&w=200&h=200'
            : 'https://randomuser.me/api/portraits/men/32.jpg';
    };

    /* -------------------------------------------------------------------------- */
    /*                                ANIMATIONS                                  */
    /* -------------------------------------------------------------------------- */

    // Header Height: shrinks from 280 -> 110
    const HEADER_MAX_HEIGHT = 280;
    const HEADER_MIN_HEIGHT = 110;
    const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

    // Define transition points for Sticky Header elements
    // We want Name -> Email -> Type to fade in sequentially in the header
    // And fade out sequentially in the body

    // Body Fades Out:
    const bodyNameOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.4],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    const bodyEmailOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    const bodyTypeOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE * 0.8],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    // Header Fades In:
    const headerHeight = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp'
    });

    const headerBorderRadius = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [40, 20],
        extrapolate: 'clamp'
    });

    // Sequential Header Opacity
    const headerNameOpacity = scrollY.interpolate({
        inputRange: [SCROLL_DISTANCE * 0.4, SCROLL_DISTANCE * 0.6],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    const headerEmailOpacity = scrollY.interpolate({
        inputRange: [SCROLL_DISTANCE * 0.6, SCROLL_DISTANCE * 0.8],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    const headerBadgeOpacity = scrollY.interpolate({
        inputRange: [SCROLL_DISTANCE * 0.8, SCROLL_DISTANCE],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });


    // QR Code Animation:
    // Starts Center (roughly), Moves to Top-Right OVER the Icon
    // Final Scale: 0.25 (Very small, icon size)
    // Final Pos: Align with Settings Icon
    const qrScale = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [1, 0.25],
        extrapolate: 'clamp'
    });

    const qrTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, -60], // Adjust to align vertically with gear icon
        extrapolate: 'clamp'
    });

    const qrTranslateX = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, width / 2 - 32], // Move to far right (width/2 is edge from center, -32 for padding/icon center)
        extrapolate: 'clamp'
    });

    // Avatar Animation
    // Starts: Centered below header
    // Ends: Top-Left of header (Moved HIGHER as requested)

    const avatarScale = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [1, 0.5],
        extrapolate: 'clamp'
    });

    const avatarTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, -210],
        extrapolate: 'clamp'
    });

    const avatarTranslateX = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, -width / 2 + 50],
        extrapolate: 'clamp'
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Absolute Header Layer */}
            <Animated.View style={[styles.headerBackground, { height: headerHeight, borderBottomLeftRadius: headerBorderRadius, borderBottomRightRadius: headerBorderRadius, backgroundColor: isDarkMode ? '#2D3748' : '#2D3748' }]}>
                {/* Fixed Top Bar (Settings) */}
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={openModal} style={styles.iconButton}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            <Circle cx="12" cy="12" r="3" />
                            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </Svg>
                    </TouchableOpacity>
                </View>

                {/* Header Profile Info (Visible on Scroll) - Sequential Fade In */}
                <View style={styles.headerInfoContainer}>
                    <Animated.Text style={[styles.headerNameText, { opacity: headerNameOpacity }]}>{userInfo?.name || 'User Name'}</Animated.Text>
                    <Animated.Text style={[styles.headerEmailText, { opacity: headerEmailOpacity }]}>{userInfo?.email}</Animated.Text>
                    <Animated.View style={[styles.headerBadge, { opacity: headerBadgeOpacity }]}>
                        <Text style={styles.headerBadgeText}>{isBusinessUser ? 'Business' : 'Individual'}</Text>
                    </Animated.View>
                </View>

                {/* QR Code - Transitioned */}
                <Animated.View style={[
                    styles.qrContainer,
                    { transform: [{ scale: qrScale }, { translateY: qrTranslateY }, { translateX: qrTranslateX }] }
                ]}>
                    <TouchableOpacity onPress={() => setBusinessCardVisible(true)}>
                        <View style={styles.qrWrapper}>
                            <QRCode value={`raabtaa://user/${userInfo?.id}` || "https://example.com"} size={120} backgroundColor="white" color="black" />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Avatar (Now inside Header/Absolute but layered) */}
                <Animated.View style={[
                    styles.avatarContainerAbsolute,
                    {
                        transform: [
                            { translateY: avatarTranslateY },
                            { translateX: avatarTranslateX },
                            { scale: avatarScale }
                        ]
                    }
                ]}>
                    <View style={styles.avatarWrapper}>
                        <Image source={{ uri: getProfilePicUrl() }} style={styles.avatar} />
                        {isEditing && (
                            <TouchableOpacity style={styles.cameraIcon} onPress={handleUploadProfilePic}>
                                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <Circle cx="12" cy="13" r="4" />
                                </Svg>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </Animated.View>

            {/* Scrollable Content */}
            <Animated.ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            >

                <View style={styles.infoSection}>
                    {isEditing ? (
                        <View style={styles.editForm}>
                            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor }]} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={theme.subText} />
                            <TextInput style={[styles.input, { marginTop: 10, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor }]} value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" placeholderTextColor={theme.subText} />
                        </View>
                    ) : (
                        <>
                            <Animated.Text style={[styles.nameText, { opacity: bodyNameOpacity, color: theme.text }]}>{userInfo?.name || 'Name'}</Animated.Text>
                            <Animated.Text style={[styles.roleText, { opacity: bodyEmailOpacity, color: theme.subText }]}>{userInfo?.email}</Animated.Text>
                            <Animated.View style={[styles.userTypeBadge, { opacity: bodyTypeOpacity, backgroundColor: isDarkMode ? '#4A5568' : '#E2E8F0' }]}>
                                <Text style={[styles.userTypeBadgeText, { color: isDarkMode ? '#F7FAFC' : '#4A5568' }]}>{isBusinessUser ? 'Business' : 'Individual'}</Text>
                            </Animated.View>
                        </>
                    )}
                </View>

                {/* Calendar Component */}
                <View style={[styles.sectionContainer, { backgroundColor: theme.cardBg }]}>
                    <ContributionGraph appointments={appointments} onDateClick={handleDateClick} />
                </View>

                <View style={[styles.sectionContainer, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{isBusinessUser ? 'Product Catalog' : 'Professional Skills'}</Text>

                    {!isBusinessUser && (
                        <View>
                            <View style={styles.tagsContainer}>
                                {skills.map((skill: any, index: number) => (
                                    <TouchableOpacity key={index} style={[styles.tag, { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7' }]} onPress={() => isEditing && handleDeleteSkill(skill.id)}>
                                        <Text style={[styles.tagText, { color: theme.text }]}>{skill.skill_name}</Text>
                                        {isEditing && <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="3" style={{ marginLeft: 5 }}><Path d="M18 6L6 18M6 6l12 12"></Path></Svg>}
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {isEditing && (
                                <View style={styles.addInputRow}>
                                    <TextInput style={[styles.smallInput, { backgroundColor: theme.inputBg, borderColor: theme.borderColor, color: theme.text }]} placeholder="Add Skill..." placeholderTextColor={theme.subText} value={newSkill} onChangeText={setNewSkill} />
                                    <TouchableOpacity onPress={handleAddSkill} style={styles.addButton}><Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><Path d="M12 5v14M5 12h14"></Path></Svg></TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {isBusinessUser && (
                        <View>
                            {products.length === 0 && !isEditing && <Text style={{ color: '#A0AEC0', textAlign: 'center', marginBottom: 10 }}>No products added.</Text>}
                            {products.map((prod: any, index: number) => (
                                <View key={index} style={[styles.productListItem, { borderBottomColor: theme.borderColor }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {prod.image_url ? (
                                            <Image source={{ uri: `${CONFIG.API_URL}/${prod.image_url}?t=${new Date().getTime()}` }} style={{ width: 30, height: 30, borderRadius: 5, marginRight: 10 }} />
                                        ) : (
                                            <View style={{ width: 30, height: 30, backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7', marginRight: 10, borderRadius: 5 }} />
                                        )}
                                        <Text style={[styles.productListItemName, { color: theme.text }]}>{prod.name}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[styles.productListItemPrice, { color: theme.subText }]}>{prod.price} PKR</Text>
                                    </View>
                                </View>
                            ))}
                            <TouchableOpacity style={[styles.mainButton, { marginTop: 15, width: '100%', backgroundColor: isDarkMode ? '#4A5568' : '#2D3748' }]} onPress={() => navigation.navigate('Inventory')}>
                                <Text style={styles.mainButtonText}>Manage Inventory</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {isEditing && (
                    <TouchableOpacity style={styles.mainButton} onPress={handleSave}>
                        <Text style={styles.mainButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: 100 }} />
            </Animated.ScrollView>

            {/* Business Card Modal */}
            {businessCardVisible && (
                <Modal visible={businessCardVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={3} reducedTransparencyFallbackColor="white" />
                        <View style={styles.businessCardContainer}>
                            <TouchableOpacity style={styles.closeCardButton} onPress={() => setBusinessCardVisible(false)}>
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2"><Line x1="18" y1="6" x2="6" y2="18"></Line><Line x1="6" y1="6" x2="18" y2="18"></Line></Svg>
                            </TouchableOpacity>
                            <View style={styles.cardHeader}>
                                <Image source={{ uri: getProfilePicUrl() }} style={styles.cardAvatar} />
                                <View style={{ marginLeft: 15 }}>
                                    <Text style={styles.cardName}>{userInfo?.name || 'User Name'}</Text>
                                    <Text style={styles.cardRole}>{isBusinessUser ? 'Business Account' : 'Individual Profile'}</Text>
                                </View>
                            </View>
                            <View style={styles.cardQrBody}>
                                <View style={styles.cardQrWrapper}>
                                    <QRCode value={`raabtaa://user/${userInfo?.id}` || "https://example.com"} size={180} backgroundColor="white" color="black" />
                                </View>
                                <Text style={styles.scanText}>Scan to connect on Raabtaa</Text>
                            </View>
                            <View style={styles.cardFooter}>
                                <Text style={styles.cardEmail}>{userInfo?.email}</Text>
                                {userInfo?.phone && <Text style={styles.cardPhone}>{userInfo?.phone}</Text>}
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {modalVisible && (
                <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
                    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
                        <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={3} reducedTransparencyFallbackColor="white" />
                        <TouchableWithoutFeedback onPress={closeModal}><View style={styles.dismissArea} /></TouchableWithoutFeedback>
                    </Animated.View>

                    <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }], backgroundColor: theme.cardBg }]} {...panResponder.panHandlers}>
                        <View style={styles.modalHeader}><View style={[styles.modalHandle, { backgroundColor: theme.borderColor }]} /></View>
                        <View style={styles.menuContainer}>
                            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
                                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7' }]}><Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Svg></View>
                                <View style={styles.textContainer}><Text style={[styles.menuItemText, { color: theme.text }]}>Edit Profile</Text><Text style={[styles.menuItemSubText, { color: theme.subText }]}>Update your personal information</Text></View>
                                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2"><Path d="M9 18l6-6-6-6" /></Svg>
                            </TouchableOpacity>
                            <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                            <View style={styles.menuItem}>
                                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7' }]}>
                                   <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Circle cx="12" cy="12" r="5" /><Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></Svg>
                                </View>
                                <View style={styles.textContainer}><Text style={[styles.menuItemText, { color: theme.text }]}>Dark Mode</Text><Text style={[styles.menuItemSubText, { color: theme.subText }]}>Toggle app theme</Text></View>
                                <Switch value={isDarkMode} onValueChange={toggleTheme} />
                            </View>
                            <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                                <View style={[styles.iconContainer, { backgroundColor: '#FFF5F5' }]}><Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2"><Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><Path d="M16 17l5-5-5-5" /><Path d="M21 12H9" /></Svg></View>
                                <View style={styles.textContainer}><Text style={[styles.menuItemText, { color: '#E53E3E' }]}>Logout</Text></View>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            )}

            {apptModalVisible && (
                <Modal visible={apptModalVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={3} reducedTransparencyFallbackColor="white" />
                        <View style={styles.apptModalContent}>
                            <View style={styles.apptHeader}>
                                <TouchableOpacity onPress={() => changeDate(-1)} style={styles.arrowButton}>
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2"><Path d="M15 18l-6-6 6-6" /></Svg>
                                </TouchableOpacity>
                                <Text style={styles.apptDateTitle}>{selectedDate ? new Date(selectedDate).toDateString() : ''}</Text>
                                <TouchableOpacity onPress={() => changeDate(1)} style={styles.arrowButton}>
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2"><Path d="M9 18l6-6-6-6" /></Svg>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ maxHeight: 300 }}>
                                {selectedAppts.length > 0 ? (
                                    selectedAppts.map((a: any, i) => (
                                        <View key={i} style={styles.apptItem}>
                                            <Text style={styles.apptTime}>{new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                            <View>
                                                <Text style={styles.apptName}>{a.provider_id === userInfo.id ? a.customer_name : a.provider_name}</Text>
                                                <Text style={[styles.apptStatus, { color: a.status === 'confirmed' ? 'green' : '#718096' }]}>{a.status}</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noApptText}>No appointments for this date.</Text>
                                )}
                            </ScrollView>

                            <TouchableOpacity style={styles.closeApptButton} onPress={() => setApptModalVisible(false)}>
                                <Text style={styles.closeApptButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    // Absolute Header Layer
    headerBackground: {
        backgroundColor: '#2D3748',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center',
        // overflow: 'hidden' // Removed to allow avatar to slightly overlap if needed, preventing clip
    },
    headerTop: {
        width: '100%',
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 50, // Space for status bar
        zIndex: 20
    },
    headerInfoContainer: {
        position: 'absolute',
        top: 50, // Align with headerTop vertical position roughly, but center horizontally
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 15
    },
    headerNameText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    headerEmailText: { color: '#CBD5E0', fontSize: 10 },
    headerBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 2 },
    headerBadgeText: { color: 'white', fontSize: 10, fontWeight: '600' },

    iconButton: { padding: 5 },

    // QR Code
    qrContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50, // Ensure it's on top of everything
    },
    qrWrapper: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5
    },

    // Avatar Absolute Position
    avatarContainerAbsolute: {
        position: 'absolute',
        top: 220, // Start position slightly overlapping bottom of header
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 30
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#F7FAFC',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5
    },
    avatar: { width: 92, height: 92, borderRadius: 46 },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4A9EFF', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },

    // Scroll Content
    contentContainer: {
        alignItems: 'center',
        paddingBottom: 50,
        paddingTop: 300 // Space for the absolute header + avatar overlap
    },

    infoSection: { alignItems: 'center', marginBottom: 20, width: '100%' },
    editForm: { width: '100%', paddingHorizontal: 40, alignItems: 'center' },
    input: { width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, color: '#2D3748', textAlign: 'center' },

    nameText: { fontSize: 24, fontWeight: 'bold', color: '#2D3748', marginBottom: 5 },
    roleText: { fontSize: 14, color: '#718096' },
    userTypeBadge: { marginTop: 5, backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    userTypeBadgeText: { fontSize: 12, color: '#4A5568', fontWeight: '600' },
    sectionContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 15 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    tagText: { color: '#4A5568', fontSize: 14, fontWeight: '500' },
    addInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    smallInput: { flex: 1, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, marginRight: 10 },
    addButton: { backgroundColor: '#4A9EFF', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    addProductForm: { flexDirection: 'row', alignItems: 'center', marginTop: 10, width: '100%' },
    productListItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F7FAFC', alignItems: 'center' },
    productListItemName: { fontSize: 16, color: '#2D3748' },
    productListItemPrice: { fontSize: 16, fontWeight: 'bold', color: '#4A5568' },
    mainButton: { backgroundColor: '#2D3748', width: '80%', paddingVertical: 18, borderRadius: 25, alignItems: 'center', shadowColor: '#2D3748', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, marginBottom: 20 },
    mainButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    dismissArea: { flex: 1 },
    modalContent: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingBottom: 80, paddingTop: 15, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.15, shadowRadius: 10 },
    modalHeader: { alignItems: 'center', marginBottom: 25, paddingVertical: 10 },
    modalHandle: { width: 50, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3 },
    menuContainer: { marginBottom: 20 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    textContainer: { flex: 1, justifyContent: 'center' },
    menuItemText: { fontSize: 16, color: '#2D3748', fontWeight: '600', marginBottom: 2 },
    menuItemSubText: { fontSize: 12, color: '#A0AEC0' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10, marginLeft: 60 },

    // Calendar Styles
    calendarContainer: {
        width: '100%',
        marginTop: 0,
    },
    calendarTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 10,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    calendarCell: {
        width: (width * 0.9 - 40 - (12 * 4)) / 12, // Approx math for layout
        height: 15,
        borderRadius: 3,
        marginBottom: 4,
    },
    calendarLegend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    legendBox: {
        width: 10,
        height: 10,
        borderRadius: 2,
        marginHorizontal: 2,
    },
    legendText: {
        fontSize: 10,
        color: '#718096',
        marginHorizontal: 4,
    },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    apptModalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 10 },
    apptHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
    arrowButton: { padding: 10 },
    apptDateTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
    apptItem: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
    apptTime: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', width: 80 },
    apptName: { fontSize: 16, color: '#2D3748' },
    apptStatus: { fontSize: 12, textTransform: 'capitalize' },
    noApptText: { color: '#A0AEC0', marginVertical: 20 },
    closeApptButton: { marginTop: 20, backgroundColor: '#2D3748', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    closeApptButtonText: { color: '#fff', fontWeight: '600' },

    // Business Card Styles
    businessCardContainer: { width: '85%', backgroundColor: '#fff', borderRadius: 25, padding: 25, alignItems: 'center', elevation: 15, position: 'relative' },
    closeCardButton: { position: 'absolute', top: 15, right: 15, padding: 5, zIndex: 10 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 20 },
    cardAvatar: { width: 60, height: 60, borderRadius: 30 },
    cardName: { fontSize: 20, fontWeight: 'bold', color: '#2D3748' },
    cardRole: { fontSize: 14, color: '#718096', marginTop: 2 },
    cardQrBody: { alignItems: 'center', marginVertical: 10 },
    cardQrWrapper: { padding: 15, backgroundColor: '#fff', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, borderWidth: 1, borderColor: '#EDF2F7' },
    scanText: { marginTop: 15, color: '#A0AEC0', fontSize: 14 },
    cardFooter: { marginTop: 20, alignItems: 'center', width: '100%', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
    cardEmail: { fontSize: 16, color: '#4A5568', fontWeight: '500', marginBottom: 5 },
    cardPhone: { fontSize: 16, color: '#4A5568' }
});

export default ProfileScreen;
