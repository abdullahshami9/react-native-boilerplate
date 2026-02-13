import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class SocketService {
    socket: Socket | null = null;

    connect(userId: number) {
        if (this.socket) return; // Prevent multiple connections

        this.socket = io(SOCKET_URL, {
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

    sendMessage(chatId: number, senderId: number, content: string, type: 'text' | 'image' = 'text') {
        if (this.socket) {
            this.socket.emit("send_message", { chatId, senderId, content, type });
        }
    }

    onMessage(callback: (message: any) => void) {
        if (this.socket) {
            this.socket.on("receive_message", callback);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();
