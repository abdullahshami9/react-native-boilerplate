import { io, Socket } from "socket.io-client";
import { CONFIG } from "../Config";

class SocketService {
    socket: Socket | null = null;

    connect(userId: number) {
        if (this.socket?.connected) return;

        this.socket = io(CONFIG.API_URL, {
            transports: ['websocket'],
            query: { userId }
        });

        this.socket.on("connect", () => {
            console.log("Socket connected:", this.socket?.id);
        });

        this.socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });
    }

    joinChat(chatId: number) {
        if (this.socket) {
            this.socket.emit("join_room", chatId);
        }
    }

    registerUser(userId: number) {
        if (this.socket) {
            this.socket.emit("register_user", userId);
        }
    }

    onNotification(callback: (notification: any) => void) {
        if (this.socket) {
            this.socket.on("new_notification", callback);
            return () => this.socket?.off("new_notification", callback);
        }
        return () => {};
    }

    sendMessage(chatId: number, senderId: number, content: string, type: 'text' | 'image' = 'text') {
        if (this.socket) {
            this.socket.emit("send_message", { chatId, senderId, content, type });
        }
    }

    onMessage(callback: (message: any) => void) {
        if (this.socket) {
            this.socket.on("receive_message", callback);
            return () => this.socket?.off("receive_message", callback);
        }
        return () => {};
    }

    // Typing Indicators
    sendTyping(chatId: number, userId: number) {
        if (this.socket) {
            this.socket.emit("user_typing", { chatId, userId });
        }
    }

    onTyping(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on("user_typing", callback);
            return () => this.socket?.off("user_typing", callback);
        }
        return () => {};
    }

    // Online Status
    onUserStatusChange(callback: (data: { userId: number, status: 'online' | 'offline' }) => void) {
        if (this.socket) {
            this.socket.on("user_status_change", callback);
            return () => this.socket?.off("user_status_change", callback);
        }
        return () => {};
    }

    // Read Receipts
    markMessagesRead(chatId: number, userId: number) {
        if (this.socket) {
            this.socket.emit("messages_read", { chatId, userId });
        }
    }

    onMessagesRead(callback: (data: { chatId: number, userId: number }) => void) {
        if (this.socket) {
            this.socket.on("messages_read", callback);
            return () => this.socket?.off("messages_read", callback);
        }
        return () => {};
    }

    // Order Updates
    onOrderUpdate(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on("order_update", callback);
            return () => this.socket?.off("order_update", callback);
        }
        return () => {};
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();
