import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { DataService } from '../services/DataService';
import { AuthContext } from '../context/AuthContext';
import { CONFIG } from '../Config';

const ConnectionsScreen = () => {
    const { userInfo } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('connections'); // 'connections' | 'discover'
    const [connections, setConnections] = useState<any[]>([]);
    const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

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
                    // Update UI optimistically or refetch
                    // For discover tab, maybe show 'Requested' or just button changes
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
            : 'https://randomuser.me/api/portraits/men/32.jpg';

        return (
            <View style={styles.card}>
                <Image source={{ uri: imageUrl }} style={styles.avatar} />
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.role}>{item.user_type} • {item.email}</Text>
                </View>
                {activeTab === 'discover' ? (
                    <TouchableOpacity
                        style={[styles.connectButton, isConnected && styles.connectedButton]}
                        onPress={() => handleConnect(item.id, isConnected ? 'accepted' : 'none')}
                    >
                        <Text style={[styles.connectButtonText, isConnected && styles.connectedButtonText]}>
                            {isConnected ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.connectButton, styles.disconnectButton]}
                        onPress={() => handleConnect(item.id, 'accepted')}
                    >
                        <Text style={[styles.connectButtonText, styles.disconnectButtonText]}>
                            Unfollow
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Network</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, activeTab === 'connections' && styles.activeTab]} onPress={() => setActiveTab('connections')}>
                    <Text style={[styles.tabText, activeTab === 'connections' && styles.activeTabText]}>Following</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'discover' && styles.activeTab]} onPress={() => setActiveTab('discover')}>
                    <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>Discover</Text>
                </TouchableOpacity>
            </View>

            {/* Search (only for discover) */}
            {activeTab === 'discover' && (
                <View style={styles.searchContainer}>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" style={styles.searchIcon}>
                        <Circle cx="11" cy="11" r="8" />
                        <Path d="M21 21L16.65 16.65" />
                    </Svg>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
                        placeholderTextColor="#A0AEC0"
                        value={searchText}
                        onChangeText={setSearchText}
                        onSubmitEditing={handleSearch}
                    />
                </View>
            )}

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#2D3748" /></View>
            ) : (
                <FlatList
                    data={activeTab === 'connections' ? connections : discoverUsers}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: '#A0AEC0', marginTop: 50 }}>
                                {activeTab === 'connections' ? "You aren't following anyone yet." : "No users found."}
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
        backgroundColor: '#F7FAFC',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D3748',
    },
    tabs: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
    },
    tab: {
        marginRight: 20,
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#2D3748',
    },
    tabText: {
        fontSize: 16,
        color: '#A0AEC0',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#2D3748',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 50,
        margin: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#2D3748',
        fontSize: 16,
    },
    listContent: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
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
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
    },
    role: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
    },
    connectButton: {
        backgroundColor: '#2D3748',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    connectedButton: {
        backgroundColor: '#E2E8F0',
    },
    disconnectButton: {
        backgroundColor: '#FFF5F5',
    },
    connectButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    connectedButtonText: {
        color: '#4A5568',
    },
    disconnectButtonText: {
        color: '#E53E3E',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default ConnectionsScreen;
