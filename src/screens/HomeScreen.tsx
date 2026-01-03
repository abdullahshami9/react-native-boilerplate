
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar as RNStatusBar, Dimensions, ScrollView, Animated, Switch } from 'react-native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation, route }: any) => {
    const user = route.params?.user || { name: 'User', email: 'user@example.com' };
    const authContext = React.useContext(AuthContext);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarAnim = useRef(new Animated.Value(-width * 0.75)).current;

    const toggleSidebar = () => {
        if (isSidebarOpen) {
            Animated.timing(sidebarAnim, { toValue: -width * 0.75, duration: 300, useNativeDriver: true }).start(() => setIsSidebarOpen(false));
        } else {
            setIsSidebarOpen(true);
            Animated.timing(sidebarAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
        }
    };

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

    const theme = {
        bg: isDarkMode ? '#1A202C' : '#F7FAFC',
        headerBg: isDarkMode ? '#2D3748' : '#fff',
        text: isDarkMode ? '#F7FAFC' : '#2D3748',
        subText: isDarkMode ? '#A0AEC0' : '#718096',
        cardBg: isDarkMode ? '#2D3748' : '#fff',
        navBg: isDarkMode ? '#171923' : '#fff',
        navBorder: isDarkMode ? '#2D3748' : '#E2E8F0',
        iconColor: isDarkMode ? '#A0AEC0' : '#4A5568',
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <RNStatusBar translucent backgroundColor="transparent" barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <TouchableOpacity onPress={toggleSidebar}>
                    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <Line x1="3" y1="12" x2="21" y2="12"></Line>
                        <Line x1="3" y1="6" x2="21" y2="6"></Line>
                        <Line x1="3" y1="18" x2="21" y2="18"></Line>
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Home</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile', { user })}>
                    <View style={styles.profileIconContainer}>
                        <Text style={styles.profileInitials}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.welcomeCard, { backgroundColor: '#4A5568' }]}>
                    <Text style={styles.welcomeTitle}>Hello, {user.name}!</Text>
                    <Text style={styles.welcomeSubtitle}>Welcome back to your dashboard.</Text>
                </View>

                {/* Grid */}
                <View style={styles.grid}>
                    {['Analytics', 'Reports', 'Settings', 'More'].map((item, index) => (
                        <View key={index} style={[styles.card, { backgroundColor: theme.cardBg }]}>
                            <Text style={[styles.cardText, { color: theme.text }]}>{item}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { backgroundColor: theme.navBg, borderTopColor: theme.navBorder }]}>
                <TouchableOpacity style={styles.navItem}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A9EFF" strokeWidth="2">
                        <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></Path>
                    </Svg>
                    <Text style={[styles.navText, { color: '#4A9EFF' }]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile', { user })}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2">
                        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></Path>
                        <Circle cx="12" cy="7" r="4"></Circle>
                    </Svg>
                    <Text style={[styles.navText, { color: theme.subText }]}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2">
                        <Circle cx="12" cy="12" r="3"></Circle>
                        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></Path>
                    </Svg>
                    <Text style={[styles.navText, { color: theme.subText }]}>Settings</Text>
                </TouchableOpacity>
            </View>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <TouchableOpacity style={styles.sidebarOverlay} onPress={toggleSidebar} activeOpacity={1} />
            )}

            {/* Sidebar Drawer */}
            <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }], backgroundColor: theme.headerBg }]}>
                <View style={styles.sidebarHeader}>
                    <View style={[styles.profileIconContainer, { width: 60, height: 60, borderRadius: 30, marginBottom: 10 }]}>
                        <Text style={[styles.profileInitials, { fontSize: 24 }]}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
                    </View>
                    <Text style={[styles.sidebarName, { color: theme.text }]}>{user.name}</Text>
                    <Text style={[styles.sidebarEmail, { color: theme.subText }]}>{user.email}</Text>
                </View>

                <View style={styles.sidebarMenu}>
                    <TouchableOpacity style={styles.sidebarItem} onPress={() => { toggleSidebar(); navigation.navigate('Profile', { user }); }}>
                        <Text style={[styles.sidebarItemText, { color: theme.text }]}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sidebarItem} onPress={() => { }}>
                        <Text style={[styles.sidebarItemText, { color: theme.text }]}>Settings</Text>
                    </TouchableOpacity>

                    {/* Dark Mode Toggle */}
                    <View style={styles.sidebarItemRow}>
                        <Text style={[styles.sidebarItemText, { color: theme.text }]}>Dark Mode</Text>
                        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
                    </View>

                    <TouchableOpacity style={[styles.sidebarItem, { marginTop: 20 }]} onPress={() => { toggleSidebar(); authContext.logout(); }}>
                        <Text style={[styles.sidebarItemText, { color: '#E53E3E' }]}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    profileIconContainer: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: '#4A9EFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInitials: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    content: {
        padding: 20,
    },
    welcomeCard: {
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    welcomeTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    welcomeSubtitle: {
        color: '#CBD5E0',
        fontSize: 14,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    card: {
        width: (width - 55) / 2,
        height: 120,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardText: {
        fontSize: 16,
        fontWeight: '500',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        borderTopWidth: 1,
        paddingBottom: 20,
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '500',
    },
    sidebarOverlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 10,
    },
    sidebar: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0,
        width: width * 0.75,
        zIndex: 20,
        paddingTop: 50,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    sidebarHeader: {
        alignItems: 'center',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        paddingBottom: 20,
    },
    sidebarName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    sidebarEmail: {
        fontSize: 14,
        marginTop: 5,
    },
    sidebarMenu: {
        flex: 1,
    },
    sidebarItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    sidebarItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    sidebarItemText: {
        fontSize: 16,
        fontWeight: '500',
    }
});

export default HomeScreen;

