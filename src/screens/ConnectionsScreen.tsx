import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { DataService } from '../services/DataService';
import { AuthContext } from '../context/AuthContext';
import { CONFIG } from '../Config';

const { width } = Dimensions.get('window');

const ConnectionsScreen = ({ navigation }: any) => {
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('connections'); // 'connections' | 'discover'
    const [connections, setConnections] = useState<any[]>([]);
    const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const theme = {
        bg: isDarkMode ? '#1A202C' : '#F7FAFC',
        text: isDarkMode ? '#F7FAFC' : '#2D3748',
        subText: isDarkMode ? '#A0AEC0' : '#718096',
        cardBg: isDarkMode ? '#2D3748' : '#fff',
        inputBg: isDarkMode ? '#2D3748' : '#fff',
        borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
        headerBg: isDarkMode ? '#2D3748' : '#fff',
        activeTabBg: isDarkMode ? '#4A5568' : '#E2E8F0',
        inactiveTabBg: 'transparent',
        activeTabText: isDarkMode ? '#F7FAFC' : '#2D3748',
        inactiveTabText: isDarkMode ? '#A0AEC0' : '#718096',
        buttonBg: isDarkMode ? '#4A9EFF' : '#3182CE',
        buttonText: '#fff',
        disconnectBg: isDarkMode ? '#742A2A' : '#FED7D7',
        disconnectText: isDarkMode ? '#FC8181' : '#C53030'
    };

    useEffect(() => {
        if (activeTab === 'connections') {
            fetchConnections();
        } else {
            fetchDiscover();
        }
    }, [activeTab]);

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
        const imageUrl = item.profile_pic_url
            ? `${CONFIG.API_URL}/${item.profile_pic_url}`
            : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop';

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
                onPress={() => navigation.navigate('UserProfile', { user: item })} // Navigate to UserProfile stack screen
            >
                <Image source={{ uri: imageUrl }} style={styles.avatar} />
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
                            { backgroundColor: isConnected ? theme.activeTabBg : theme.buttonBg }
                        ]}
                        onPress={() => handleConnect(item.id, isConnected ? 'accepted' : 'none')}
                    >
                        <Text style={[styles.actionButtonText, { color: isConnected ? theme.text : '#fff' }]}>
                            {isConnected ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.disconnectBg }]}
                        onPress={() => handleConnect(item.id, 'accepted')}
                    >
                        <Text style={[styles.actionButtonText, { color: theme.disconnectText }]}>
                            Unfollow
                        </Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.borderColor }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Network</Text>
            </View>

            {/* Custom Tab Bar */}
            <View style={styles.tabContainer}>
                <View style={[styles.tabWrapper, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'connections' && { backgroundColor: theme.activeTabBg }]}
                        onPress={() => setActiveTab('connections')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'connections' ? theme.activeTabText : theme.inactiveTabText }]}>Following</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'discover' && { backgroundColor: theme.activeTabBg }]}
                        onPress={() => setActiveTab('discover')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'discover' ? theme.activeTabText : theme.inactiveTabText }]}>Discover</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search (only for discover) */}
            {activeTab === 'discover' && (
                <View style={styles.searchSection}>
                    <View style={[styles.searchContainer, { backgroundColor: theme.inputBg, borderColor: theme.borderColor }]}>
                        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2" style={styles.searchIcon}>
                            <Circle cx="11" cy="11" r="8" />
                            <Path d="M21 21L16.65 16.65" />
                        </Svg>
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            placeholder="Find people & businesses..."
                            placeholderTextColor={theme.subText}
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                    </View>
                </View>
            )}

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.buttonBg} /></View>
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
    header: {
        paddingTop: 60, // Status bar space
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    tabContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10
    },
    tabWrapper: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
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
