import { io, Socket } from 'socket.io-client';
import { MAIN_API_BASE_URL } from '../api/endpoints';

const getSocketUrl = () => {
    const url = new URL(MAIN_API_BASE_URL);
    return url.origin;
};

class SocketService {
    private socket: Socket | null = null;
    private static instance: SocketService;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect(token: string): void {
        if (this.socket?.connected) return;

        const socketUrl = getSocketUrl();
        console.log('Connecting to socket at:', socketUrl);

        this.socket = io(socketUrl, {
            auth: { token },

            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        // Listen for all events defined in gateway
        const events = ['typing', 'threads_list', 'messages_list', 'new_message', 'receive_message', 'internal_note_added', 'message_read', 'thread_updated', 'error', 'thread_created_success'];

        const addLog = (event: string, data: any, source?: string) => {
            console.log(`[Socket Service] ${event}`, data, source);
        };

        events.forEach(event => {
            this.socket?.on(event, (data) => {
                addLog(event, data, event);
            });
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.io.on("reconnect_attempt", () => {
            console.log("Socket Service: Attempting to reconnect...");
        });

        // Debug: Log all incoming events
        this.socket.onAny((event, ...args) => {
            console.log(`[Socket Debug] Incoming event: ${event}`, args);
        });
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public on(event: string, callback: (...args: any[]) => void): void {
        this.socket?.on(event, callback);
    }

    public off(event: string): void {
        this.socket?.off(event);
    }

    public emit(event: string, data: any): void {
        this.socket?.emit(event, data);
    }

    // Messaging Actions
    public sendMessage(payload: { thread_id: string; threadId?: string; userId: string; role: string; dto: { thread_id: string; threadId?: string; message: string; text?: string; message_text?: string; attachments?: any[] } }) {
        console.log("SocketService: emitting send_message", payload);
        this.emit('send_message', payload);
    }

    public markRead(payload: { userId: string; role: string; threadId: string; dto: { lastSeenMessageId?: string; last_seen_message_id?: string } }) {
        console.log("SocketService: emitting mark_read", payload);
        this.emit('mark_read', payload);
    }

    public markUnread(payload: { userId: string; role: string; threadId: string }) {
        console.log("SocketService: emitting mark_unread", payload);
        this.emit('mark_unread', payload);
    }

    public archiveThread(payload: { adminId: string; threadId: string; status: boolean }) {
        console.log("SocketService: emitting archive_thread", payload);
        this.emit('archive_thread', payload);
    }

    public deleteThread(payload: { adminId: string; userId?: string; role?: string; threadId: string; thread_id?: string; dto?: any }) {
        console.log("SocketService: emitting delete_thread", payload);
        this.emit('delete_thread', payload);
    }

    public assignThread(payload: { adminId: string; userId?: string; role?: string; threadId: string; thread_id?: string; assignedTo: string; dto?: any }) {
        console.log("SocketService: emitting assign_thread", payload);
        this.emit('assign_thread', payload);
    }

    public starThread(payload: { threadId: string; userId: string; role: string }) {
        this.emit('toggle_star', payload);
    }

    public sendInternalNote(payload: { userId: string; threadId: string; noteText: string }) {
        console.log("SocketService: emitting add_internal_note", payload);
        this.emit('add_internal_note', {
            userId: payload.userId,
            threadId: payload.threadId,
            dto: { note_text: payload.noteText }
        });
    }

    public joinUser(payload: { user_id: string }) {
        this.emit('join_user', payload);
    }

    public getThreads(payload: { page: number; limit: number; filter: string; search?: string; roleGroup?: string; userId: string; role: string }) {
        const { userId, role, ...query } = payload;
        console.log("SocketService: emitting get_threads", { userId, role, query });
        this.emit('get_threads', { userId, role, query });
    }

    public getCounts(payload: { userId: string; role: string }) {
        console.log("SocketService: emitting get_message_counts", payload);
        this.emit('get_message_counts', payload);
    }

    public isConnected(): boolean {
        return !!this.socket?.connected;
    }
}

export const socketService = SocketService.getInstance();
