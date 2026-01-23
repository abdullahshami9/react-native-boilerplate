import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Switch, TextInput, Modal, TouchableWithoutFeedback, Platform, PanResponder, Alert, Linking, RefreshControl } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { BlurView } from "@react-native-community/blur";
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import { CONFIG } from '../Config';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, interpolateColor, Extrapolate, useAnimatedScrollHandler, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import CustomAlert from '../components/CustomAlert';
import SecureLoader from '../components/SecureLoader';
import { useTheme } from '../theme/useTheme';

const { width, height } = Dimensions.get('window');

// Calendar Contribution Graph Component
const ContributionGraph = ({ data, onDateClick, isBusiness }: any) => {
    // Generate dates for the last month to next month (approx 60 days)
    const today = new Date();
    const days = [];
    for (let i = -30; i <= 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        days.push(d);
    }

    const getColor = (dateStr: string) => {
        let count = 0;
        if (isBusiness) {
            // Data is sales report array [{ date: 'YYYY-MM-DD', count: N, total: M }]
            const dayData = data.find((d: any) => d.date.split('T')[0] === dateStr);
            count = dayData ? dayData.count : 0;
        } else {
            // Data is appointments array
            count = data.filter((a: any) => {
                if (!a.appointment_date) return false;
                // SAFE DATE PARSING (Handle MySQL " " vs ISO "T")
                const apptDate = a.appointment_date.replace(' ', 'T').split('T')[0];
                return apptDate === dateStr;
            }).length;
        }

        if (count === 0) return '#EBEDF0';
        if (count === 1) return '#9BE9A8';
        if (count === 2) return '#40C463';
        if (count === 3) return '#30A14E';
        return '#216E39';
    };

    return (
        <View style={styles.calendarContainer}>
            <Text style={styles.calendarTitle}>{isBusiness ? 'Sales Activity' : 'Appointment Activity'}</Text>
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

const DashboardButton = ({ icon, label, onPress, theme }: any) => (
    <TouchableOpacity style={[styles.dashboardBtn, { backgroundColor: theme.inputBg }]} onPress={onPress}>
        <View style={styles.dashboardIcon}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
                {icon}
            </Svg>
        </View>
        <Text style={[styles.dashboardLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
);

const ProfileScreen = ({ navigation, route }: any) => {
    const { logout, userInfo, updateProfile, isDarkMode, toggleTheme } = useContext(AuthContext);

    // VIEW MODE LOGIC
    // If route.params.user exists, we are viewing someone else.
    // Otherwise, we are viewing ourselves (userInfo).
    const paramUser = route?.params?.user;
    const isOwnProfile = !paramUser || (userInfo && paramUser.id === userInfo.id);
    const displayedUser = isOwnProfile ? userInfo : paramUser;

    const [isEditing, setIsEditing] = useState(false);

    // Edit State
    const [editName, setEditName] = useState(displayedUser?.name || '');
    const [editPhone, setEditPhone] = useState(displayedUser?.phone || '');

    // Data State
    const [skills, setSkills] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [education, setEducation] = useState<any[]>([]);
    const [socials, setSocials] = useState<any[]>([]);
    const [businessDetails, setBusinessDetails] = useState<any>(null);

    // New Input State
    const [newSkill, setNewSkill] = useState('');
    const [newEduSchool, setNewEduSchool] = useState('');
    const [newEduDegree, setNewEduDegree] = useState('');
    const [newEduYear, setNewEduYear] = useState('');

    // Add Item Modals
    const [addSkillVisible, setAddSkillVisible] = useState(false);
    const [addEduVisible, setAddEduVisible] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [bookApptVisible, setBookApptVisible] = useState(false);
    const [apptDate, setApptDate] = useState('');
    const [apptTime, setApptTime] = useState('');

    // Modals
    const [modalVisible, setModalVisible] = useState(false);
    const [businessCardVisible, setBusinessCardVisible] = useState(false);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
    const [qrTab, setQrTab] = useState<'my' | 'scan'>('my');

    // Refresh State
    const [refreshing, setRefreshing] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const isBusinessUser = displayedUser?.user_type === 'Business' || displayedUser?.user_type === 'business'; // Handle case sensitivity

    // Reanimated Shared Values
    const scrollY = useSharedValue(0);

    const theme = useTheme();

    useEffect(() => {
        if (displayedUser?.id) {
            fetchData();
            // Sync edit state when user changes
            setEditName(displayedUser.name);
            setEditPhone(displayedUser.phone);
        }
    }, [displayedUser?.id]);

    const fetchData = async () => {
        try {
            // Get Full Profile
            const profileRes = await DataService.getProfile(displayedUser.id);
            if (profileRes.success) {
                setBusinessDetails(profileRes.business);
            }

            if (isBusinessUser) {
                const res = await DataService.getProducts(displayedUser.id);
                if (res.success) setProducts(res.products);

                const salesRes = await DataService.getSalesReport(displayedUser.id);
                if (salesRes.success) setSalesData(salesRes.daily);
            } else {
                const res = await DataService.getSkills(displayedUser.id);
                if (res.success) setSkills(res.skills);

                const eduRes = await DataService.getEducation(displayedUser.id);
                if (eduRes.success) {
                    setEducation(eduRes.education);
                }
            }

            const apptRes = await DataService.getAppointments(displayedUser.id);
            if (apptRes.success) setAppointments(apptRes.appointments);

        } catch (error) {
            console.log("Error fetching profile data", error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setShowLoader(true);
        await fetchData();
        setRefreshing(false);
        setShowLoader(false);
    };

    const handleDateClick = (dateStr: string) => {
        if (isBusinessUser) {
            const dayData = salesData.find((d: any) => d.date.split('T')[0] === dateStr);
            if (dayData && dayData.count > 0) {
                setAlertTitle('Sales Summary');
                setAlertMessage(`Date: ${dateStr}\nOrders: ${dayData.count}\nTotal: $${dayData.total}`);
                setAlertType('success');
                setAlertVisible(true);
            } else {
                setAlertTitle('No Sales');
                setAlertMessage(`No sales recorded for ${dateStr}.`);
                setAlertType('info');
                setAlertVisible(true);
            }
        } else {
            const dayAppointments = appointments.filter((a: any) => {
                if (!a.appointment_date) return false;
                const apptDate = a.appointment_date.replace(' ', 'T').split('T')[0];
                return apptDate === dateStr;
            });

            if (dayAppointments.length > 0) {
                const details = dayAppointments.map((a: any) => {
                    const time = new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const withUser = a.provider_id === displayedUser.id ? a.customer_name : a.provider_name;
                    return `${time} - ${withUser} (${a.status})`;
                }).join('\n');

                setAlertTitle('Appointments');
                setAlertMessage(`Date: ${dateStr}\n\n${details}`);
                setAlertType('info');
                setAlertVisible(true);
            } else {
                setAlertTitle('No Appointments');
                setAlertMessage(`You have no appointments on ${dateStr}.`);
                setAlertType('info');
                setAlertVisible(true);
            }
        }
    };

    const handleChatPress = async () => {
        navigation.navigate('ChatList');
    };

    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const handleEditProfile = () => { closeModal(); setIsEditing(true); };
    const handleLogout = () => { closeModal(); logout(); };

    const handleSaveProfile = async () => {
        try {
            const res = await updateProfile(editName, editPhone);
            if (res.success) {
                setAlertTitle('Success');
                setAlertMessage('Profile updated successfully.');
                setAlertType('success');
                setIsEditing(false);
            } else {
                setAlertTitle('Error');
                setAlertMessage(res.message || 'Failed to update profile.');
                setAlertType('error');
            }
        } catch (e: any) {
            setAlertTitle('Error');
            setAlertMessage(e.message || 'Failed to update profile.');
            setAlertType('error');
        }
        setAlertVisible(true);
    };

    const handleAddSkill = async () => {
        if (!newSkill.trim()) return;
        try {
            const res = await DataService.addSkill(userInfo.id, newSkill);
            if (res.success) {
                setSkills([...skills, res.skill]);
                setNewSkill('');
                setAddSkillVisible(false);
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteSkill = async (id: number) => {
        try {
            const res = await DataService.deleteSkill(id);
            if (res.success) {
                setSkills(skills.filter(s => s.id !== id));
            }
        } catch (e) { console.error(e); }
    };

    const handleAddEducation = async () => {
        if (!newEduSchool.trim() || !newEduDegree.trim()) return;
        try {
            const res = await DataService.addEducation(userInfo.id, { institution: newEduSchool, degree: newEduDegree, year: newEduYear });
            if (res.success) {
                fetchData();
                setNewEduSchool('');
                setNewEduDegree('');
                setNewEduYear('');
                setAddEduVisible(false);
            }
        } catch (e) { console.error(e); }
    };

    const handleBookAppointment = async () => {
        if (!apptDate || !apptTime) return;
        try {
            const combinedDate = `${apptDate} ${apptTime}:00`;
            const res = await DataService.bookAppointment(displayedUser.id, userInfo.id, 0, combinedDate, 30); // 0 service id if generic booking
            if (res.success) {
                setAlertTitle('Success');
                setAlertMessage('Appointment request sent!');
                setAlertType('success');
                setBookApptVisible(false);
                fetchData();
            }
        } catch (e: any) {
            setAlertTitle('Error');
            setAlertMessage(e.message || 'Booking failed');
            setAlertType('error');
        }
        setAlertVisible(true);
    };

    const handleDeleteEdu = async (id: number) => {
        try {
            const res = await DataService.deleteEducation(id);
            if (res.success) {
                setEducation(education.filter(e => e.id !== id));
            }
        } catch (e) {
            console.error('ProfileScreen: Delete Error:', e);
            setAlertTitle('Delete Failed');
            setAlertMessage(JSON.stringify(e));
            setAlertType('error');
            setAlertVisible(true);
        }
    };

    const handleUploadResume = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.images],
            });
            const file = res[0];
            setUploadingResume(true);

            const formData = new FormData();
            formData.append('userId', String(userInfo.id));
            formData.append('image', {
                uri: file.uri,
                type: file.type,
                name: file.name,
            });

            const uploadRes = await axios.post(`${CONFIG.API_URL}/api/upload/resume`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (uploadRes.data.success) {
                setAlertTitle('Success');
                setAlertMessage('Resume uploaded successfully.');
                setAlertType('success');
                setAlertVisible(true);
                fetchData(); // Refresh to get resume_url
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) return;
            console.error(err);
            setAlertTitle('Error');
            setAlertMessage('Failed to upload resume.');
            setAlertType('error');
            setAlertVisible(true);
        } finally {
            setUploadingResume(false);
        }
    };

    const getProfilePicUrl = () => {
        if (displayedUser?.profile_pic_url) {
            return `${CONFIG.API_URL}/${displayedUser.profile_pic_url}?t=${new Date().getTime()}`;
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
            borderBottomLeftRadius: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [40, 20], Extrapolate.CLAMP),
            borderBottomRightRadius: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [40, 20], Extrapolate.CLAMP),
        };
    });

    const headerContentStyle = useAnimatedStyle(() => {
        const textColor = interpolateColor(
            scrollY.value,
            [0, SCROLL_DISTANCE],
            ['#FFFFFF', '#2D3748'] // White to Dark Grey
        );
        return { color: textColor };
    });

    // Opacity for White Icons (Fade Out)
    const whiteIconStyle = useAnimatedStyle(() => {
        return { opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE * 0.5], [1, 0], Extrapolate.CLAMP) };
    });

    // Opacity for Dark Icons (Fade In)
    const darkIconStyle = useAnimatedStyle(() => {
        return { opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE * 0.5], [0, 1], Extrapolate.CLAMP) };
    });

    const qrStyle = useAnimatedStyle(() => {
        // Just fade out the main QR code
        return {
            opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE * 0.5], [1, 0], Extrapolate.CLAMP),
            transform: [{ scale: interpolate(scrollY.value, [0, SCROLL_DISTANCE * 0.5], [1, 0.8], Extrapolate.CLAMP) }]
        };
    });

    const smallQrStyle = useAnimatedStyle(() => {
        // Fade in the small icon
        return {
            opacity: interpolate(scrollY.value, [SCROLL_DISTANCE * 0.6, SCROLL_DISTANCE], [0, 1], Extrapolate.CLAMP),
            transform: [{ scale: interpolate(scrollY.value, [SCROLL_DISTANCE * 0.6, SCROLL_DISTANCE], [0.5, 1], Extrapolate.CLAMP) }]
        };
    });

    const avatarStyle = useAnimatedStyle(() => {
        const scale = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [1, 0.5], Extrapolate.CLAMP);
        const translateY = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -245], Extrapolate.CLAMP);
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
            <Animated.View style={[styles.headerBackground, headerHeightStyle, { backgroundColor: 'rgba(217, 225, 235, 0.9)' }]}>
                <View style={styles.headerTop}>
                    {/* Small Animated QR Icon for Collapsed Header */}
                    <Animated.View style={[{ marginRight: 15, marginTop: 5 }, smallQrStyle]}>
                        <TouchableOpacity onPress={() => setBusinessCardVisible(true)}>
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                                <Path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                <Path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                <Path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                <Path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                <Path d="M10 10h4v4h-4z" />
                                <Path d="M7 17l4-4" />
                            </Svg>
                        </TouchableOpacity>
                    </Animated.View>
                    {isOwnProfile && (
                        <TouchableOpacity onPress={openModal} style={styles.iconButton}>
                            <View>
                                {/* White Icon */}
                                <Animated.View style={[whiteIconStyle, { position: 'absolute' }]}>
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                        <Circle cx="12" cy="12" r="3" />
                                        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </Svg>
                                </Animated.View>
                                {/* Dark Icon */}
                                <Animated.View style={darkIconStyle}>
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2">
                                        <Circle cx="12" cy="12" r="3" />
                                        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </Svg>
                                </Animated.View>
                            </View>
                        </TouchableOpacity>
                    )}
                    {!isOwnProfile && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconButton, { marginRight: 'auto' }]}>
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                <Path d="M19 12H5M12 19l-7-7 7-7" />
                            </Svg>
                        </TouchableOpacity>
                    )}
                </View>

                <Animated.View style={[styles.headerInfoContainer, headerInfoOpacity]}>
                    <Animated.Text style={[styles.headerNameText, headerContentStyle]}>{displayedUser?.name}</Animated.Text>
                    <Animated.Text style={[styles.headerEmailText, headerContentStyle]}>{displayedUser?.email}</Animated.Text>
                </Animated.View>

                <Animated.View style={[styles.qrContainer, qrStyle]}>
                    <TouchableOpacity onPress={() => setBusinessCardVisible(true)}>
                        <View style={styles.qrWrapper}>
                            <QRCode value={`raabtaa://user/${displayedUser?.id}`} size={140} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

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
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['transparent']}
                        tintColor="transparent"
                        progressBackgroundColor="transparent"
                    />
                }
            >
                <View style={styles.spacer} />

                <Animated.View style={[styles.infoSection, bodyInfoOpacity]}>
                    <Text style={[styles.nameText, { color: theme.text }]}>{displayedUser?.name}</Text>
                    <Text style={[styles.roleText, { color: theme.subText }]}>{displayedUser?.email}</Text>
                    <View style={[styles.userTypeBadge, { backgroundColor: isDarkMode ? '#4A5568' : '#E2E8F0' }]}>
                        <Text style={[styles.userTypeBadgeText, { color: isDarkMode ? '#F7FAFC' : '#4A5568' }]}>{isBusinessUser ? 'Business' : 'Individual'}</Text>
                    </View>
                </Animated.View>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.circleBtn, { backgroundColor: theme.buttonBg || (isDarkMode ? '#37404a' : '#EDF2F7') }]} onPress={() => Linking.openURL(`tel:${displayedUser?.phone}`)}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></Svg>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.circleBtn, { backgroundColor: theme.buttonBg || (isDarkMode ? '#37404a' : '#EDF2F7') }]} onPress={handleChatPress}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>
                    </TouchableOpacity>
                    {isBusinessUser && (
                        <View style={styles.locationSnippet}>
                            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2"><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Circle cx="12" cy="10" r="3" /></Svg>
                            <Text style={styles.locationText} numberOfLines={1}>Karachi, PK</Text>
                        </View>
                    )}
                </View>

                {/* Dashboard Section (New) */}
                {isOwnProfile && isBusinessUser && (
                    <View style={[styles.sectionContainer, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Business Dashboard</Text>
                        <View style={styles.dashboardGrid}>
                            {/* Product Biz */}
                            {(!businessDetails?.business_type || businessDetails.business_type === 'Product Based') && (
                                <>
                                    <DashboardButton
                                        icon={<Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />}
                                        label="Inventory"
                                        onPress={() => navigation.navigate('Inventory')}
                                        theme={theme}
                                    />
                                    <DashboardButton
                                        icon={<Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />}
                                        label="Orders"
                                        onPress={() => navigation.navigate('BusinessOrders')}
                                        theme={theme}
                                    />
                                    <DashboardButton
                                        icon={<Path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />}
                                        label="Procurement"
                                        onPress={() => navigation.navigate('Procurement')}
                                        theme={theme}
                                    />
                                </>
                            )}
                            {/* Service Biz */}
                            {(!businessDetails?.business_type || businessDetails.business_type === 'Service Based') && (
                                <>
                                    <DashboardButton
                                        icon={<Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />}
                                        label="My Services"
                                        onPress={() => navigation.navigate('ManageServices')}
                                        theme={theme}
                                    />
                                    <DashboardButton
                                        icon={<Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />}
                                        label="Bookings"
                                        onPress={() => navigation.navigate('ServiceAppointments')}
                                        theme={theme}
                                    />
                                    <DashboardButton
                                        icon={<><Path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><Path d="M1 10h22" /></>}
                                        label="My Cards"
                                        onPress={() => navigation.navigate('BusinessCardEditor')}
                                        theme={theme}
                                    />
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* Customer Dashboard */}
                {isOwnProfile && !isBusinessUser && (
                    <View style={[styles.sectionContainer, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Activity</Text>
                        <View style={styles.dashboardGrid}>
                            <DashboardButton
                                icon={<Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />}
                                label="My Orders"
                                onPress={() => navigation.navigate('CustomerOrders')}
                                theme={theme}
                            />
                            <DashboardButton
                                icon={<Path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />}
                                label="My Cart"
                                onPress={() => navigation.navigate('Checkout')}
                                theme={theme}
                            />
                            <DashboardButton
                                icon={<Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />}
                                label="Appointments"
                                onPress={() => navigation.navigate('ServiceAppointments')}
                                theme={theme}
                            />
                            <DashboardButton
                                icon={<><Path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><Path d="M1 10h22" /></>}
                                label="My Cards"
                                onPress={() => navigation.navigate('BusinessCardEditor')}
                                theme={theme}
                            />
                        </View>
                    </View>
                )}

                {/* Calendar */}
                <View style={[styles.sectionContainer, { backgroundColor: theme.cardBg }]}>
                    <ContributionGraph data={isBusinessUser ? salesData : appointments} onDateClick={handleDateClick} isBusiness={isBusinessUser} />
                </View>

                {/* Skills/Products List (Original) */}
                <View style={[styles.sectionContainer, { backgroundColor: theme.cardBg }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, position: 'relative' }}>
                        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>{isBusinessUser ? 'Product Catalog' : 'Professional Skills'}</Text>
                        {isOwnProfile && !isBusinessUser && (
                            <TouchableOpacity onPress={() => setAddSkillVisible(true)} style={{ position: 'absolute', right: 0, padding: 5 }}>
                                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M12 5v14M5 12h14" /></Svg>
                            </TouchableOpacity>
                        )}
                    </View>
                    {/* Content omitted for brevity, same as before */}
                    {!isBusinessUser && (
                        <View style={styles.tagsContainer}>
                            {skills.map((s, i) => (
                                <View key={i} style={[styles.tag, { backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7', flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
                                    <Text style={[styles.tagText, { color: theme.text }]}>{s.skill_name}</Text>
                                    {isOwnProfile && (
                                        <TouchableOpacity onPress={() => handleDeleteSkill(s.id)}>
                                            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2"><Path d="M18 6L6 18M6 6l12 12" /></Svg>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}
                    {isBusinessUser && (
                        <View>
                            {products.length === 0 && <Text style={{ color: '#aaa' }}>No products found.</Text>}
                            {products.slice(0, 3).map((p, i) => (
                                <View key={i} style={styles.prodRow}>
                                    <Text style={[styles.prodName, { color: theme.text }]}>{p.name}</Text>
                                    <Text style={styles.prodPrice}>{p.price} PKR</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Education Section (Individual) */}
                {!isBusinessUser && (
                    <View style={[styles.sectionContainer, { backgroundColor: theme.cardBg }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, position: 'relative' }}>
                            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Education</Text>
                            {isOwnProfile && (
                                <TouchableOpacity onPress={() => setAddEduVisible(true)} style={{ position: 'absolute', right: 0, padding: 5 }}>
                                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M12 5v14M5 12h14" /></Svg>
                                </TouchableOpacity>
                            )}
                        </View>
                        {education.length === 0 ? (
                            <Text style={{ textAlign: 'center', color: theme.subText }}>No education added.</Text>
                        ) : (
                            education.map((edu, index) => (
                                <View key={index} style={[styles.eduCard, { backgroundColor: isDarkMode ? '#2D3748' : '#fff', borderBottomColor: theme.borderColor }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.eduSchool, { color: theme.text }]}>{edu.institution}</Text>
                                        <Text style={[styles.eduDegree, { color: theme.subText }]}>{edu.degree}</Text>
                                        <Text style={[styles.eduYear, { color: theme.subText }]}>{edu.year}</Text>
                                    </View>
                                    {isOwnProfile && (
                                        <TouchableOpacity onPress={() => handleDeleteEdu(edu.id)} style={{ padding: 5 }}>
                                            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2"><Path d="M18 6L6 18M6 6l12 12" /></Svg>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))
                        )}
                    </View>
                )}

                {/* Resume Section (Individual) */}
                {!isBusinessUser && (
                    <View style={[styles.sectionContainer, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Resume</Text>
                        {displayedUser?.resume_url ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDarkMode ? '#4A5568' : '#EDF2F7', padding: 15, borderRadius: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" style={{ marginRight: 10 }}>
                                        <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <Path d="M14 2v6h6" />
                                        <Path d="M16 13H8" />
                                        <Path d="M16 17H8" />
                                        <Path d="M10 9H8" />
                                    </Svg>
                                    <Text style={{ color: theme.text, fontWeight: '600' }}>Uploaded Resume</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                    <TouchableOpacity onPress={() => Linking.openURL(`${CONFIG.API_URL}/${displayedUser.resume_url}`)} style={{ alignItems: 'center' }}>
                                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A9EFF" strokeWidth="2">
                                            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <Circle cx="12" cy="12" r="3" />
                                        </Svg>
                                        <Text style={{ color: '#4A9EFF', fontSize: 10, marginTop: 2 }}>View</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => Linking.openURL(`${CONFIG.API_URL}/${displayedUser.resume_url}`)} style={{ alignItems: 'center' }}>
                                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2">
                                            <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <Path d="M7 10l5 5 5-5" />
                                            <Path d="M12 15V3" />
                                        </Svg>
                                        <Text style={{ color: '#38A169', fontSize: 10, marginTop: 2 }}>Download</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <Text style={{ textAlign: 'center', color: theme.subText, marginBottom: 10 }}>No resume uploaded.</Text>
                        )}

                        {isOwnProfile && (
                            <TouchableOpacity
                                style={{ marginTop: 15, backgroundColor: theme.buttonBg || (isDarkMode ? '#37404a' : '#EDF2F7'), padding: 12, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                                onPress={handleUploadResume}
                                disabled={uploadingResume}
                            >
                                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" style={{ marginRight: 8 }}>
                                    <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <Path d="M17 8l-5-5-5 5" />
                                    <Path d="M12 3v12" />
                                </Svg>
                                <Text style={{ color: theme.text, fontWeight: 'bold' }}>{uploadingResume ? 'Uploading...' : 'Upload Resume'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

            </Animated.ScrollView>

            {/* Modals ... (Keeping same modals) */}
            {/* Business Card Modal */}
            <Modal visible={businessCardVisible} transparent animationType="fade" onRequestClose={() => setBusinessCardVisible(false)}>
                <View style={styles.modalOverlay}>
                    <BlurView
                        style={StyleSheet.absoluteFill}
                        blurType={isDarkMode ? "dark" : "light"}
                        blurAmount={5}
                        reducedTransparencyFallbackColor="white"
                    />
                    <View style={styles.businessCardContainer}>
                        <TouchableOpacity style={styles.closeCardButton} onPress={() => setBusinessCardVisible(false)}>
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2"><Path d="M18 6L6 18M6 6l12 12" /></Svg>
                        </TouchableOpacity>

                        {/* Modern Pill Tabs */}
                        <View style={{ flexDirection: 'row', marginBottom: 25, backgroundColor: isDarkMode ? '#2D3748' : '#F7FAFC', borderRadius: 30, padding: 5, borderWidth: 1, borderColor: isDarkMode ? '#4A5568' : '#EDF2F7' }}>
                            <TouchableOpacity
                                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 25, backgroundColor: qrTab === 'my' ? (isDarkMode ? '#4A5568' : '#FFFFFF') : 'transparent', elevation: qrTab === 'my' ? 3 : 0, shadowColor: '#000', shadowOpacity: qrTab === 'my' ? 0.1 : 0, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 }}
                                onPress={() => setQrTab('my')}
                            >
                                <Text style={{ fontWeight: '700', fontSize: 14, color: qrTab === 'my' ? (isDarkMode ? '#fff' : '#2D3748') : (isDarkMode ? '#A0AEC0' : '#718096') }}>My QR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 25, backgroundColor: qrTab === 'scan' ? (isDarkMode ? '#4A5568' : '#FFFFFF') : 'transparent', elevation: qrTab === 'scan' ? 3 : 0, shadowColor: '#000', shadowOpacity: qrTab === 'scan' ? 0.1 : 0, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 }}
                                onPress={() => setQrTab('scan')}
                            >
                                <Text style={{ fontWeight: '700', fontSize: 14, color: qrTab === 'scan' ? (isDarkMode ? '#fff' : '#2D3748') : (isDarkMode ? '#A0AEC0' : '#718096') }}>Scan QR</Text>
                            </TouchableOpacity>
                        </View>

                        {qrTab === 'my' ? (
                            <>
                                <View style={styles.cardHeader}>
                                    <Image source={{ uri: getProfilePicUrl() }} style={styles.cardAvatar} />
                                    <View style={{ marginLeft: 15, flex: 1 }}>
                                        <Text style={styles.cardName}>{displayedUser?.name}</Text>
                                        <Text style={styles.cardRole} numberOfLines={1} ellipsizeMode="tail">{displayedUser?.email}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardQrBody}>
                                    <View style={styles.cardQrWrapper}>
                                        <QRCode value={`raabtaa://user/${displayedUser?.id}`} size={180} />
                                    </View>
                                    <Text style={styles.scanText}>Scan to connect</Text>
                                </View>
                            </>
                        ) : (
                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20, width: '100%' }}>
                                <TouchableOpacity
                                    style={{
                                        width: 220,
                                        height: 220,
                                        borderWidth: 2,
                                        borderColor: '#4A9EFF',
                                        borderRadius: 20,
                                        borderStyle: 'dashed',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isDarkMode ? '#2D3748' : '#EBF8FF'
                                    }}
                                    onPress={() => {
                                        setBusinessCardVisible(false);
                                        navigation.navigate('ARCardScanner');
                                    }}
                                >
                                    <Svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4A9EFF" strokeWidth="2">
                                        <Path d="M2 12V7a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5h-5" />
                                        <Path d="M2 12l5 5 5-5" />
                                        <Path d="M2 12v5" />
                                    </Svg>
                                    <Text style={{ marginTop: 15, color: '#4A9EFF', fontWeight: 'bold', fontSize: 16 }}>Launch AR Scanner</Text>
                                </TouchableOpacity>
                                <Text style={{ marginTop: 20, textAlign: 'center', color: isDarkMode ? '#A0AEC0' : '#718096' }}>
                                    Point your camera at a Raabtaa Business Card{'\n'}to see the magic unfold.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                type={alertType}
                onDismiss={() => setAlertVisible(false)}
            />
            {/* ... other modals code ... */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <BlurView
                        style={StyleSheet.absoluteFill}
                        blurType={isDarkMode ? "dark" : "light"}
                        blurAmount={5}
                        reducedTransparencyFallbackColor="white"
                    />
                    <TouchableWithoutFeedback onPress={closeModal}>
                        <View style={styles.dismissArea} />
                    </TouchableWithoutFeedback>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
                        <View style={styles.menuContainer}>
                            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}><Text style={[styles.menuItemText, { color: theme.text }]}>Edit Profile</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { closeModal(); navigation.navigate('BusinessCardEditor'); }}>
                                <Text style={[styles.menuItemText, { color: theme.text }]}>Export Business Card</Text>
                            </TouchableOpacity>

                            <View style={[styles.menuItem, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }]}>
                                <Text style={[styles.menuItemText, { color: theme.text }]}>Dark Mode</Text>
                                <Switch
                                    value={isDarkMode}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: "#E2E8F0", true: "#4A9EFF" }}
                                    thumbColor={"#fff"}
                                />
                            </View>

                            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}><Text style={[styles.menuItemText, { color: 'red' }]}>Logout</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={isEditing}
                transparent
                animationType="slide"
                onRequestClose={() => setIsEditing(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <BlurView
                        style={StyleSheet.absoluteFill}
                        blurType={isDarkMode ? "dark" : "light"}
                        blurAmount={3}
                        reducedTransparencyFallbackColor="white"
                    />
                    <TouchableWithoutFeedback onPress={() => setIsEditing(false)}>
                        <View style={styles.dismissArea} />
                    </TouchableWithoutFeedback>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Edit Profile</Text>

                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ color: theme.subText, marginBottom: 5 }}>Full Name</Text>
                            <TextInput
                                value={editName}
                                onChangeText={setEditName}
                                style={{
                                    borderWidth: 1,
                                    borderColor: theme.borderColor,
                                    borderRadius: 10,
                                    padding: 10,
                                    color: theme.text,
                                    backgroundColor: theme.bg
                                }}
                            />
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: theme.subText, marginBottom: 5 }}>Phone</Text>
                            <TextInput
                                value={editPhone}
                                onChangeText={setEditPhone}
                                keyboardType="phone-pad"
                                style={{
                                    borderWidth: 1,
                                    borderColor: theme.borderColor,
                                    borderRadius: 10,
                                    padding: 10,
                                    color: theme.text,
                                    backgroundColor: theme.bg
                                }}
                            />
                        </View>

                        <TouchableOpacity
                            style={{ backgroundColor: theme.buttonBg || '#4A9EFF', padding: 15, borderRadius: 12, alignItems: 'center' }}
                            onPress={handleSaveProfile}
                        >
                            <Text style={{ color: isDarkMode ? 'white' : '#2D3748', fontWeight: 'bold' }}>Save Changes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ marginTop: 10, padding: 10, alignItems: 'center' }}
                            onPress={() => setIsEditing(false)}
                        >
                            <Text style={{ color: theme.subText }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Skill Modal - Bottom Sheet */}
            <Modal visible={addSkillVisible} transparent animationType="slide" onRequestClose={() => setAddSkillVisible(false)}>
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
                    <TouchableWithoutFeedback onPress={() => setAddSkillVisible(false)}>
                        <View style={styles.dismissArea} />
                    </TouchableWithoutFeedback>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Add Skill</Text>
                        <TextInput
                            placeholder="Skill Name (e.g. React Native)"
                            placeholderTextColor={theme.subText}
                            value={newSkill}
                            onChangeText={setNewSkill}
                            style={{
                                borderWidth: 1,
                                borderColor: theme.borderColor,
                                borderRadius: 10,
                                padding: 10,
                                color: theme.text,
                                marginBottom: 20,
                                backgroundColor: theme.inputBg
                            }}
                        />
                        <TouchableOpacity style={{ backgroundColor: theme.buttonBg || (isDarkMode ? '#37404a' : '#EDF2F7'), padding: 15, borderRadius: 12, alignItems: 'center' }} onPress={handleAddSkill}>
                            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Add Skill</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setAddSkillVisible(false)}>
                            <Text style={{ color: theme.subText }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Add Education Modal - Bottom Sheet */}
            <Modal visible={addEduVisible} transparent animationType="slide" onRequestClose={() => setAddEduVisible(false)}>
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
                    <TouchableWithoutFeedback onPress={() => setAddEduVisible(false)}>
                        <View style={styles.dismissArea} />
                    </TouchableWithoutFeedback>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Add Education</Text>
                        <TextInput
                            placeholder="School / University"
                            placeholderTextColor={theme.subText}
                            value={newEduSchool}
                            onChangeText={setNewEduSchool}
                            style={{ borderWidth: 1, borderColor: theme.borderColor, borderRadius: 10, padding: 10, color: theme.text, marginBottom: 15, backgroundColor: theme.inputBg }}
                        />
                        <TextInput
                            placeholder="Degree"
                            placeholderTextColor={theme.subText}
                            value={newEduDegree}
                            onChangeText={setNewEduDegree}
                            style={{ borderWidth: 1, borderColor: theme.borderColor, borderRadius: 10, padding: 10, color: theme.text, marginBottom: 15, backgroundColor: theme.inputBg }}
                        />
                        <TextInput
                            placeholder="Year (e.g. 2019 - 2023)"
                            placeholderTextColor={theme.subText}
                            value={newEduYear}
                            onChangeText={setNewEduYear}
                            style={{ borderWidth: 1, borderColor: theme.borderColor, borderRadius: 10, padding: 10, color: theme.text, marginBottom: 20, backgroundColor: theme.inputBg }}
                        />
                        <TouchableOpacity style={{ backgroundColor: theme.buttonBg || (isDarkMode ? '#37404a' : '#EDF2F7'), padding: 15, borderRadius: 12, alignItems: 'center' }} onPress={handleAddEducation}>
                            <Text style={{ color: theme.text, fontWeight: 'bold' }}>Add Education</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setAddEduVisible(false)}>
                            <Text style={{ color: theme.subText }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal visible={bookApptVisible} transparent animationType="fade" onRequestClose={() => setBookApptVisible(false)}>
                <View style={styles.settingsModalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Book Appointment</Text>
                        <Text style={{ color: theme.subText, marginBottom: 5 }}>Date (YYYY-MM-DD)</Text>
                        <TextInput
                            placeholder="2026-05-20"
                            placeholderTextColor={theme.subText}
                            value={apptDate}
                            onChangeText={setApptDate}
                            style={{ borderWidth: 1, borderColor: theme.borderColor, borderRadius: 10, padding: 10, color: theme.text, marginBottom: 15 }}
                        />
                        <Text style={{ color: theme.subText, marginBottom: 5 }}>Time (HH:MM)</Text>
                        <TextInput
                            placeholder="14:30"
                            placeholderTextColor={theme.subText}
                            value={apptTime}
                            onChangeText={setApptTime}
                            style={{ borderWidth: 1, borderColor: theme.borderColor, borderRadius: 10, padding: 10, color: theme.text, marginBottom: 20 }}
                        />
                        <TouchableOpacity style={{ backgroundColor: '#4A9EFF', padding: 15, borderRadius: 12, alignItems: 'center' }} onPress={handleBookAppointment}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Confirm Booking</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setBookApptVisible(false)}>
                            <Text style={{ color: theme.subText }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Secure Loader Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showLoader}
                onRequestClose={() => { }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)' }}>
                    <SecureLoader size={100} color={isDarkMode ? '#63B3ED' : '#3182CE'} />
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, alignItems: 'center' },
    headerTop: { width: '100%', paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'flex-end', marginTop: Platform.OS === 'ios' ? 50 : 30, zIndex: 20 },
    iconButton: { padding: 5 },
    headerInfoContainer: { position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center' },
    headerNameText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    headerEmailText: { color: '#CBD5E0', fontSize: 10 },

    qrContainer: { marginTop: 20, alignItems: 'center', justifyContent: 'center', zIndex: 25 },
    qrWrapper: { padding: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 5 },

    avatarContainerAbsolute: { position: 'absolute', top: 240, left: 0, right: 0, alignItems: 'center', zIndex: 30 },
    avatarWrapper: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F7FAFC', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 5 },
    avatar: { width: 92, height: 92, borderRadius: 46 },

    contentContainer: { paddingBottom: 50 },
    spacer: { height: 320 },

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
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tag: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    tagText: { fontSize: 14, fontWeight: '500' },

    prodRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
    prodName: { fontSize: 16 },
    prodPrice: { fontWeight: 'bold', color: '#718096' },
    seeMore: { color: '#007BFF', marginTop: 10, fontWeight: '600' },

    // Dashboard
    dashboardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
    dashboardBtn: { width: '48%', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
    dashboardIcon: { marginBottom: 8 },
    dashboardLabel: { fontSize: 14, fontWeight: '600' },

    // Calendar
    calendarContainer: { width: '100%' },
    calendarTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 10, textAlign: 'center' },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    calendarCell: { width: (width * 0.9 - 40 - (12 * 4)) / 12, height: 15, borderRadius: 3, marginBottom: 4 },

    // Modal
    dismissArea: { flex: 1 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    settingsModalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, elevation: 20, paddingBottom: 50 },
    menuContainer: { gap: 15 },
    menuItem: { paddingVertical: 10, alignItems: 'center' },
    menuItemText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },

    // Education
    eduCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    eduSchool: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    eduDegree: { fontSize: 14, marginBottom: 2 },
    eduYear: { fontSize: 12 },

    // Business Card Modal
    cardQrBody: { alignItems: 'center', marginVertical: 10 },
    cardQrWrapper: { padding: 15, backgroundColor: '#fff', borderRadius: 20, elevation: 3, borderWidth: 1, borderColor: '#EDF2F7' },
    scanText: { marginTop: 15, color: '#A0AEC0', fontSize: 14 },
    cardName: { fontSize: 20, fontWeight: 'bold', color: '#2D3748' },
    cardRole: { fontSize: 14, color: '#718096', marginTop: 2 },
    closeCardButton: { position: 'absolute', top: 15, right: 15, padding: 5, zIndex: 10 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 20 },
    cardAvatar: { width: 60, height: 60, borderRadius: 30 },
    businessCardContainer: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 10 },
});

export default ProfileScreen;
