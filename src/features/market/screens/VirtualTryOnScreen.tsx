import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { AuthContext } from '../../../context/AuthContext';
import Svg, { Path, Circle } from 'react-native-svg';
import Avatar3DViewer from '../../../components/Avatar3DViewer';
import axios from 'axios';
import { CONFIG } from '../../../Config';

const { height } = Dimensions.get('window');

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    isTryOn?: boolean;
    timestamp: Date;
}

interface ClothingItem {
    id: string;
    name: string;
    image: string;
    category: string;
    modelUrl: string; // The URL to the .glb file of the avatar wearing this cloth
}

// Dummy mapping of clothes for demo. In reality this would come from an API/AI endpoint processing the body + clothing mapping.
const DUMMY_CLOTHING: ClothingItem[] = [
    { id: '1', name: 'White T-Shirt', image: 'asset:white_tshirt', category: 'Tops', modelUrl: 'https://models.readyplayer.me/64b73b5b699276c1a8264e03.glb' },
    { id: '2', name: 'Denim Jacket', image: 'asset:denim_jacket', category: 'Outerwear', modelUrl: 'https://models.readyplayer.me/6501304a55e7c3c7d6cca5f8.glb' },
    { id: '3', name: 'Black Hoodie', image: 'asset:black_hoodie', category: 'Tops', modelUrl: 'https://models.readyplayer.me/64f29b8e1da94c4e10df0dac.glb' },
    { id: '4', name: 'Slim Fit Pants', image: 'asset:slim_fit_pants', category: 'Bottoms', modelUrl: 'https://models.readyplayer.me/64b73b5b699276c1a8264e03.glb' },
    { id: '5', name: 'Polo Shirt', image: 'asset:polo_shirt', category: 'Tops', modelUrl: 'https://models.readyplayer.me/6501304a55e7c3c7d6cca5f8.glb' }
];

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes'];

const VirtualTryOnScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const { userInfo } = useContext(AuthContext);

    // Initial avatar logic
    const initialAvatar = userInfo?.avatar_url || 'https://models.readyplayer.me/64b73b5b699276c1a8264e03.glb';

    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(initialAvatar);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'start', text: 'Hi! Select a piece of clothing or type what you are looking for to see it on your avatar.', sender: 'ai', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showOptions, setShowOptions] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    const scrollViewRef = useRef<ScrollView>(null);

    // Scroll to bottom when messages update
    useEffect(() => {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const messageText = inputText.trim();
        const newUserMsg: ChatMessage = {
            id: Date.now().toString(),
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            // Call the actual AI Backend endpoint
            const response = await axios.post(`${CONFIG.API_URL}/api/tryon/chat`, { message: messageText });
            const data = response.data.response;

            setIsTyping(false);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: data.text,
                sender: 'ai',
                isTryOn: !!data.modelUrl,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);

            if (data.modelUrl) {
                setCurrentAvatarUrl(data.modelUrl);
                setShowOptions(false); // Hide options when successfully applied
            } else {
                setShowOptions(true);
            }

        } catch (error) {
            console.error("AI TryOn Error", error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: "Sorry, my AI engine is currently offline. Please try manually selecting an item.",
                sender: 'ai',
                timestamp: new Date()
            }]);
        }
    };

    const handleTryOn = async (item: ClothingItem) => {
        setShowOptions(false);
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: `Try on: ${item.name}`,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // Re-use the backend NLP flow to fetch the dynamic response for this item
            const response = await axios.post(`${CONFIG.API_URL}/api/tryon/chat`, { message: `Try on ${item.name}` });
            const data = response.data.response;

            setIsTyping(false);
            setCurrentAvatarUrl(item.modelUrl || data.modelUrl); // Change 3D Model

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: data.text || `Here is how the ${item.name} looks on you!`,
                sender: 'ai',
                isTryOn: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            // Fallback to client-side swap if network fails
            setIsTyping(false);
            setCurrentAvatarUrl(item.modelUrl);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: `Here is the ${item.name}!`,
                sender: 'ai',
                isTryOn: true,
                timestamp: new Date()
            }]);
        }
    };

    const renderMessage = (msg: ChatMessage) => {
        const isUser = msg.sender === 'user';

        // Define dynamic style directly in component instead of using inline ternary style arrays
        const dynamicStyle = isUser ? { color: '#FFF' } : { color: theme.text };

        return (
            <View key={msg.id} style={[styles.messageBubble, isUser ? styles.messageUser : [styles.messageAi, { backgroundColor: theme.cardBg }]]}>
                <Text style={[styles.messageText, dynamicStyle]}>{msg.text}</Text>
                {msg.isTryOn && (
                    <View style={styles.tryOnSuccess}>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <Path d="M20 6L9 17L4 12" stroke="#48BB78" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text style={styles.tryOnSuccessText}>Applied to Avatar</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.borderColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path d="M15 18L9 12L15 6" stroke={theme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Virtual Try-On</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.mainContent}>
                {/* 3D Viewer Area (Google Doppl Style) */}
                <View style={[styles.viewerContainer, { backgroundColor: theme.inputBg }]}>
                    <Avatar3DViewer avatarUrl={currentAvatarUrl} />
                    <View style={styles.viewerOverlay}>
                        <View style={styles.badge}>
                            <Circle cx="4" cy="4" r="4" fill="#48BB78" />
                            <Text style={styles.badgeText}>Live 3D Rendering</Text>
                        </View>
                    </View>
                </View>

                {/* Chat Area */}
                <KeyboardAvoidingView
                    style={styles.chatContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {messages.map(renderMessage)}
                        {isTyping && (
                            <View style={[styles.messageBubble, styles.messageAi, styles.typingIndicator, { backgroundColor: theme.cardBg }]}>
                                <ActivityIndicator size="small" color={theme.primary} />
                            </View>
                        )}

                        {/* Horizontal Selection Options */}
                        {showOptions && !isTyping && (
                            <View style={styles.optionsContainer}>
                                <View style={styles.categoryFilterContainer}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                                        {CATEGORIES.map(cat => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={[styles.categoryPill, activeCategory === cat ? { backgroundColor: theme.primary, borderColor: theme.primary } : { borderColor: theme.borderColor, backgroundColor: theme.cardBg }]}
                                                onPress={() => setActiveCategory(cat)}
                                            >
                                                <Text style={[styles.categoryText, activeCategory === cat ? { color: '#FFF' } : { color: theme.text }]}>{cat}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <Text style={[styles.optionsTitle, { color: theme.subText }]}>Suggested Items</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsScroll}>
                                    {DUMMY_CLOTHING.filter(item => activeCategory === 'All' || item.category === activeCategory).map(item => (
                                        <TouchableOpacity key={item.id} style={[styles.optionCard, { borderColor: theme.borderColor, backgroundColor: theme.cardBg }]} onPress={() => handleTryOn(item)}>
                                            <View style={[styles.optionImageContainer, { backgroundColor: theme.primary }]}>
                                                <Text style={styles.optionImageText}>{item.name[0]}</Text>
                                            </View>
                                            <Text style={[styles.optionText, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </ScrollView>

                    {/* Input Area */}
                    <View style={[styles.inputArea, { backgroundColor: theme.cardBg, borderTopColor: theme.borderColor }]}>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                            placeholder="Describe a piece of clothing..."
                            placeholderTextColor={theme.subText}
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={handleSend}
                        />
                        <TouchableOpacity style={[styles.sendButton, { backgroundColor: inputText.trim() ? theme.primary : theme.inputBorder }]} onPress={handleSend} disabled={!inputText.trim()}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <Path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSpacer: {
        width: 24,
    },
    mainContent: {
        flex: 1,
        flexDirection: 'column',
    },
    viewerContainer: {
        height: height * 0.45,
        width: '100%',
        position: 'relative',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        zIndex: 10,
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 6,
    },
    viewerOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    chatContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    messageUser: {
        alignSelf: 'flex-end',
        backgroundColor: '#3182CE',
        borderBottomRightRadius: 4,
    },
    messageAi: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    typingIndicator: {
        width: 60,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    tryOnSuccess: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 6,
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    tryOnSuccessText: {
        color: '#48BB78',
        fontSize: 12,
        fontWeight: 'bold',
    },
    optionsContainer: {
        marginTop: 10,
        marginBottom: 20,
    },
    optionsTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 4,
    },
    optionsScroll: {
        paddingRight: 20,
        gap: 12,
    },
    optionCard: {
        width: 100,
        borderWidth: 1,
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
    },
    optionImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    optionImageText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    optionText: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    textInput: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        paddingHorizontal: 20,
        fontSize: 15,
        marginRight: 12,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default VirtualTryOnScreen;