'use client';

import React, { useEffect, useState, useContext, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { AuthContext } from '@/context/AuthContext';
import api from '@/lib/api';
import { StandardLoader } from '@/components/StandardLoader';
import { useRouter } from 'next/navigation';
import { resolveImage, getDefaultImageForType } from '@/utils/imageHelper';
import Image from 'next/image';
import { Send, Image as ImageIcon, Search, ArrowLeft } from 'lucide-react';
import SocketService from '@/lib/socket';

type Chat = {
    id: number;
    user1_id: number;
    user2_id: number;
    last_message: string;
    last_message_at: string;
    user1_name: string;
    user1_pic: string;
    user2_name: string;
    user2_pic: string;
};

type Message = {
    id: number;
    chat_id: number;
    sender_id: number;
    content: string;
    type: 'text' | 'image';
    created_at: string;
};

export default function MessagesPage() {
    const { userInfo, userToken, isLoading: authLoading } = useContext(AuthContext);
    const router = useRouter();
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!authLoading && !userToken) {
            router.push('/auth/login');
            return;
        }
        if (userInfo) {
            fetchChats();
            SocketService.connect(userInfo.id);

            SocketService.onMessage((msg) => {
                 if (selectedChat && msg.chat_id === selectedChat.id) {
                     setMessages(prev => [...prev, msg]);
                     scrollToBottom();
                 }
                 // Update last message in list
                 setChats(prev => prev.map(c =>
                     c.id === msg.chat_id
                     ? { ...c, last_message: msg.content, last_message_at: new Date().toISOString() }
                     : c
                 ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()));
            });
        }

        return () => {
             SocketService.disconnect();
        };
    }, [userInfo, userToken, authLoading, selectedChat]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id);
            SocketService.joinChat(selectedChat.id);
        }
    }, [selectedChat]);

    const fetchChats = async () => {
        try {
            const res = await api.get(`/api/chats/${userInfo?.id}`);
            if (res.data.success) {
                setChats(res.data.chats);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (chatId: number) => {
        try {
            const res = await api.get(`/api/messages/${chatId}`);
            if (res.data.success) {
                setMessages(res.data.messages);
                scrollToBottom();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !selectedChat) return;

        SocketService.sendMessage(selectedChat.id, userInfo!.id, input);
        setInput('');
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const getOtherUser = (chat: Chat) => {
        if (chat.user1_id === userInfo?.id) {
            return { name: chat.user2_name, pic: chat.user2_pic, id: chat.user2_id };
        } else {
            return { name: chat.user1_name, pic: chat.user1_pic, id: chat.user1_id };
        }
    };

    if (authLoading || loading) return <StandardLoader />;

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-junr-dark-bg overflow-hidden">
            <Navbar />
            <div className="flex-1 max-w-7xl mx-auto w-full pt-16 flex overflow-hidden">
                {/* Chat List */}
                <div className={`w-full md:w-1/3 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-junr-blue"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {chats.length === 0 ? (
                             <div className="p-8 text-center text-gray-500 text-sm">No conversations yet.</div>
                        ) : (
                             chats.map(chat => {
                                 const other = getOtherUser(chat);
                                 return (
                                     <button
                                         key={chat.id}
                                         onClick={() => setSelectedChat(chat)}
                                         className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${selectedChat?.id === chat.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                     >
                                         <div className="relative w-12 h-12 flex-shrink-0">
                                             <Image
                                                 src={resolveImage(other.pic, getDefaultImageForType('customer'))}
                                                 alt={other.name}
                                                 fill
                                                 className="rounded-full object-cover"
                                             />
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <div className="flex justify-between items-baseline mb-1">
                                                 <h3 className="font-semibold text-gray-900 dark:text-white truncate">{other.name}</h3>
                                                 <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                     {new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                 </span>
                                             </div>
                                             <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.last_message}</p>
                                         </div>
                                     </button>
                                 );
                             })
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
                    {selectedChat ? (
                        <>
                            {/* Header */}
                            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4 shadow-sm z-10">
                                <button onClick={() => setSelectedChat(null)} className="md:hidden text-gray-500">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="relative w-10 h-10">
                                     <Image
                                         src={resolveImage(getOtherUser(selectedChat).pic, getDefaultImageForType('customer'))}
                                         alt={getOtherUser(selectedChat).name}
                                         fill
                                         className="rounded-full object-cover"
                                     />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{getOtherUser(selectedChat).name}</h3>
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, i) => {
                                    const isMe = msg.sender_id === userInfo?.id;
                                    return (
                                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                                                isMe
                                                ? 'bg-junr-blue text-white rounded-br-none'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-700'
                                            }`}>
                                                {msg.type === 'image' ? (
                                                    <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/${msg.content}`} alt="Attachment" className="rounded-lg max-w-full" />
                                                ) : (
                                                    <p>{msg.content}</p>
                                                )}
                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                <form onSubmit={sendMessage} className="flex gap-2">
                                    <button type="button" className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-junr-blue"
                                    />
                                    <button type="submit" className="p-3 bg-junr-blue text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                             <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Send className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                             </div>
                             <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
