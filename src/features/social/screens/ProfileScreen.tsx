import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Switch, TextInput, Modal, TouchableWithoutFeedback, Platform, PanResponder, Alert, Linking, RefreshControl } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { BlurView } from "@react-native-community/blur";
import { AuthContext } from '../../../context/AuthContext';
import { DataService } from '../../../services/DataService';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import { CONFIG } from '../../../Config';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, interpolateColor, Extrapolate, useAnimatedScrollHandler, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import CustomAlert from '../../../components/CustomAlert';
import StandardLoader from '../../../components/StandardLoader';
import { useTheme } from '../../../theme/useTheme';
import { resolveImage, getDefaultImageForType } from '../../../utils/ImageHelper';
import SocketService from '../../../services/SocketService';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

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

    const theme = useTheme();

    return (
        <View style={styles.calendarContainer}>
            <Text style={[styles.calendarTitle, { color: theme.text }]}>{isBusiness ? 'Sales Activity' : 'Appointment Activity'}</Text>
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
                                isToday && { borderWidth: 1, borderColor: '#ff0000ff' }
                            ]}
                            onPress={() => onDateClick(dateStr)}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const DashboardButton = ({ icon, label, onPress, theme, badge }: any) => (
    <TouchableOpacity style={[styles.dashboardBtn, { backgroundColor: theme.inputBg, position: 'relative' }]} onPress={onPress}>
        {badge > 0 && (
            <View style={{ position: 'absolute', top: 5, right: 5, backgroundColor: '#E53E3E', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, zIndex: 10 }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{badge}</Text>
            </View>
        )}
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
    const viewAsGuest = route?.params?.viewAsGuest;
    // We are viewing our own profile IF:
    // 1. No paramUser passed (default tab view)
    // 2. OR paramUser ID matches our ID AND we are NOT in 'viewAsGuest' mode
    const isOwnProfile = (!paramUser || (userInfo && paramUser.id === userInfo.id)) && !viewAsGuest;

    // Use local user state to support dynamic updates (pic, resume) without full context reload
    const [localUser, setLocalUser] = useState(isOwnProfile ? userInfo : paramUser);
    const displayedUser = localUser; // Use this everywhere

    const [isEditing, setIsEditing] = useState(false);

    // Edit State
    const [editName, setEditName] = useState(displayedUser?.name || '');
    const [editPhone, setEditPhone] = useState(displayedUser?.phone || '');
    const [isPrivateProfile, setIsPrivateProfile] = useState(displayedUser?.is_private === 1 || displayedUser?.is_private === true);

    // Data State
    const [skills, setSkills] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [education, setEducation] = useState<any[]>([]);
    const [socials, setSocials] = useState<any[]>([]);
    const [businessDetails, setBusinessDetails] = useState<any>(null);
    const [counts, setCounts] = useState<any>({ sales_pending: 0, purchases_pending: 0, appointments_upcoming: 0, messages_active: 0 });

    // Online Status
    const [isOnline, setIsOnline] = useState(displayedUser?.is_online || false);

    // New Input State
    const [newSkill, setNewSkill] = useState('');
    const [newEduSchool, setNewEduSchool] = useState('');
    const [newEduDegree, setNewEduDegree] = useState('');
    const [newEduYear, setNewEduYear] = useState('');
    const [newEduType, setNewEduType] = useState('Degree'); // Degree, Certificate, Diploma

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
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null); // For confirmations
    const [qrTab, setQrTab] = useState<'my' | 'scan'>('my');

    // Refresh State
    const [refreshing, setRefreshing] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const isBusinessUser = displayedUser?.user_type === 'Business' || displayedUser?.user_type === 'business'; // Handle case sensitivity

    // Reanimated Shared Values
    const scrollY = useSharedValue(0);

    const theme = useTheme();
    const [isRestricted, setIsRestricted] = useState(false);

    useEffect(() => {
        if (displayedUser?.id) {
            fetchData();
            // Sync edit state when user changes
            setEditName(displayedUser.name);
            setEditPhone(displayedUser.phone);
            setIsPrivateProfile(displayedUser.is_private === 1 || displayedUser.is_private === true);

            let offStatus = () => {};
            // Listen for online status if viewing another user
            if (!isOwnProfile) {
                SocketService.connect(userInfo.id);
                offStatus = SocketService.onUserStatusChange(({ userId, status }) => {
                    if (userId === displayedUser.id) {
                        setIsOnline(status === 'online');
                    }
                });
            }

            return () => {
                offStatus();
            }
        }
    }, [displayedUser?.id]);

    const fetchData = async () => {
        try {
            // Get Full Profile
            const profileRes = await DataService.getProfile(displayedUser.id);
            if (profileRes.success) {
                setBusinessDetails(profileRes.business);
                if (profileRes.user) {
                    setLocalUser(profileRes.user);
                }

                // Handle Restricted Profile
                if (profileRes.is_restricted) {
                    setIsRestricted(true);
                    setSkills([]);
                    setEducation([]);
                    setProducts([]);
                    setAppointments([]);
                    return; // Stop fetching other data
                } else {
                    setIsRestricted(false);
                }
            }

            if (isBusinessUser) {
                const res = await DataService.getProducts(displayedUser.id);
                if (res.success) setProducts(res.products);

                const srvRes = await DataService.getServices(displayedUser.id);
                if (srvRes.success) setServices(srvRes.services);

                if (isOwnProfile) {
                    const salesRes = await DataService.getSalesReport(displayedUser.id);
                    if (salesRes.success) setSalesData(salesRes.daily);
                }
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

            if (isOwnProfile) {
                const countsRes = await DataService.getUserCounts(displayedUser.id);
                if (countsRes.success) {
                    setCounts(countsRes);
                }
            }

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
        if (isOwnProfile) {
            navigation.navigate('ChatList');
        } else {
            try {
                const res = await DataService.initiateChat(userInfo.id, displayedUser.id);
                if (res.success) {
                    navigation.navigate('Chat', { chatId: res.chatId, otherUser: { id: displayedUser.id, name: displayedUser.name, pic: displayedUser.profile_pic_url, is_online: isOnline } });
                }
            } catch (e) {
                console.error("Chat Error", e);
            }
        }
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
            const res = await DataService.addEducation(userInfo.id, { institution: newEduSchool, degree: newEduDegree, year: newEduYear, type: newEduType });
            if (res.success) {
                fetchData();
                setNewEduSchool('');
                setNewEduDegree('');
                setNewEduYear('');
                setNewEduType('Degree');
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

    const promptDeleteEdu = (id: number) => {
        setAlertTitle('Remove Education');
        setAlertMessage('Are you sure you want to remove this education?');
        setAlertType('info');
        setConfirmAction(() => () => handleDeleteEdu(id)); // Closure to capture ID
        setAlertVisible(true);
    };

    const handleDeleteEdu = async (id: number) => {
        try {
            const res = await DataService.deleteEducation(id);
            if (res.success) {
                setEducation(education.filter(e => e.id !== id));
                setAlertVisible(false);
            }
        } catch (e) {
            console.error('ProfileScreen: Delete Error:', e);
            // If error, we show error alert (overriding the confirm one)
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

    const handleUploadProfilePic = async () => {
        if (isWeb) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e: any) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const res = await DataService.uploadProfilePic(userInfo.id, file);
                        if (res.success) {
                            setAlertTitle('Success');
                            setAlertMessage('Profile picture updated!');
                            setAlertType('success');
                            setAlertVisible(true);
                            fetchData();
                        }
                    } catch (err: any) {
                        setAlertTitle('Error');
                        setAlertMessage('Failed to upload picture.');
                        setAlertType('error');
                        setAlertVisible(true);
                    }
                }
            };
            input.click();
            return;
        }

        try {
            const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const res = await DataService.uploadProfilePic(userInfo.id, asset);
                if (res.success) {
                    setAlertTitle('Success');
                    setAlertMessage('Profile picture updated!');
                    setAlertType('success');
                    setAlertVisible(true);
                    fetchData(); // Refresh profile to see new pic
                }
            }
        } catch (e: any) {
            console.error("Profile Pic Upload Error", e);
            setAlertTitle('Error');
            setAlertMessage('Failed to upload picture.');
            setAlertType('error');
            setAlertVisible(true);
        }
    };

    const getProfileSource = () => {
        return resolveImage(displayedUser?.profile_pic_url || getDefaultImageForType(isBusinessUser ? 'business' : 'customer'));
    };

    const getResumeUrl = () => {
        if (!displayedUser?.resume_url) return '';
        if (displayedUser.resume_url.startsWith('http')) return displayedUser.resume_url;

        // Sanitize URL construction
        const baseUrl = CONFIG.API_URL.replace(/\/$/, '');
        const path = displayedUser.resume_url.replace(/^\//, '');
        return `${baseUrl}/${path}`;
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
            ['#FFFFFF', isDarkMode ? '#FFFFFF' : '#2D3748'] // White to Dark Grey (or White in Dark Mode)
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

    const renderHeader = () => {
        if (isWeb) {
            // Static Header for Web
            return (
                <View style={[styles.headerBackground, { position: 'relative', height: 320, backgroundColor: isDarkMode ? 'rgba(32, 44, 51, 0.95)' : 'rgba(217, 225, 235, 0.9)', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }]}>
                    <View style={styles.headerTop}>
                        {isOwnProfile && (
                            <TouchableOpacity onPress={openModal} style={styles.iconButton}>
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? '#fff' : '#2D3748'} strokeWidth="2">
                                    <Circle cx="12" cy="12" r="3" />
                                    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </Svg>
                            </TouchableOpacity>
                        )}
                        {!isOwnProfile && (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconButton, { marginRight: 'auto' }]}>
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? '#fff' : '#2D3748'} strokeWidth="2">
                                    <Path d="M19 12H5M12 19l-7-7 7-7" />
                                </Svg>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={[styles.qrContainer]}>
                        <TouchableOpacity onPress={() => setBusinessCardVisible(true)}>
                            <View style={[styles.qrWrapper, { backgroundColor: isDarkMode ? '#2D3748' : '#fff', elevation: isDarkMode ? 0 : 5 }]}>
                                <QRCode value={`raabtaa://user/${displayedUser?.id}`} size={140} color={isDarkMode ? 'white' : 'black'} backgroundColor={isDarkMode ? '#2D3748' : 'white'} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.avatarContainerAbsolute, { transform: [{ translateY: 0 }] }]}>
                        <TouchableOpacity onPress={isOwnProfile ? handleUploadProfilePic : undefined} activeOpacity={isOwnProfile ? 0.8 : 1}>
                            <View style={[styles.avatarWrapper, { backgroundColor: isDarkMode ? '#2D3748' : '#fff', borderColor: isDarkMode ? 'transparent' : '#F7FAFC', elevation: isDarkMode ? 0 : 5 }]}>
                                <Image source={getProfileSource()} style={styles.avatar} />
                                {isOwnProfile && (
                                    <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4A9EFF', borderRadius: 12, padding: 4 }}>
                                        <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <Circle cx="12" cy="13" r="4" />
                                        </Svg>
                                    </View>
                                )}
                                {!isOwnProfile && (
                                     <View style={{ position: 'absolute', bottom: 5, right: 5, width: 16, height: 16, borderRadius: 8, backgroundColor: isOnline ? '#48BB78' : '#A0AEC0', borderWidth: 2, borderColor: isDarkMode ? '#2D3748' : '#fff' }} />
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <Animated.View style={[styles.headerBackground, headerHeightStyle, { backgroundColor: isDarkMode ? 'rgba(32, 44, 51, 0.95)' : 'rgba(217, 225, 235, 0.9)' }]}>
                <View style={styles.headerTop}>
                    {/* Small Animated QR Icon for Collapsed Header */}
                    <Animated.View style={[{ marginRight: 15, marginTop: 5 }, smallQrStyle]}>
                        <TouchableOpacity onPress={() => setBusinessCardVisible(true)}>
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? '#fff' : '#2D3748'} strokeWidth="2">
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
                                        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </Svg>
                                </Animated.View>
                                {/* Dark Icon (Visible on Scroll/White Header, or Dark Header in Dark Mode -> needs to be white if dark mode) */}
                                <Animated.View style={darkIconStyle}>
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? '#fff' : '#2D3748'} strokeWidth="2">
                                        <Circle cx="12" cy="12" r="3" />
                                        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
                        <View style={[styles.qrWrapper, { backgroundColor: isDarkMode ? '#2D3748' : '#fff', elevation: isDarkMode ? 0 : 5 }]}>
                            <QRCode value={`raabtaa://user/${displayedUser?.id}`} size={140} color={isDarkMode ? 'white' : 'black'} backgroundColor={isDarkMode ? '#2D3748' : 'white'} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.avatarContainerAbsolute, avatarStyle]}>
                    <TouchableOpacity onPress={isOwnProfile ? handleUploadProfilePic : undefined} activeOpacity={isOwnProfile ? 0.8 : 1}>
                        <View style={[styles.avatarWrapper, { backgroundColor: isDarkMode ? '#2D3748' : '#fff', borderColor: isDarkMode ? 'transparent' : '#F7FAFC', elevation: isDarkMode ? 0 : 5 }]}>
                            <Image source={getProfileSource()} style={styles.avatar} />
                            {isOwnProfile && (
                                <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4A9EFF', borderRadius: 12, padding: 4 }}>
                                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <Circle cx="12" cy="13" r="4" />
                                    </Svg>
                                </View>
                            )}
                             {!isOwnProfile && (
                                <View style={{ position: 'absolute', bottom: 5, right: 5, width: 16, height: 16, borderRadius: 8, backgroundColor: isOnline ? '#48BB78' : '#A0AEC0', borderWidth: 2, borderColor: isDarkMode ? '#2D3748' : '#fff' }} />
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        );
    }
// ... rest of the file
