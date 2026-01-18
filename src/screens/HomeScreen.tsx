import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar as RNStatusBar, Dimensions, ScrollView, Animated, Switch, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { AuthContext } from '../context/AuthContext';
import { DataService } from '../services/DataService';
import { CONFIG } from '../Config';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation, route }: any) => {
    const { userInfo, logout, isDarkMode, toggleTheme } = React.useContext(AuthContext);
    const user = userInfo || route.params?.user || { name: 'User', email: 'user@example.com', user_type: 'individual' };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarAnim = useRef(new Animated.Value(-width * 0.75)).current;

    // Dynamic Data State
    const [dashboardData, setDashboardData] = useState<any[]>([]);
    const [discoverProducts, setDiscoverProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState<any>({ daily: [], monthlyTotal: 0 });

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused && user.id) {
            fetchDashboardData();
        }
    }, [isFocused, user.id]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            if (user.user_type === 'business') {
                // Fetch Products for Business
                const res = await DataService.getProducts(user.id);
                if (res.success) {
                    setDashboardData(res.products);
                }

                // Fetch Reports
                const reportRes = await DataService.getSalesReport(user.id);
                if (reportRes.success) {
                    setReports({ daily: reportRes.daily, monthlyTotal: reportRes.monthlyTotal });
                }
            } else {
                // Fetch Availability/Appointments for Individual
                const res = await DataService.getAvailability(user.id);
                if (res.success) {
                    setDashboardData(res.availability);
                }

                // Fetch Discover Products for Customers
                const prodRes = await DataService.discoverProducts('');
                if (prodRes.success) {
                    setDiscoverProducts(prodRes.products);
                }
            }
        } catch (error) {
            console.log("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSidebar = () => {
        if (isSidebarOpen) {
            Animated.timing(sidebarAnim, { toValue: -width * 0.75, duration: 300, useNativeDriver: true }).start(() => setIsSidebarOpen(false));
        } else {
            setIsSidebarOpen(true);
            Animated.timing(sidebarAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
        }
    };

    const theme = {
        bg: isDarkMode ? '#1A202C' : '#F7FAFC',
        headerBg: isDarkMode ? '#2D3748' : '#F7FAFC',
        text: isDarkMode ? '#F7FAFC' : '#2D3748',
        subText: isDarkMode ? '#A0AEC0' : '#718096',
        cardBg: isDarkMode ? '#2D3748' : '#fff',
        navBg: isDarkMode ? '#171923' : '#fff',
        navBorder: isDarkMode ? '#2D3748' : '#E2E8F0',
        iconColor: isDarkMode ? '#A0AEC0' : '#4A5568',
        // Ensure availability slots have dark mode colors
        slotFreeBg: isDarkMode ? '#2F855A' : '#C6F6D5',
        slotFreeText: isDarkMode ? '#F0FFF4' : '#22543D',
        slotBusyBg: isDarkMode ? '#9B2C2C' : '#FED7D7',
        slotBusyText: isDarkMode ? '#FFF5F5' : '#822727',
    };

    const renderBusinessDashboard = () => (
        <View>
            {/* Financial Summary */}
            <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.summaryLabel, { color: theme.subText }]}>Monthly Sales</Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>PKR {reports.monthlyTotal || 0}</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.summaryLabel, { color: theme.subText }]}>Products</Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>{dashboardData.length}</Text>
                </View>
            </View>

            {/* Daily Sales Chart (Simple Bar) */}
            {reports.daily && reports.daily.length > 0 && (
                <View style={[styles.chartContainer, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 16, marginBottom: 15 }]}>Last 7 Days Sales</Text>
                    <View style={styles.chartBars}>
                        {reports.daily.slice(0, 7).reverse().map((day: any, index: number) => {
                            const maxVal = Math.max(...reports.daily.map((d: any) => d.total));
                            const heightPct = maxVal > 0 ? (day.total / maxVal) * 100 : 0;
                            return (
                                <View key={index} style={styles.barWrapper}>
                                    <View style={[styles.bar, { height: `${Math.max(heightPct, 5)}%`, backgroundColor: '#4A9EFF' }]} />
                                    <Text style={[styles.barLabel, { color: theme.subText }]}>{new Date(day.date).getDate()}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}


            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Products</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Text style={{ color: '#4A9EFF' }}>Manage</Text>
                </TouchableOpacity>
            </View>

            {dashboardData.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: theme.cardBg }]}>
                    <Text style={{ color: theme.subText }}>No products listed yet.</Text>
                </View>
            ) : (
                <View style={styles.productList}>
                    {dashboardData.map((prod: any, index: number) => (
                        <View key={index} style={[styles.productCard, { backgroundColor: theme.cardBg }]}>
                            <View style={styles.productIconPlaceholder}>
                                {prod.image_url ? (
                                    <Image
                                        source={{ uri: `${CONFIG.API_URL}/${prod.image_url}?t=${new Date().getTime()}` }}
                                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                                    />
                                ) : (
                                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2">
                                        <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></Path>
                                        <Path d="M3.27 6.96L12 12.01l8.73-5.05"></Path>
                                        <Line x1="12" y1="22.08" x2="12" y2="12"></Line>
                                    </Svg>
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.productName, { color: theme.text }]}>{prod.name}</Text>
                                <Text style={[styles.productPrice, { color: theme.subText }]}>PKR {prod.price}</Text>
                                <Text style={[styles.productStock, { color: prod.stock_quantity < 5 ? '#E53E3E' : theme.subText }]}>Stock: {prod.stock_quantity || 0}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const renderIndividualDashboard = () => (
        <View>
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Discover Products</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {discoverProducts.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.card, { backgroundColor: theme.cardBg, width: 150, height: 200, marginRight: 15, alignItems: 'flex-start', padding: 10, justifyContent: 'flex-start' }]}
                        onPress={() => navigation.navigate('ProductDetails', { product: item })}
                    >
                        <View style={{ width: '100%', height: 120, backgroundColor: '#EDF2F7', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
                            {item.image_url ? (
                                <Image source={{ uri: `${CONFIG.API_URL}/${item.image_url}` }} style={{ width: '100%', height: '100%' }} />
                            ) : null}
                        </View>
                        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: 'bold', color: theme.text, marginBottom: 5 }}>{item.name}</Text>
                        <Text style={{ fontSize: 12, color: theme.subText }}>{item.price} PKR</Text>
                    </TouchableOpacity>
                ))}
                {discoverProducts.length === 0 && (
                    <Text style={{ color: theme.subText }}>No products found.</Text>
                )}
            </ScrollView>

            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Unlock Availability</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Text style={{ color: '#4A9EFF' }}>Update</Text>
                </TouchableOpacity>
            </View>
            {dashboardData.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: theme.cardBg }]}>
                    <Text style={{ color: theme.subText }}>Set your availability to get bookings.</Text>
                </View>
            ) : (
                <View style={styles.availabilityList}>
                    {dashboardData.map((slot: any, index: number) => (
                        <View key={index} style={[styles.slotCard, { backgroundColor: slot.status === 'free' ? '#C6F6D5' : '#FED7D7' }]}>
                            <Text style={{ color: '#2D3748', fontWeight: '600' }}>{new Date(slot.date).toDateString()}</Text>
                            <Text style={{ color: '#2D3748', fontSize: 12 }}>{slot.status.toUpperCase()}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const getProfilePicUrl = () => {
        if (user?.profile_pic_url) {
            return `${CONFIG.API_URL}/${user.profile_pic_url}?t=${new Date().getTime()}`;
        }
        // Fallback or Random
        return user.user_type === 'business'
            ? 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?fit=crop&w=100&h=100'
            : 'https://randomuser.me/api/portraits/men/32.jpg';
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {isFocused && <RNStatusBar backgroundColor={theme.headerBg} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />}

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.headerBg, shadowColor: isDarkMode ? '#000' : '#000' }]}>
                <Text style={{ position: 'absolute', top: 5, left: 20, zIndex: 100, elevation: 10, fontSize: 14, fontWeight: 'bold', color: theme.text }}>RaabTaa</Text>
                <TouchableOpacity onPress={toggleSidebar} style={{ marginTop: 15 }}>
                    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <Line x1="3" y1="12" x2="21" y2="12"></Line>
                        <Line x1="3" y1="6" x2="21" y2="6"></Line>
                        <Line x1="3" y1="18" x2="21" y2="18"></Line>
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{user.user_type === 'business' ? 'Business Hub' : 'My Dashboard'}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile', { user })}>
                    <View style={styles.profileIconContainer}>
                        <Image source={{ uri: getProfilePicUrl() }} style={{ width: 35, height: 35, borderRadius: 17.5 }} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.welcomeCard, { backgroundColor: user.user_type === 'business' ? '#2B6CB0' : '#4A5568' }]}>
                    <Text style={styles.welcomeTitle}>Hello, {user.name}!</Text>
                    <Text style={styles.welcomeSubtitle}>
                        {user.user_type === 'business'
                            ? 'Manage your shop and sales here.'
                            : 'Share your skills and manage appointments.'}
                    </Text>
                </View>

                {/* Dashboard Content */}
                {user.user_type === 'business' ? renderBusinessDashboard() : renderIndividualDashboard()}

            </ScrollView>

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { backgroundColor: theme.navBg, borderTopColor: theme.navBorder }]}>
                <TouchableOpacity style={styles.navItem}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A9EFF" strokeWidth="2">
                        <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></Path>
                    </Svg>
                    <Text style={[styles.navText, { color: '#4A9EFF' }]}>Home</Text>
                </TouchableOpacity>

                {user.user_type === 'business' && (
                    <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Inventory')}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2">
                            <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></Path>
                            <Line x1="3" y1="6" x2="21" y2="6"></Line>
                            <Path d="M16 10a4 4 0 0 1-8 0"></Path>
                        </Svg>
                        <Text style={[styles.navText, { color: theme.subText }]}>Inventory</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Connections')}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2">
                        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></Path>
                        <Circle cx="9" cy="7" r="4"></Circle>
                        <Path d="M23 21v-2a4 4 0 0 0-3-3.87"></Path>
                        <Path d="M16 3.13a4 4 0 0 1 0 7.75"></Path>
                    </Svg>
                    <Text style={[styles.navText, { color: theme.subText }]}>Network</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile', { user })}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2">
                        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></Path>
                        <Circle cx="12" cy="7" r="4"></Circle>
                    </Svg>
                    <Text style={[styles.navText, { color: theme.subText }]}>Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <TouchableOpacity style={styles.sidebarOverlay} onPress={toggleSidebar} activeOpacity={1} />
            )}

            {/* Sidebar Drawer */}
            <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }], backgroundColor: theme.headerBg }]}>
                <View style={styles.sidebarHeader}>
                    <View style={[styles.profileIconContainer, { width: 60, height: 60, borderRadius: 30, marginBottom: 10, backgroundColor: 'transparent' }]}>
                        <Image source={{ uri: getProfilePicUrl() }} style={{ width: 60, height: 60, borderRadius: 30 }} />
                    </View>
                    <Text style={[styles.sidebarName, { color: theme.text }]}>{user.name}</Text>
                    <Text style={[styles.sidebarEmail, { color: theme.subText }]}>{user.email}</Text>
                    <View style={{ marginTop: 5, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: user.user_type === 'business' ? '#BEE3F8' : '#C6F6D5', borderRadius: 10 }}>
                        <Text style={{ fontSize: 12, color: user.user_type === 'business' ? '#2A4365' : '#22543D', textTransform: 'uppercase' }}>{user.user_type}</Text>
                    </View>
                </View>

                <View style={styles.sidebarMenu}>
                    <TouchableOpacity style={styles.sidebarItem} onPress={() => { toggleSidebar(); navigation.navigate('Profile', { user }); }}>
                        <Text style={[styles.sidebarItemText, { color: theme.text }]}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sidebarItem} onPress={() => { toggleSidebar(); navigation.navigate('Connections'); }}>
                        <Text style={[styles.sidebarItemText, { color: theme.text }]}>My Network</Text>
                    </TouchableOpacity>
                    {user.user_type === 'business' && (
                        <TouchableOpacity style={styles.sidebarItem} onPress={() => { toggleSidebar(); navigation.navigate('Inventory'); }}>
                            <Text style={[styles.sidebarItemText, { color: theme.text }]}>Inventory</Text>
                        </TouchableOpacity>
                    )}

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
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
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
        paddingBottom: 100
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
        marginBottom: 20,
    },
    card: {
        width: (width - 55) / 2,
        height: 100,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        padding: 30,
        alignItems: 'center',
        borderRadius: 10,
    },
    productList: {
        gap: 10,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    productIconPlaceholder: {
        width: 50,
        height: 50,
        backgroundColor: '#EDF2F7',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
    },
    productPrice: {
        fontSize: 14,
        marginTop: 2,
    },
    productStock: {
        fontSize: 12,
        marginTop: 2,
        fontWeight: '500',
    },
    availabilityList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    slotCard: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        borderTopWidth: 1,
        paddingBottom: 20,
        position: 'absolute',
        bottom: 0, left: 0, right: 0
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
        marginBottom: 5,
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
    },
    summaryContainer: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    summaryLabel: {
        fontSize: 14,
        marginBottom: 5,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    chartContainer: {
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
    },
    chartBars: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 100,
        paddingTop: 10,
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        width: 10,
        borderRadius: 5,
    },
    barLabel: {
        fontSize: 10,
        marginTop: 5,
    }
});

export default HomeScreen;
