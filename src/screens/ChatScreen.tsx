import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import SocketService from '../services/SocketService';
import axios from 'axios';
import { CONFIG } from '../Config';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';

export default function ChatScreen({ route, navigation }: any) {
    const { chatId, otherUser } = route.params;
    const { userInfo } = useContext(AuthContext);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Connect and Join
        SocketService.connect(userInfo.id);
        SocketService.joinChat(chatId);

        // Fetch History
        fetchMessages();

        // Listen for new messages
        SocketService.onMessage((msg) => {
            if (msg.chat_id === chatId) {
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            }
        });

        return () => {
            SocketService.disconnect();
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
        // Optimistic update handled by socket listener usually, but can add here if delay is high
        setInput('');
    };

    const handlePickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            uploadImage(asset);
        }
    };

    const uploadImage = async (file: any) => {
        const formData = new FormData();
        formData.append('image', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || 'chat.jpg'
        });

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
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                    {item.type === 'image' ? (
                        <Image
                            source={{ uri: `${CONFIG.API_URL}/${item.content}` }}
                            style={{ width: 200, height: 200, borderRadius: 10 }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.otherMsgText]}>{item.content}</Text>
                    )}
                    <Text style={styles.timeText}>{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                     <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><Path d="M15 18l-6-6 6-6" /></Svg>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{otherUser.name}</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                contentContainerStyle={styles.list}
            />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={10}>
                <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={handlePickImage} style={styles.attachBtn}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><Path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></Svg>
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Type a message..."
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></Svg>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    backBtn: { padding: 5, marginRight: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    list: { padding: 15, paddingBottom: 20 },
    msgContainer: { marginVertical: 5, flexDirection: 'row' },
    myMsgContainer: { justifyContent: 'flex-end' },
    otherMsgContainer: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
    myBubble: { backgroundColor: '#007BFF', borderBottomRightRadius: 2 },
    otherBubble: { backgroundColor: '#f0f0f0', borderBottomLeftRadius: 2 },
    msgText: { fontSize: 16 },
    myMsgText: { color: '#fff' },
    otherMsgText: { color: '#333' },
    timeText: { fontSize: 10, marginTop: 4, opacity: 0.7, alignSelf: 'flex-end', color: 'inherit' },
    inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center' },
    attachBtn: { marginRight: 10, padding: 5 },
    input: { flex: 1, backgroundColor: '#f8f9fa', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, color: '#333', marginRight: 10 },
    sendBtn: { backgroundColor: '#007BFF', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }
});
