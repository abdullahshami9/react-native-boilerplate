import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { CONFIG } from '../../../Config';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/useTheme';
import { FlashList } from '@shopify/flash-list';
import Img from '../../../shared/components/Img';

export default function ChatListScreen({ navigation }: any) {
    const { userInfo } = useContext(AuthContext);
    const theme = useTheme();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchChats = async () => {
        if (!refreshing) setLoading(true);
        try {
            const res = await axios.get(`${CONFIG.API_URL}/api/chats/${userInfo.id}`);
            if (res.data.success) {
                setChats(res.data.chats);
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

        return (
            <TouchableOpacity
                style={[styles.chatItem, { borderBottomColor: theme.divider }]}
                onPress={() => navigation.navigate('Chat', { chatId: item.id, otherUser })}
            >
                <Img source={{ uri: profileUrl }} style={[styles.avatar, { backgroundColor: theme.inputBg }]} />
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { borderBottomColor: theme.divider, backgroundColor: theme.headerBg }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Messages</Text>
            </View>
            <View style={{ flex: 1 }}>
                <FlashList
                    data={chats}
                    renderItem={renderItem}
                    estimatedItemSize={80}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                        />
                    }
                    ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subText }]}>No conversations yet.</Text>}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, borderBottomWidth: 1 },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    list: { padding: 10 },
    chatItem: { flexDirection: 'row', padding: 15, alignItems: 'center', borderBottomWidth: 1 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    chatInfo: { flex: 1, marginLeft: 15 },
    name: { fontSize: 16, fontWeight: '600' },
    lastMessage: { marginTop: 4 },
    meta: { alignItems: 'flex-end' },
    time: { fontSize: 12 },
    emptyText: { textAlign: 'center', marginTop: 50 }
});
