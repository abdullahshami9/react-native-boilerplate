import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { DataService } from '../services/DataService';
import { AuthContext } from '../context/AuthContext';
import { CONFIG } from '../Config';
import { useTheme } from '../theme/useTheme';
import AnimatedSearchHeader from '../components/AnimatedSearchHeader';
import { resolveImage, getDefaultImageForType } from '../utils/ImageHelper';

const { width } = Dimensions.get('window');

const ConnectionsScreen = ({ navigation }: any) => {
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('connections'); // 'connections' | 'discover'
    const [connections, setConnections] = useState<any[]>([]);
    const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const theme = useTheme();

    useEffect(() => {
        if (activeTab === 'connections') {
            fetchConnections();
        } else {
            fetchDiscover();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'discover') {
            const timer = setTimeout(() => {
                fetchDiscover();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchText]);

    const fetchConnections = async () => {
        setLoading(true);
        try {
            const res = await DataService.getConnections(userInfo.id);
            if (res.success) {
                setConnections(res.connections);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDiscover = async () => {
        setLoading(true);
        try {
            const res = await DataService.discoverUsers(searchText, userInfo.id);
            if (res.success) {
                setDiscoverUsers(res.users);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (activeTab === 'discover') {
            fetchDiscover();
        }
    };

    const handleConnect = async (userId: number, currentStatus: string) => {
        try {
            const action = currentStatus === 'accepted' ? 'unfollow' : 'follow';
            const res = await DataService.toggleConnection(userInfo.id, userId, action);
            if (res.success) {
                if (activeTab === 'connections') {
                    fetchConnections();
                } else {
                    fetchDiscover();
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const renderItem = ({ item }: any) => {
        const isConnected = connections.some(c => c.id === item.id);

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
                onPress={() => navigation.navigate('UserProfile', { user: item })}
            >
                <Image source={resolveImage(item.profile_pic_url || getDefaultImageForType(item.user_type === 'business' ? 'business' : 'customer'))} style={styles.avatar} />
                <View style={styles.info}>
                    <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.role, { color: theme.subText }]} numberOfLines={1}>
                        {item.user_type === 'business' ? 'Business Account' : 'Individual'}
                    </Text>
                    {item.email && <Text style={[styles.email, { color: theme.subText }]} numberOfLines={1}>{item.email}</Text>}
                </View>

                {activeTab === 'discover' ? (
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            { backgroundColor: isConnected ? '#E2E8F0' : '#3182CE' } // Use explicit colors or theme logic
                        ]}
                        onPress={() => handleConnect(item.id, isConnected ? 'accepted' : 'none')}
                    >
                        <Text style={[styles.actionButtonText, { color: isConnected ? '#2D3748' : '#fff' }]}>
                            {isConnected ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: isDarkMode ? '#742A2A' : '#FED7D7' }]}
                        onPress={() => handleConnect(item.id, 'accepted')}
                    >
                        <Text style={[styles.actionButtonText, { color: isDarkMode ? '#FC8181' : '#C53030' }]}>
                            Unfollow
                        </Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <AnimatedSearchHeader
                title="Network"
                onBack={() => navigation.goBack()}
                onSearch={() => { handleSearch() }}
                onChangeText={setSearchText}
                placeholder="Find people & businesses..."
                initialValue={searchText}
            />

            {/* Standard Tabs matching ShopScreen */}
            <View style={[styles.tabContainer, { backgroundColor: theme.bg, borderColor: theme.borderColor }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'connections' && styles.activeTab]}
                    onPress={() => setActiveTab('connections')}
                >
                    <Text style={[styles.tabText, activeTab === 'connections' ? { color: theme.text, fontWeight: '600' } : { color: theme.subText }]}>Following</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
                    onPress={() => {
                        setActiveTab('discover');
                        // Auto focus search if needed, but not forcing it
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 'discover' ? { color: theme.text, fontWeight: '600' } : { color: theme.subText }]}>Discover</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#3182CE" /></View>
            ) : (
                <FlatList
                    data={activeTab === 'connections' ? connections : discoverUsers}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="1" style={{ marginBottom: 10 }}>
                                <Circle cx="12" cy="12" r="10"></Circle>
                                <Path d="M16 16s-1.5-2-4-2-4 2-4 2"></Path>
                                <Line x1="9" y1="9" x2="9.01" y2="9"></Line>
                                <Line x1="15" y1="9" x2="15.01" y2="9"></Line>
                            </Svg>
                            <Text style={{ color: theme.subText, fontSize: 16 }}>
                                {activeTab === 'connections' ? "Your network is empty." : "No users found."}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 0,
        borderBottomWidth: 1,
        // Match ShopScreen style exactly if possible
        paddingTop: 0
    },
    tab: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#2D3748', // Or theme.text
    },
    tabText: {
        fontSize: 16,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100, // Bottom Tab space
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        backgroundColor: '#EDF2F7'
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    role: {
        fontSize: 12,
        marginBottom: 2,
    },
    email: {
        fontSize: 10,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginLeft: 10,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50
    }
});

export default ConnectionsScreen;
