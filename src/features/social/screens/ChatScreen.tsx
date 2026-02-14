import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, Animated } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import SocketService from '../../../services/SocketService';
import axios from 'axios';
import { CONFIG } from '../../../Config';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../../theme/useTheme';

const DoubleTick = ({ read }: { read: boolean }) => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={read ? "#34B7F1" : "#A0AEC0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 6L7 17l-5-5" />
        <Path d="M23 6l-11 11" />
    </Svg>
);

export default function ChatScreen({ route, navigation }: any) {
    const { chatId, otherUser } = route.params;
    const { userInfo } = useContext(AuthContext);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(otherUser.is_online || false);
    const flatListRef = useRef<FlatList>(null);
    const theme = useTheme();

    useEffect(() => {
        // Connect and Join
        SocketService.connect(userInfo.id);
        SocketService.joinChat(chatId);

        // Fetch History
        fetchMessages();

        // Mark as read immediately
        SocketService.markMessagesRead(chatId, userInfo.id);

        // Listen for new messages
        const offMessage = SocketService.onMessage((msg) => {
            if (msg.chat_id === chatId) {
                setMessages(prev => [...prev, msg]);
                scrollToBottom();

                // If message is from other user, mark as read
                if (msg.sender_id !== userInfo.id) {
                     SocketService.markMessagesRead(chatId, userInfo.id);
                }
            }
        });

        // Listen for typing
        const offTyping = SocketService.onTyping((data) => {
            if (data.chatId === chatId && data.userId !== userInfo.id) {
                setIsTyping(true);
                // Clear typing after 3 seconds of no activity
                const timeout = setTimeout(() => setIsTyping(false), 3000);
            }
        });

        // Listen for read receipts
        const offRead = SocketService.onMessagesRead((data) => {
             // If the other user read my messages
             if (data.chatId === chatId && data.userId !== userInfo.id) {
                 setMessages(prev => prev.map(m => m.sender_id === userInfo.id ? { ...m, is_read: true } : m));
             }
        });

        // Listen for online status
        const offStatus = SocketService.onUserStatusChange((data) => {
            if (data.userId === otherUser.id) {
                setIsOnline(data.status === 'online');
            }
        });

        return () => {
            offMessage();
            offTyping();
            offRead();
            offStatus();
            // Do NOT disconnect socket here as it's shared
        };
    }, [chatId]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${CONFIG.API_URL}/api/messages/${chatId}`);
            if (res.data.success) {
                setMessages(res.data.messages);
                scrollToBottom();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const sendMessage = () => {
        if (!input.trim()) return;

        SocketService.sendMessage(chatId, userInfo.id, input);
        setInput('');
    };

    const handleInputChange = (text: string) => {
        setInput(text);
        SocketService.sendTyping(chatId, userInfo.id);
    };

    const handlePickImage = async () => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e: any) => {
                const file = e.target.files[0];
                if (file) {
                    uploadImage(file);
                }
            };
            input.click();
            return;
        }

        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            uploadImage(asset);
        }
    };

    const uploadImage = async (file: any) => {
        const formData = new FormData();

        if (Platform.OS === 'web') {
            formData.append('image', file);
        } else {
            formData.append('image', {
                uri: file.uri,
                type: file.type || 'image/jpeg',
                name: file.fileName || 'chat.jpg'
            });
        }

        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/upload/chat`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                SocketService.sendMessage(chatId, userInfo.id, response.data.filePath, 'image');
            }
        } catch (error) {
            console.error('Upload Error:', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const renderMessage = ({ item }: any) => {
        const isMe = item.sender_id === userInfo.id;
        return (
            <View style={[styles.msgContainer, isMe ? styles.myMsgContainer : styles.otherMsgContainer]}>
                <View style={[styles.bubble, isMe ? { backgroundColor: theme.primary } : { backgroundColor: theme.cardBg }]}>
                    {item.type === 'image' ? (
                        <Image
                            source={{ uri: `${CONFIG.API_URL}/${item.content}` }}
                            style={{ width: 200, height: 200, borderRadius: 10 }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={[styles.msgText, isMe ? { color: '#fff' } : { color: theme.text }]}>{item.content}</Text>
                    )}
                    <View style={styles.metaRow}>
                        <Text style={[styles.timeText, { color: isMe ? 'rgba(255,255,255,0.7)' : theme.subText }]}>
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {isMe && (
                             <View style={{ marginLeft: 4 }}>
                                 <DoubleTick read={item.is_read} />
                             </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.navBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><Path d="M15 18l-6-6 6-6" /></Svg>
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{otherUser.name}</Text>
                    {isOnline && <Text style={{ fontSize: 12, color: '#48BB78' }}>Online</Text>}
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                contentContainerStyle={styles.list}
            />

            {isTyping && (
                <View style={[styles.typingIndicator, { backgroundColor: theme.cardBg }]}>
                     <Text style={{ color: theme.subText, fontSize: 12, fontStyle: 'italic' }}>Typing...</Text>
                </View>
            )}

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={10}>
                <View style={[styles.inputContainer, { borderTopColor: theme.navBorder, backgroundColor: theme.headerBg }]}>
                    <TouchableOpacity onPress={handlePickImage} style={styles.attachBtn}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.subText} strokeWidth="2"><Path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></Svg>
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                        value={input}
                        onChangeText={handleInputChange}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.subText}
                    />
                    <TouchableOpacity onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: theme.primary }]}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></Svg>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
    backBtn: { padding: 5, marginRight: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    list: { padding: 15, paddingBottom: 20 },
    msgContainer: { marginVertical: 5, flexDirection: 'row' },
    myMsgContainer: { justifyContent: 'flex-end' },
    otherMsgContainer: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
    msgText: { fontSize: 16 },
    metaRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
    timeText: { fontSize: 10 },
    inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, alignItems: 'center' },
    attachBtn: { marginRight: 10, padding: 5 },
    input: { flex: 1, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, marginRight: 10 },
    sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    typingIndicator: { padding: 10, marginLeft: 20, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 }
});
