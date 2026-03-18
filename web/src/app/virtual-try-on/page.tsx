'use client';

import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Send, Image as ImageIcon, Loader2, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import Script from 'next/script';

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
    modelUrl: string;
}

const DUMMY_CLOTHING: ClothingItem[] = [
    { id: '1', name: 'White T-Shirt', image: 'asset:white_tshirt', category: 'Tops', modelUrl: 'https://models.readyplayer.me/64b73b5b699276c1a8264e03.glb' },
    { id: '2', name: 'Denim Jacket', image: 'asset:denim_jacket', category: 'Outerwear', modelUrl: 'https://models.readyplayer.me/6501304a55e7c3c7d6cca5f8.glb' },
    { id: '3', name: 'Black Hoodie', image: 'asset:black_hoodie', category: 'Tops', modelUrl: 'https://models.readyplayer.me/64f29b8e1da94c4e10df0dac.glb' },
    { id: '4', name: 'Slim Fit Pants', image: 'asset:slim_fit_pants', category: 'Bottoms', modelUrl: 'https://models.readyplayer.me/64b73b5b699276c1a8264e03.glb' },
    { id: '5', name: 'Polo Shirt', image: 'asset:polo_shirt', category: 'Tops', modelUrl: 'https://models.readyplayer.me/6501304a55e7c3c7d6cca5f8.glb' }
];

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes'];

export default function VirtualTryOnPage() {
    const { userInfo } = useContext(AuthContext);

    // Base Avatar logic
    const initialAvatar = userInfo?.avatar_url || 'https://models.readyplayer.me/64b73b5b699276c1a8264e03.glb';
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(initialAvatar);

    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'start', text: 'Hi! Select a piece of clothing or type what you are looking for to see it on your avatar.', sender: 'ai', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showOptions, setShowOptions] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Handle initial hydration mismatch on next.js
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tryon/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText })
            });

            if (!res.ok) throw new Error('API Error');

            const result = await res.json();
            const data = result.response;

            setIsTyping(false);

            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: data.text,
                sender: 'ai',
                isTryOn: !!data.modelUrl,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiResponse]);

            if (data.modelUrl) {
                setCurrentAvatarUrl(data.modelUrl);
                setShowOptions(false);
            } else {
                setShowOptions(true);
            }
        } catch (error) {
            console.error("AI Error:", error);
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tryon/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Try on ${item.name}` })
            });

            if (!res.ok) throw new Error('API Error');

            const result = await res.json();
            const data = result.response;

            setIsTyping(false);
            setCurrentAvatarUrl(item.modelUrl || data.modelUrl);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: data.text || `Here is how the ${item.name} looks on you!`,
                sender: 'ai',
                isTryOn: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            // Fallback
            setIsTyping(false);
            setCurrentAvatarUrl(item.modelUrl);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: `Here is the ${item.name}!`,
                sender: 'ai',
                isTryOn: true,
                timestamp: new Date()
            }]);
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex h-[calc(100vh-64px)] w-full bg-gray-50 dark:bg-junr-dark-bg overflow-hidden">
            <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js" strategy="beforeInteractive" />

            {/* Left Panel: 3D Avatar Viewer */}
            <div className="w-1/2 h-full border-r border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 relative">
                {/* Embedded Model Viewer */}
                <div className="w-full h-full">
                    {/* @ts-ignore */}
                    <model-viewer
                        src={currentAvatarUrl}
                        alt="3D Avatar"
                        auto-rotate="true"
                        camera-controls="true"
                        shadow-intensity="1"
                        style={{ width: '100%', height: '100%', background: '#1a1a2e', outline: 'none' }}
                    ></model-viewer>
                </div>

                <div className="absolute top-4 left-4">
                    <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 flex items-center gap-2 shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Live 3D Rendering</span>
                    </div>
                </div>

                <div className="absolute bottom-4 right-4">
                    <button onClick={() => setCurrentAvatarUrl(initialAvatar)} className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Reset Avatar">
                        <RefreshCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Right Panel: Chat Interface */}
            <div className="w-1/2 h-full flex flex-col bg-white dark:bg-gray-900">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Customizer</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Describe an outfit or select one below</p>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                                msg.sender === 'user'
                                    ? 'bg-junr-blue text-white rounded-br-none shadow-md shadow-junr-blue/20'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-700'
                            }`}>
                                <p className="text-[15px] leading-relaxed">{msg.text}</p>
                                {msg.isTryOn && (
                                    <div className="mt-3 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-800/30 w-fit">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-xs font-bold">Applied to Avatar</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none px-5 py-4 border border-gray-200 dark:border-gray-700">
                                <Loader2 className="w-5 h-5 animate-spin text-junr-blue" />
                            </div>
                        </div>
                    )}

                    {/* Inline Clothing Options */}
                    {showOptions && !isTyping && (
                        <div className="mt-6 mb-2">
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${
                                            activeCategory === cat
                                                ? 'bg-junr-blue text-white border-junr-blue'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-junr-blue'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 pl-2">Suggested Items</p>
                            <div className="flex flex-wrap gap-3">
                                {DUMMY_CLOTHING.filter(item => activeCategory === 'All' || item.category === activeCategory).map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTryOn(item)}
                                        className="group flex flex-col items-center p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-junr-blue dark:hover:border-junr-blue hover:shadow-md transition-all duration-200 w-[100px]"
                                    >
                                        <div className="w-14 h-14 bg-junr-blue rounded-lg flex items-center justify-center mb-2 shadow-sm">
                                            <span className="text-white text-xl font-bold">{item.name[0]}</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center line-clamp-1 w-full">{item.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="e.g. Try on a red leather jacket..."
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-4 pl-6 pr-14 text-gray-900 dark:text-white focus:outline-none focus:border-junr-blue focus:ring-1 focus:ring-junr-blue transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className="absolute right-2 p-2 rounded-full bg-junr-blue text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}