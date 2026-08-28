import { createAsyncThunk } from "@reduxjs/toolkit";
import { socketService } from "@/services/socket/socket.service";

import type { RootState } from "@/app/store";
import { messagesService } from "@/services/modules/messages.service";

export const fetchThreads = createAsyncThunk(
    "messages/fetchThreads",
    async (params: { page: number; limit: number; filter: string; search?: string; roleGroup?: string }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const { user } = state.auth;
            // Assuming user object has id/role
            const userId = user?.id || (user as any)?.guid || (user as any)?._id;
            const role = user?.role || "";
            const socketPayload: any = {
                page: params.page,
                limit: params.limit,
                filter: params.filter || "",
                search: params.search || "",
                roleGroup: params.roleGroup || "",
                userId: userId || "",
                role: role || ""
            };

            // Map filter string to specific socket query parameters
            if (params.filter === 'unread') {
                socketPayload.status = 'open';
            } else if (params.filter === 'flagged') {
                socketPayload.flagged = true;
            } else if (params.filter === 'archived') {
                socketPayload.status = 'archived';
            } else {
                // For inbox/all, we typically want active threads
                socketPayload.status = 'open';
            }

            // Emit socket event
            socketService.getThreads(socketPayload);

            // We do not return data here anymore. The data will arrive via 'threads_list' socket event.
            // The slice's extraReducers for fetchThreads.fulfilled should be aware it won't get data.
            return { sent: true };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchThreadMessages = createAsyncThunk(
    "messages/fetchThreadMessages",
    async (threadId: string, { rejectWithValue, getState }) => {
        try {
            // Emit socket event to subscribe/fetch messages
            const state = getState() as RootState;
            const { user } = state.auth;

            const userId = user?.id || (user as any)?.guid || (user as any)?._id;
            const role = user?.role || "";

            if (userId) {
                socketService.emit('join_thread', { thread_id: threadId });

                socketService.emit('get_messages', {
                    userId: userId || "",
                    role: role || "",
                    thread_id: threadId || ""
                });
            }

            // Socket "messages_list" event will handle the data update. 
            // We return threadId to potentially identify which thread was requested, but no data.
            return { threadId };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const sendMessage = createAsyncThunk(
    "messages/sendMessage",
    async (payload: { content: string; receiverId?: string; threadId?: string; file?: File | null; attachments?: any[] }, { rejectWithValue, getState, dispatch }) => {
        try {
            if (!payload.threadId) throw new Error("Thread ID is required");

            const state = getState() as RootState;
            const { user } = state.auth;
            const userId = user?.id || (user as any)?.guid || (user as any)?._id || "";
            const role = user?.role || "";

            // Use Socket
            socketService.sendMessage({
                thread_id: payload.threadId,
                threadId: payload.threadId,
                userId,
                role,
                dto: {
                    thread_id: payload.threadId,
                    threadId: payload.threadId,
                    message: payload.content,
                    text: payload.content,
                    message_text: payload.content,
                    attachments: payload.attachments || []
                }
            });
            dispatch(fetchThreadMessages(payload.threadId));
            // const currentThread = state.messages.list.find((t: any) => t.thread_id === payload.threadId || t.threadId === payload.threadId);    
            // dispatch(markThreadRead({
            //     threadId: payload.threadId,
            //     lastSeenMessageId: currentThread?.last_message?.message_id
            // }));
            // dispatch(fetchThreadMessages(payload.threadId));
            // Trigger counts and thread list update immediately

            // Update current thread messages


            // Optimistic return structure for immediate UI update if needed
            // The actual message will come back via 'receive_message' socket event and be handled by the listener in slice

            const senderName = (user as any)?.name || (user as any)?.username || "Me";
            const senderId = userId;
            const senderRole = role;

            const tempId = 'temp_' + Date.now();
            return {
                id: tempId,
                message_id: tempId,
                message: payload.content,
                message_text: payload.content, // UI expects this
                text: payload.content,
                thread_id: payload.threadId,
                attachments: payload.attachments || [],
                sender_name: senderName,
                sender_id: senderId,
                sender_role: senderRole,
                created_at: new Date().toISOString(),
                is_read: true
            };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const sendInternalNote = createAsyncThunk(
    "messages/sendInternalNote",
    async (payload: { content: string; threadId: string; taggedUserIds?: string[] }, { rejectWithValue, getState }) => {
        try {
            if (!payload.threadId) throw new Error("Thread ID is required");

            const state = getState() as RootState;
            const { user } = state.auth;
            const userId = user?.id || (user as any)?.guid || (user as any)?._id || "";

            // Use socket instead of REST API
            socketService.sendInternalNote({
                userId,
                threadId: payload.threadId,
                noteText: payload.content,
            });

            return { success: true };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const disconnectSocket = createAsyncThunk(
    "messages/disconnectSocket",
    async () => {
        socketService.disconnect();
    }
);

export const fetchMessageCounts = createAsyncThunk(
    "messages/fetchMessageCounts",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const { user } = state.auth;
            const userId = user?.id || (user as any)?.guid || (user as any)?._id;
            const role = user?.role || "";

            if (userId) {
                console.log("fetchMessageCounts: Joining user and requesting counts for", userId);
                socketService.joinUser({ user_id: userId });
                socketService.getCounts({ userId: userId || "", role: role || "" });
            } else {
                console.warn("fetchMessageCounts: No userId found");
            }
            // Counts will be updated via 'counts_updated' socket event
            return { sent: true };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const archiveThread = createAsyncThunk(
    "messages/archiveThread",
    async (payload: { threadId: string; status: boolean }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const { user } = state.auth;
            const userId = user?.id || (user as any)?.guid || (user as any)?._id || "";

            socketService.archiveThread({ adminId: userId, threadId: payload.threadId, status: payload.status });
            return payload;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const markThreadRead = createAsyncThunk(
    "messages/markThreadRead",
    async (payload: { threadId: string; lastSeenMessageId?: string }, { rejectWithValue, getState }) => {
        try {
            console.log("markThreadRead: Marking thread", payload.threadId, "as read");
            const state = getState() as RootState;
            const { user } = state.auth;
            const userId = user?.id || (user as any)?.guid || (user as any)?._id || "";
            const role = user?.role || "";

            socketService.markRead({
                userId,
                role,
                threadId: payload.threadId,
                dto: {
                    lastSeenMessageId: payload.lastSeenMessageId,
                    last_seen_message_id: payload.lastSeenMessageId
                }
            });
            return payload.threadId;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const markThreadUnread = createAsyncThunk(
    "messages/markThreadUnread",
    async (threadId: string, { rejectWithValue, getState }) => {
        try {
            console.log("markThreadUnread: Marking thread", threadId, "as unread");
            const state = getState() as RootState;
            const { user } = state.auth;
            const userId = user?.id || (user as any)?.guid || (user as any)?._id || "";
            const role = user?.role || "";

            socketService.markUnread({ userId, role, threadId });
            return threadId;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const assignThread = createAsyncThunk(
    "messages/assignThread",
    async (payload: { threadId: string; assignedUserIds: string[] }, { rejectWithValue, dispatch, getState }) => {
        try {
            await messagesService.assignThread(payload.threadId, payload.assignedUserIds);

            // Manually refresh threads as socket event is sometimes malformed (missing threadId)
            const state = getState() as RootState;
            const { filters, pagination } = state.messages;
            dispatch(fetchThreads({
                page: pagination.page,
                limit: pagination.limit,
                filter: filters.filter,
                search: filters.search,
                roleGroup: filters.roleGroup
            }));

            return payload;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const deleteThread = createAsyncThunk(
    "messages/deleteThread",
    async (threadId: string, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const { user } = state.auth;
            const userId = user?.id || (user as any)?.guid || (user as any)?._id || "";

            const role = user?.role || "";
            socketService.deleteThread({
                adminId: userId,
                userId,
                role,
                threadId,
                thread_id: threadId,
                dto: {
                    threadId,
                    thread_id: threadId,
                    adminId: userId
                }
            });
            dispatch(fetchMessageCounts());
            return threadId;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const starThread = createAsyncThunk(
    "messages/starThread",
    async (threadId: string, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const { user } = state.auth;
            const userId = user?.id || (user as any)?.guid || (user as any)?._id || "";
            const role = user?.role || "";

            socketService.starThread({ threadId, userId, role });
            return threadId;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);
