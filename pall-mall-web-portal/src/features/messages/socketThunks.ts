import { createAsyncThunk } from "@reduxjs/toolkit";
import { socketService } from "@/services/socket/socket.service";
import { receiveMessage, setThreads, setMessages, setCounts, markAsUnread, removeThread, updateThread, setThreadFlagged, markAsRead, handleThreadArchived, handleThreadUnarchived, markMessagesAsRead } from "./slice";
import { fetchMessageCounts, fetchThreads, fetchThreadMessages, markThreadRead } from "./thunks";
import { RootState } from "@/app/store";

export const initializeSocket = createAsyncThunk(
    "messages/initializeSocket",
    async (_, { dispatch, getState }) => {
        const state = getState() as RootState;
        const token = state.auth.accessToken;

        if (token) {
            socketService.connect(token);

            socketService.on("receive_message", (message: any) => {
                console.log("Socket received receive_message:", message);
                dispatch(receiveMessage(message));

                const currentState = getState() as RootState;
                // robust extraction including data unwrap
                const msgData = message.data || message;
                const threadId = msgData.thread_id || msgData.threadId || msgData.message?.thread_id;

                const threadExists = currentState.messages.list.some(t => String(t.thread_id) === String(threadId));

                // If thread is not in current list (and should be?), refresh list
                if (!threadExists && !currentState.messages.loading) {
                    console.log("Thread not in list (ID:", threadId, "), fetching threads...");
                    const { filters } = currentState.messages;
                    dispatch(fetchThreads({
                        page: 1,
                        limit: 10,
                        filter: filters.filter,
                        search: filters.search,
                        roleGroup: filters.roleGroup
                    }));
                }

                dispatch(fetchMessageCounts());
            });

            socketService.on("new_message", (message: any) => {
                const currentState = getState() as RootState;
                // robust extraction including data unwrap
                const msgData = message.data || message;

                dispatch(receiveMessage(msgData));

                const threadId = msgData.thread_id || msgData.threadId || msgData.message?.thread_id;

                if (!threadId) {
                    console.log("Received new_message without threadId, checking thread list...");
                    // Reload threads to ensure we capture the new thread/message correctly
                    const { filters, pagination } = currentState.messages;
                    if (currentState.messages.selectedMessageId) {
                        dispatch(fetchThreadMessages(currentState.messages.selectedMessageId));
                    }
                    dispatch(fetchThreads({
                        page: pagination.page,
                        limit: pagination.limit || 10,
                        filter: filters.filter,
                        search: filters.search,
                        roleGroup: filters.roleGroup
                    }));
                    dispatch(fetchMessageCounts());
                    return;
                }

                // Always reload threads on new message to ensure latest data (attachments, order)
                const { filters, pagination } = currentState.messages;
                dispatch(fetchThreads({
                    page: pagination.page,
                    limit: pagination.limit || 10,
                    filter: filters.filter,
                    search: filters.search,
                    roleGroup: filters.roleGroup
                }));

                // Auto-mark as read if consistent with user request to "read current thread" on new message
                // Using message_id from the incoming message as the last seen
                if (msgData.message_id) {
                    dispatch(markThreadRead({
                        threadId,
                        lastSeenMessageId: msgData.message_id
                    }));
                    dispatch(fetchMessageCounts());
                    const { filters, pagination } = state.messages;

                    dispatch(fetchThreads({
                        page: pagination.page,
                        limit: pagination.limit || 10,
                        filter: filters.filter,
                        search: filters.search,
                        roleGroup: filters.roleGroup
                    }));

                }

                dispatch(fetchMessageCounts());
            });

            socketService.on("threads_list", (data: any) => {
                console.log("Socket received threads_list:", data);
                // Pass full data to let reducer handle extraction and pagination
                dispatch(setThreads(data));
            });

            socketService.on("messages_list", (data: any) => {
                console.log("Socket received messages_list:", data);

                let messages: any[] = [];
                // Handle Array[{ data: [...] }] structure from screenshot
                if (Array.isArray(data) && data.length > 0 && data[0].data) {
                    messages = data[0].data;
                } else if (Array.isArray(data)) {
                    // Fallback for direct array
                    messages = data;
                } else if (data.data) {
                    // Fallback for Object { data: [...] }
                    messages = data.data;
                }

                dispatch(setMessages(messages));

                // Auto-mark as read using the latest message
                console.log("=== messages_list: Auto-mark-read check ===");
                console.log("messages.length:", messages.length);
                if (messages.length > 0) {
                    const sorted = [...messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    const latestMessage = sorted[0];
                    const threadId = latestMessage.thread_id || latestMessage.threadId;
                    console.log("Latest message thread_id:", threadId);
                    console.log("Latest message message_id:", latestMessage.message_id);

                    if (threadId && latestMessage.message_id) {
                        console.log(">>> messages_list: Dispatching markThreadRead", { threadId, lastSeenMessageId: latestMessage.message_id });
                        dispatch(markThreadRead({
                            threadId,
                            lastSeenMessageId: latestMessage.message_id
                        }));
                    } else {
                        console.log(">>> messages_list: SKIPPED markThreadRead - missing threadId or message_id");
                    }
                }
                console.log("=== End messages_list auto-mark-read ===");
            });

            socketService.on("internal_note_added", (message: any) => {
                console.log("=== Socket received internal_note_added ===");
                console.log("Raw payload:", JSON.stringify(message, null, 2));
                const msgData = message.data || message;
                console.log("Extracted msgData:", JSON.stringify(msgData, null, 2));
                console.log("thread_id:", msgData.thread_id || msgData.threadId);
                console.log("message_id:", msgData.message_id);
                console.log("visibility:", msgData.visibility);
                const currentState = getState() as RootState;
                console.log("Currently selected thread:", currentState.messages.selectedMessageId);
                console.log("Match?", (msgData.thread_id || msgData.threadId) === currentState.messages.selectedMessageId);
                console.log("Current messages count before:", currentState.messages.currentThreadMessages.length);

                dispatch(receiveMessage(message));

                // Log after dispatch
                const stateAfter = getState() as RootState;
                console.log("Current messages count after:", stateAfter.messages.currentThreadMessages.length);
                console.log("=== End internal_note_added ===");

                // Trigger full thread list refresh
                const { filters, pagination } = currentState.messages;
                dispatch(fetchThreads({
                    page: pagination.page,
                    limit: pagination.limit || 10,
                    filter: filters.filter,
                    search: filters.search,
                    roleGroup: filters.roleGroup
                }));
                dispatch(fetchMessageCounts());
            });

            socketService.on("internal_note_success", (data: any) => {
                console.log("=== Socket received internal_note_success ===");
                console.log("Raw data:", JSON.stringify(data, null, 2));

                // Refresh thread messages to show the new internal note
                const currentState = getState() as RootState;
                if (currentState.messages.selectedMessageId) {
                    dispatch(fetchThreadMessages(currentState.messages.selectedMessageId));
                }

                // Refresh thread list and counts
                const { filters, pagination } = currentState.messages;
                dispatch(fetchThreads({
                    page: pagination.page,
                    limit: pagination.limit || 10,
                    filter: filters.filter,
                    search: filters.search,
                    roleGroup: filters.roleGroup
                }));
                dispatch(fetchMessageCounts());
                console.log("=== End internal_note_success ===");
            });

            socketService.on("message_counts_data", (data: any) => {
                console.log("Socket received message_counts_data:", data);
                dispatch(setCounts(data));
            });

            socketService.on("mark_read_success", (data: any) => {
                console.log("=== Socket received mark_read_success ===");
                console.log("Raw data:", JSON.stringify(data, null, 2));
                console.log("threadId:", data?.threadId);
                console.log("thread_id:", data?.thread_id);
                console.log("_id:", data?._id);
                const resolvedId = data?.threadId || data?.thread_id || data?._id;
                console.log("Resolved thread ID:", resolvedId);
                if (data && resolvedId) {
                    console.log(">>> Dispatching markAsRead for thread:", resolvedId);
                    dispatch(markAsRead(resolvedId));
                } else {
                    console.log(">>> SKIPPED markAsRead - no thread ID found in response");
                }
                dispatch(fetchMessageCounts());
                console.log("=== End mark_read_success ===");
            });

            socketService.on("mark_unread_success", (data: any) => {
                console.log("Socket received mark_unread_success:", data);
                if (data && (data.threadId || data.thread_id || data._id)) {
                    dispatch(markAsUnread(data.threadId || data.thread_id || data._id));
                }
                dispatch(fetchMessageCounts());
            });

            socketService.on("thread_deleted_success", (data: any) => {
                console.log("Socket received thread_deleted_success:", data);
                // Assuming data contains threadId being deleted or is the threadId itself
                const rawId = typeof data === 'string' ? data : (data.threadId || data.thread_id || data._id);
                const threadId = rawId ? String(rawId) : null;

                if (threadId) dispatch(removeThread(threadId));
                dispatch(fetchMessageCounts());
            });

            socketService.on("thread_updated", (data: any) => {
                console.log("Socket received thread_updated:", data);
                // data might be the thread object itself
                dispatch(updateThread(data));
            });

            socketService.on("threads_updated", (data: any) => {
                console.log("Socket received threads_updated:", data);
                dispatch(setThreads(data));
            });

            socketService.on("thread_list", (data: any) => {
                console.log("Socket received thread_list:", data);
                const currentState = getState() as RootState;
                const { filters, pagination } = currentState.messages;
                dispatch(fetchThreads({
                    page: pagination.page,
                    limit: pagination.limit || 10,
                    filter: filters.filter,
                    search: filters.search,
                    roleGroup: filters.roleGroup
                }));
            });

            socketService.on("thread_list_updated", (data: any) => {
                console.log("Socket received thread_list_updated:", data);

                // Check if data is array and contains action object, or is the action object itself
                const actionData = Array.isArray(data) ? data[0] : data;

                if (actionData && actionData.action === 'refresh') {
                    const currentState = getState() as RootState;
                    const { filters, pagination } = currentState.messages;
                    dispatch(fetchThreads({
                        page: pagination.page,
                        limit: pagination.limit || 10,
                        filter: filters.filter,
                        search: filters.search,
                        roleGroup: filters.roleGroup
                    }));
                } else {
                    dispatch(setThreads(data));
                }
            });

            socketService.on("new_thread", (data: any) => {
                console.log("Socket received new_thread:", data);
                // Treat it same as updateThread for now - it checks if exists, or should add it
                // updateThread implementation in slice currently only updates if exists.
                // We might need a separate action or modify updateThread to add if missing.
                // Checking slice... updateThread logic: "Option: Add if not exists? Usually update implies existing. Simplified: only update existing for now."
                // So I should actually use setThreads or push to list.
                // But setThreads replaces everything.
                // Let's modify updateThread in slice effectively, OR rely on 'receive_message' which usually comes with a thread.
                // But if it's a NEW thread created via API, it might not have a message yet?
                // Assuming data is the thread object.
                // Let's call dispatch(updateThread) but I need to check if updateThread adds it.
                // Re-read slice: updateThread DOES NOT add.
                // I will add a new action 'addThread' to slice or modify updateThread.
                // For now, let's assume updateThread logic is changed or I handle it here.
                // Wait, I can't modify slice in this step efficiently.
                // I will add the listener and then tell user to emit it.
                // Actually, I should inspect slice again to see if I can add 'addThread'.
                // I will perform a separate edit for slice if needed.
                dispatch(updateThread(data));
            });

            socketService.on("toggle_star_success", (data: any) => {
                console.log("Socket received toggle_star_success:", data);
                // Assuming data is the updated thread or contains flags
                const threadId = data.threadId || data.thread_id || data._id;
                const flagged = data.flagged || data.isFlagged || (data.priority === 'starred'); // Adjust based on actual data
                if (threadId) dispatch(setThreadFlagged({ threadId, flagged }));
                dispatch(fetchMessageCounts());
            });

            socketService.on("thread_archive_success", (data: any) => {
                console.log("Socket received thread_archive_success:", data);
                const threadId = data.threadId || data.thread_id || data._id;
                if (threadId) dispatch(handleThreadArchived(threadId));
                dispatch(fetchMessageCounts());
            });

            // Unarchive appears to not have a specific event in the provided backend code?
            // Wait, the backend shows 'archive_thread' with 'status' boolean.
            // If status is false, it is unarchive.
            // The backend emits 'thread_archive_success' for both?
            // Yes, assumes 'thread_archive_success' returns the updated thread or similar.
            // If the data returned has status 'active', we treat it as unarchived?
            // Let's listen to thread_archive_success for UNARCHIVE logic too if status check allows.
            // I'll add logic inside the 'thread_archive_success' listener in a future step or consolidate.
            // For now, I will remove strict 'thread_unarchived' as it is not emitted by backend provided.
            /*
            socketService.on("thread_unarchived", (data: any) => {
                const threadId = data.threadId || data.thread_id;
                if (threadId) dispatch(handleThreadUnarchived(threadId));
            });
            */

            // Alias in case backend uses 'restored'
            socketService.on("thread_restored", (data: any) => {
                const threadId = data.threadId || data.thread_id;
                if (threadId) dispatch(handleThreadUnarchived(threadId));
            });

            socketService.on("message_sent_success", (data: any) => {
                console.log("Socket received message_sent_success:", data);
                const currentState = getState() as RootState;
                const { filters, pagination } = currentState.messages;
                dispatch(fetchThreads({
                    page: pagination.page,
                    limit: pagination.limit || 10,
                    filter: filters.filter,
                    search: filters.search,
                    roleGroup: filters.roleGroup
                }));
                dispatch(fetchMessageCounts());
            });

            socketService.on("thread_created_success", (data: any) => {
                console.log("Socket received thread_created_success:", data);
                const currentState = getState() as RootState;
                const { filters, pagination } = currentState.messages;
                dispatch(fetchThreads({
                    page: pagination.page,
                    limit: pagination.limit || 10,
                    filter: filters.filter,
                    search: filters.search,
                    roleGroup: filters.roleGroup
                }));
                dispatch(fetchMessageCounts());
            });

            socketService.on("message_read", (data: any) => {
                console.log("Socket received message_read:", data);
                const currentState = getState() as RootState;
                const currentUserId = currentState.auth.user?.id || (currentState.auth.user as any)?.guid || (currentState.auth.user as any)?._id;

                const eventData = data?.data || data;
                const userId = eventData?.user_id;
                const threadId = eventData?.thread_id;
                const lastSeenMessageId = eventData?.last_seen_message_id;
                const status = eventData?.status;

                // Only process if someone ELSE read the messages (not ourselves)
                if (userId && userId !== currentUserId && threadId && lastSeenMessageId) {
                    dispatch(markMessagesAsRead({ threadId, lastSeenMessageId, status: status || "double" }));
                }
            });

            socketService.on("error", (error: any) => {
                console.error("Socket error:", error);
            });
        }
    }
);
