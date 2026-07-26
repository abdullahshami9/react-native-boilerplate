import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Image, StatusBar as RNStatusBar, Switch } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../theme/useTheme';
import PageWrapper from '../components/PageWrapper';
import { resolveImage, getDefaultImageForType } from '../utils/ImageHelper';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation, route }: any) => {
    const { userInfo, logout, isDarkMode, toggleTheme } = useContext(AuthContext);
    const user = userInfo || route.params?.user || { name: 'Investor', email: 'investor@example.com' };
    const theme = useTheme();
    const isFocused = useIsFocused();

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

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {isFocused && <RNStatusBar backgroundColor={theme.headerBg} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />}

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.bg }]}>
                <TouchableOpacity onPress={toggleSidebar} style={{ marginTop: 5 }}>
                    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <Line x1="3" y1="12" x2="21" y2="12"></Line>
                        <Line x1="3" y1="6" x2="21" y2="6"></Line>
                        <Line x1="3" y1="18" x2="21" y2="18"></Line>
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Dashboard</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
                    <View style={styles.profileIconContainer}>
                         <Image
                            source={resolveImage(user.profile_pic_url || getDefaultImageForType('customer'))}
                            style={{ width: 35, height: 35, borderRadius: 17.5 }}
                         />
                    </View>
                </TouchableOpacity>
            </View>

            <PageWrapper contentContainerStyle={styles.content}>
                <View style={[styles.welcomeCard, { backgroundColor: theme.cardBg }]}>
                    <Text style={{ color: theme.subText, fontSize: 14 }}>Welcome back,</Text>
                    <Text style={[styles.welcomeTitle, { color: theme.text }]}>{user.name}</Text>
                </View>

                {/* Primary Balance / Profit */}
                <View style={[styles.balanceContainer, { backgroundColor: '#4A9EFF' }]}>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Total Asset Value</Text>
                    <Text style={{ color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 10 }}>$0.00</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="3">
                            <Path d="M12 19V5M5 12l7-7 7 7"/>
                        </Svg>
                        <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 5 }}>$0.00 (0.00%) Today</Text>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.statLabel, { color: theme.subText }]}>Weekly Profit</Text>
                        <Text style={[styles.statValue, { color: '#38A169' }]}>+$0.00</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBg }]}>
                        <Text style={[styles.statLabel, { color: theme.subText }]}>Active Pool</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>None</Text>
                    </View>
                </View>
            </PageWrapper>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <TouchableOpacity style={styles.sidebarOverlay} onPress={toggleSidebar} activeOpacity={1} />
            )}

            {/* Sidebar Drawer */}
            <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }], backgroundColor: theme.headerBg }]}>
                <View style={styles.sidebarHeader}>
                    <Text style={[styles.sidebarName, { color: theme.text }]}>{user.name}</Text>
                    <Text style={[styles.sidebarEmail, { color: theme.subText }]}>{user.email}</Text>
                </View>

                <View style={styles.sidebarMenu}>
                    {/* Dark Mode Toggle */}
                    <View style={styles.sidebarItemRow}>
                        <Text style={[styles.sidebarItemText, { color: theme.text }]}>Dark Mode</Text>
                        <Switch value={isDarkMode} onValueChange={toggleTheme} />
                    </View>

                    <TouchableOpacity style={[styles.sidebarItem, { marginTop: 20 }]} onPress={() => { toggleSidebar(); logout(); }}>
                        <Text style={[styles.sidebarItemText, { color: '#E53E3E' }]}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    profileIconContainer: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#4A9EFF', justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    welcomeCard: { padding: 15, borderRadius: 15, marginBottom: 20 },
    welcomeTitle: { fontSize: 24, fontWeight: 'bold' },
    balanceContainer: { padding: 25, borderRadius: 15, marginBottom: 20 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
    statCard: { flex: 1, padding: 20, borderRadius: 15, alignItems: 'center' },
    statLabel: { fontSize: 12, marginBottom: 5 },
    statValue: { fontSize: 18, fontWeight: 'bold' },
    sidebarOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
    sidebar: { position: 'absolute', top: 0, bottom: 0, left: 0, width: width * 0.75, zIndex: 20, paddingTop: 50, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 5, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
    sidebarHeader: { alignItems: 'center', marginBottom: 40, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', paddingBottom: 20 },
    sidebarName: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
    sidebarEmail: { fontSize: 14, marginTop: 5, marginBottom: 5 },
    sidebarMenu: { flex: 1 },
    sidebarItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    sidebarItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    sidebarItemText: { fontSize: 16, fontWeight: '500' }
});

export default HomeScreen;
