import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, RefreshControl, Modal } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { CONFIG } from '../Config';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import SecureLoader from '../components/SecureLoader';

import { useTheme } from '../theme/useTheme';

export default function ChatListScreen({ navigation }: any) {
    const { userInfo, isDarkMode } = useContext(AuthContext);
    const theme = useTheme();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 5000); // Polling for list updates as fallback
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
        setShowLoader(true);
        await fetchChats();
        setRefreshing(false);
        setShowLoader(false);
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
                <Image source={{ uri: profileUrl }} style={[styles.avatar, { backgroundColor: theme.inputBg }]} />
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
            <FlatList
                data={chats}
                renderItem={renderItem}
                keyExtractor={(item: any) => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['transparent']}
                        tintColor="transparent"
                        progressBackgroundColor="transparent"
                    />
                }
                ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.subText }]}>No conversations yet.</Text>}
            />

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
