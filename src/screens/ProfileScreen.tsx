import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Switch, TextInput, Modal, TouchableWithoutFeedback, Platform, PanResponder, Alert, Linking } from 'react-native';
import Svg, { Path, Circle, Line, Plus, X, Trash, Rect } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { BlurView } from "@react-native-community/blur";
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import { launchImageLibrary } from 'react-native-image-picker';
import { CONFIG } from '../Config';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolate, useAnimatedScrollHandler, withSpring, withTiming, runOnJS } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Calendar Contribution Graph Component
const ContributionGraph = ({ appointments, onDateClick }: any) => {
    // Generate dates for the last month to next month (approx 60 days)
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
        </View>
    );
};

const ProfileScreen = ({ navigation }: any) => {
    const { logout, userInfo, updateProfile, isDarkMode, toggleTheme } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userInfo?.name || '');
    const [phone, setPhone] = useState(userInfo?.phone || '');

    // Data State
    const [skills, setSkills] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [education, setEducation] = useState<any[]>([]);
    const [socials, setSocials] = useState<any[]>([]);

    // New Input State
    const [newSkill, setNewSkill] = useState('');

    // Modals
    const [modalVisible, setModalVisible] = useState(false);
    const [businessCardVisible, setBusinessCardVisible] = useState(false);
    const [apptModalVisible, setApptModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedAppts, setSelectedAppts] = useState<any[]>([]);

    const isBusinessUser = userInfo?.user_type === 'business';

    // Reanimated Shared Values
    const scrollY = useSharedValue(0);
    const modalY = useSharedValue(height);
    const modalOpacity = useSharedValue(0);

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
        try {
            if (isBusinessUser) {
                const res = await DataService.getProducts(userInfo.id);
                if (res.success) setProducts(res.products);
            } else {
                const res = await DataService.getSkills(userInfo.id);
                if (res.success) setSkills(res.skills);
            }
            const apptRes = await DataService.getAppointments(userInfo.id);
            if (apptRes.success) setAppointments(apptRes.appointments);

            // Fetch extra profile details (Education, Socials) via DataService if endpoint exists or generic
            // For now assume similar pattern or fetch from new endpoints
            // Implementation of DataService.getProfileDetails would be ideal, here we can mock or use axios directly if service not updated
            // Assuming we added getFullProfile to backend
        } catch (error) {
            console.log("Error fetching profile data", error);
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

    const handleSave = async () => {
        try {
            await updateProfile(name, phone);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
        }
    };

    const openModal = () => {
        setModalVisible(true);
        modalY.value = withSpring(0, { damping: 15 });
        modalOpacity.value = withTiming(1, { duration: 300 });
    };

    const closeModal = () => {
        modalY.value = withTiming(height, { duration: 250 });
        modalOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
            if (finished) runOnJS(setModalVisible)(false);
        });
    };

    const handleEditProfile = () => { closeModal(); setIsEditing(true); };
    const handleLogout = () => { closeModal(); logout(); };

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
    const HEADER_MAX_HEIGHT = 320;
    const HEADER_MIN_HEIGHT = 100;
    const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const headerHeightStyle = useAnimatedStyle(() => {
        return {
            height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT], Extrapolate.CLAMP),
            borderBottomLeftRadius: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [40, 0], Extrapolate.CLAMP),
            borderBottomRightRadius: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [40, 0], Extrapolate.CLAMP),
        };
    });

    const qrStyle = useAnimatedStyle(() => {
        const scale = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [1, 0.3], Extrapolate.CLAMP);
        const translateX = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, width / 2 - 50], Extrapolate.CLAMP);
        const translateY = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -90], Extrapolate.CLAMP); // Move up to header

        return {
            transform: [
                { translateX },
                { translateY },
                { scale }
            ]
        };
    });

    const avatarStyle = useAnimatedStyle(() => {
         const scale = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [1, 0.5], Extrapolate.CLAMP);
         const translateY = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -220], Extrapolate.CLAMP);
         const translateX = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -width / 2 + 50], Extrapolate.CLAMP);
         return {
             transform: [{ translateX }, { translateY }, { scale }]
         };
    });

    const headerInfoOpacity = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [SCROLL_DISTANCE * 0.5, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP)
        };
    });

    const bodyInfoOpacity = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE * 0.5], [1, 0], Extrapolate.CLAMP)
        };
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Animated Header */}
            <Animated.View style={[styles.headerBackground, headerHeightStyle, { backgroundColor: '#2D3748' }]}>
                 <View style={styles.headerTop}>
                    <TouchableOpacity onPress={openModal} style={styles.iconButton}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                             <Circle cx="12" cy="12" r="3" />
                             <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </Svg>
                    </TouchableOpacity>
                 </View>

                 {/* Header Compact Info */}
                 <Animated.View style={[styles.headerInfoContainer, headerInfoOpacity]}>
                    <Text style={styles.headerNameText}>{userInfo?.name}</Text>
                    <Text style={styles.headerEmailText}>{userInfo?.email}</Text>
                 </Animated.View>

                 {/* QR Code */}
                 <Animated.View style={[styles.qrContainer, qrStyle]}>
                     <TouchableOpacity onPress={() => setBusinessCardVisible(true)}>
                         <View style={styles.qrWrapper}>
                            <QRCode value={`raabtaa://user/${userInfo?.id}`} size={140} />
                         </View>
                     </TouchableOpacity>
                 </Animated.View>

                 {/* Avatar */}
                 <Animated.View style={[styles.avatarContainerAbsolute, avatarStyle]}>
                    <View style={styles.avatarWrapper}>
                        <Image source={{ uri: getProfilePicUrl() }} style={styles.avatar} />
                    </View>
                 </Animated.View>
            </Animated.View>

            <Animated.ScrollView
                contentContainerStyle={styles.contentContainer}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.spacer} />

                {/* Main Body Info */}
                <Animated.View style={[styles.infoSection, bodyInfoOpacity]}>
                     <Text style={[styles.nameText, { color: theme.text }]}>{userInfo?.name}</Text>
                     <Text style={[styles.roleText, { color: theme.subText }]}>{userInfo?.email}</Text>
                     <View style={[styles.userTypeBadge, { backgroundColor: isDarkMode ? '#4A5568' : '#E2E8F0' }]}>
                        <Text style={[styles.userTypeBadgeText, { color: isDarkMode ? '#F7FAFC' : '#4A5568' }]}>{isBusinessUser ? 'Business' : 'Individual'}</Text>
                    </View>
                </Animated.View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                     <TouchableOpacity style={styles.circleBtn} onPress={() => Linking.openURL(`tel:${userInfo?.phone}`)}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></Svg>
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.navigate('ChatList')}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>
                     </TouchableOpacity>
                     {isBusinessUser && (
                        <View style={styles.locationSnippet}>
                            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2"><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Circle cx="12" cy="10" r="3" /></Svg>
                            <Text style={styles.locationText} numberOfLines={1}>Karachi, PK</Text>
                        </View>
                     )}
                </View>

                {/* Calendar */}
                <View style={[styles.sectionContainer, { backgroundColor: theme.cardBg }]}>
                     <ContributionGraph appointments={appointments} onDateClick={handleDateClick} />
                </View>

                {/* Skills or Products */}
                <View style={[styles.sectionContainer, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{isBusinessUser ? 'Product Catalog' : 'Professional Skills'}</Text>
                    {!isBusinessUser && (
                        <View style={styles.tagsContainer}>
                             {skills.map((s, i) => (
                                 <View key={i} style={[styles.tag, { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7' }]}>
                                     <Text style={[styles.tagText, { color: theme.text }]}>{s.skill_name}</Text>
                                 </View>
                             ))}
                             {skills.length === 0 && <Text style={{color: '#aaa'}}>No skills added yet.</Text>}
                        </View>
                    )}
                    {isBusinessUser && (
                         <View>
                            {products.length === 0 && <Text style={{color: '#aaa'}}>No products found.</Text>}
                            {products.slice(0, 3).map((p, i) => (
                                <View key={i} style={styles.prodRow}>
                                    <Text style={[styles.prodName, { color: theme.text }]}>{p.name}</Text>
                                    <Text style={styles.prodPrice}>{p.price} PKR</Text>
                                </View>
                            ))}
                            <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
                                <Text style={styles.seeMore}>Manage Inventory</Text>
                            </TouchableOpacity>
                         </View>
                    )}
                </View>

                {/* Education (Individual Only) */}
                {!isBusinessUser && (
                    <View style={[styles.sectionContainer, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Education</Text>
                        <Text style={{color: '#aaa'}}>Add your educational background.</Text>
                    </View>
                )}

            </Animated.ScrollView>

            {/* Modals reused from original code but with simplified implementation for brevity in this step */}
            {modalVisible && (
                 <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
                    <TouchableWithoutFeedback onPress={closeModal}><View style={styles.dismissArea} /></TouchableWithoutFeedback>
                    <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalY }], backgroundColor: theme.cardBg }]}>
                        <View style={styles.menuContainer}>
                             <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}><Text style={[styles.menuItemText, {color:theme.text}]}>Edit Profile</Text></TouchableOpacity>
                             <TouchableOpacity style={styles.menuItem} onPress={handleLogout}><Text style={[styles.menuItemText, {color:'red'}]}>Logout</Text></TouchableOpacity>
                        </View>
                    </Animated.View>
                 </View>
            )}

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
                                    <Text style={styles.cardName}>{userInfo?.name}</Text>
                                    <Text style={styles.cardRole}>{isBusinessUser ? 'Business Account' : 'Individual Profile'}</Text>
                                </View>
                            </View>
                            <View style={styles.cardQrBody}>
                                <View style={styles.cardQrWrapper}>
                                    <QRCode value={`raabtaa://user/${userInfo?.id}`} size={180} />
                                </View>
                                <Text style={styles.scanText}>Scan to connect on Raabtaa</Text>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, alignItems: 'center' },
    headerTop: { width: '100%', paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'flex-end', marginTop: 50, zIndex: 20 },
    iconButton: { padding: 5 },
    headerInfoContainer: { position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center' },
    headerNameText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    headerEmailText: { color: '#CBD5E0', fontSize: 10 },

    qrContainer: { marginTop: 20, alignItems: 'center', justifyContent: 'center', zIndex: 15 },
    qrWrapper: { padding: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 5 },

    avatarContainerAbsolute: { position: 'absolute', top: 240, left: 0, right: 0, alignItems: 'center', zIndex: 30 },
    avatarWrapper: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F7FAFC', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 5 },
    avatar: { width: 92, height: 92, borderRadius: 46 },

    contentContainer: { paddingBottom: 50 },
    spacer: { height: 320 }, // Match HEADER_MAX_HEIGHT

    infoSection: { alignItems: 'center', marginBottom: 20, marginTop: 20 },
    nameText: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    roleText: { fontSize: 14 },
    userTypeBadge: { marginTop: 5, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    userTypeBadgeText: { fontSize: 12, fontWeight: '600' },

    actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 20, alignItems: 'center' },
    circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#007BFF', alignItems: 'center', justifyContent: 'center', elevation: 3 },
    locationSnippet: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, gap: 5 },
    locationText: { color: '#718096', fontSize: 12, maxWidth: 100 },

    sectionContainer: { width: '90%', alignSelf: 'center', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tag: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    tagText: { fontSize: 14, fontWeight: '500' },

    prodRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
    prodName: { fontSize: 16 },
    prodPrice: { fontWeight: 'bold', color: '#718096' },
    seeMore: { color: '#007BFF', marginTop: 10, fontWeight: '600' },

    // Calendar
    calendarContainer: { width: '100%' },
    calendarTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 10 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    calendarCell: { width: (width * 0.9 - 40 - (12 * 4)) / 12, height: 15, borderRadius: 3, marginBottom: 4 },

    // Modal
    dismissArea: { flex: 1 },
    modalContent: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, elevation: 20 },
    menuContainer: { gap: 15 },
    menuItem: { paddingVertical: 10 },
    menuItemText: { fontSize: 18, fontWeight: '600' },

    // Business Card Modal
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    businessCardContainer: { width: '85%', backgroundColor: '#fff', borderRadius: 25, padding: 25, alignItems: 'center', elevation: 15 },
    closeCardButton: { position: 'absolute', top: 15, right: 15, padding: 5, zIndex: 10 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 20 },
    cardAvatar: { width: 60, height: 60, borderRadius: 30 },
    cardName: { fontSize: 20, fontWeight: 'bold', color: '#2D3748' },
    cardRole: { fontSize: 14, color: '#718096', marginTop: 2 },
    cardQrBody: { alignItems: 'center', marginVertical: 10 },
    cardQrWrapper: { padding: 15, backgroundColor: '#fff', borderRadius: 20, elevation: 3, borderWidth: 1, borderColor: '#EDF2F7' },
    scanText: { marginTop: 15, color: '#A0AEC0', fontSize: 14 },
});

export default ProfileScreen;
