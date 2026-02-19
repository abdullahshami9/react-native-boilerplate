import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { CONFIG } from '../../../Config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/useTheme';
import { FlashList } from '@shopify/flash-list';
import Svg, { Path } from 'react-native-svg';
import Img from '../../../shared/components/Img';
import SocketService from '../../../services/SocketService';
import EmptyState from '../../../components/EmptyState';
import SkeletonLoader from '../../../shared/components/SkeletonLoader';

export default function ChatListScreen({ navigation }: any) {
    const { userInfo } = useContext(AuthContext);
    const theme = useTheme();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchChats();

        // Connect to socket if not already connected (SocketService handles singleton)
        SocketService.connect(userInfo.id);

        // Listen for user status changes
        const offStatus = SocketService.onUserStatusChange(({ userId, status }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (status === 'online') {
                    newSet.add(userId);
                } else {
                    newSet.delete(userId);
                }
                return newSet;
            });
        });

        const interval = setInterval(fetchChats, 5000);
        return () => {
            clearInterval(interval);
            offStatus();
        };
    }, []);

    const fetchChats = async () => {
        // Only show full loader on initial load
        if (chats.length === 0 && !refreshing) setLoading(true);
        try {
            const res = await axios.get(`${CONFIG.API_URL}/api/chats/${userInfo.id}`);
            if (res.data.success) {
                setChats(res.data.chats);
                // Initialize online status from API if available
                const newOnline = new Set(onlineUsers);
                res.data.chats.forEach((chat: any) => {
                    const other = getOtherUser(chat);
                    if (chat.is_online || chat.other_user_online) {
                        newOnline.add(other.id);
                    }
                });
                setOnlineUsers(newOnline);
            }
        } catch (error) {
            console.error("Error fetching chats", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchChats();
        setRefreshing(false);
    };

    const getOtherUser = (chat: any) => {
        if (chat.user1_id === userInfo.id) {
            return { name: chat.user2_name, pic: chat.user2_pic, id: chat.user2_id };
        } else {
            return { name: chat.user1_name, pic: chat.user1_pic, id: chat.user1_id };
        }
    };

    const renderItem = ({ item }: any) => {
        const otherUser = getOtherUser(item);
        const profileUrl = otherUser.pic ? `${CONFIG.API_URL}/${otherUser.pic}` : 'https://via.placeholder.com/50';
        const isOnline = onlineUsers.has(otherUser.id);

        return (
            <TouchableOpacity
                style={[styles.chatItem, { borderBottomColor: theme.divider }]}
                onPress={() => navigation.navigate('Chat', { chatId: item.id, otherUser: { ...otherUser, is_online: isOnline } })}
            >
                <View>
                    <Img source={{ uri: profileUrl }} style={[styles.avatar, { backgroundColor: theme.inputBg }]} />
                    <View style={[styles.statusDot, { backgroundColor: isOnline ? '#48BB78' : '#A0AEC0', borderColor: theme.bg }]} />
                </View>
                <View style={styles.chatInfo}>
                    <Text style={[styles.name, { color: theme.text }]}>{otherUser.name}</Text>
                    <Text style={[styles.lastMessage, { color: theme.subText }]} numberOfLines={1}>
                        {item.last_message || 'Start a conversation'}
                    </Text>
                </View>
                <View style={styles.meta}>
                    <Text style={[styles.time, { color: theme.subText }]}>{new Date(item.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && chats.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
                <View style={[styles.header, { borderBottomColor: theme.divider, backgroundColor: theme.bg }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.inputBg }]}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Messages</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ padding: 10 }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <View key={i} style={{ flexDirection: 'row', padding: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.divider }}>
                            <SkeletonLoader width={50} height={50} borderRadius={25} />
                            <View style={{ marginLeft: 15, flex: 1 }}>
                                <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
                                <SkeletonLoader width="90%" height={12} />
                            </View>
                        </View>
                    ))}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { borderBottomColor: theme.divider, backgroundColor: theme.bg }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.inputBg }]}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Messages</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={{ flex: 1 }}>
                <FlashList
                    data={chats}
                    renderItem={renderItem}
                    estimatedItemSize={80}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                        />
                    }
                    ListEmptyComponent={<EmptyState type="chat" message="No conversations yet." />}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backButton: { padding: 5, borderRadius: 20 },
    listContent: { padding: 10 },
    chatItem: { flexDirection: 'row', padding: 15, alignItems: 'center', borderBottomWidth: 1 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
    },
    chatInfo: { flex: 1, marginLeft: 15 },
    name: { fontSize: 16, fontWeight: '600' },
    lastMessage: { marginTop: 4 },
    meta: { alignItems: 'flex-end' },
    time: { fontSize: 12 },
    emptyText: { textAlign: 'center', marginTop: 50 }
});
