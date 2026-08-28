import axiosInstance from "@/services/api/axiosInstance";
import { ENDPOINTS, MAIN_API_BASE_URL } from "@/services/api/endpoints";

export const messagesService = {
    getThreads: async (params: { page: number; limit: number; filter: string; search?: string; roleGroup?: string }) => {
        const apiParams = { ...params };
        if (!apiParams.search) delete apiParams.search;
        if (!apiParams.roleGroup) delete apiParams.roleGroup;
        if (!apiParams.filter) delete apiParams.filter;

        const response = await axiosInstance.get(ENDPOINTS.MESSAGES.THREADS, {
            params: apiParams,
            baseURL: MAIN_API_BASE_URL
        });
        return response.data;
    },

    getThreadMessages: async (threadId: string) => {
        const response = await axiosInstance.get(ENDPOINTS.MESSAGES.THREAD_MESSAGES(threadId), {
            baseURL: MAIN_API_BASE_URL
        });
        return response.data;
    },

    sendMessage: async (threadId: string, payload: { message: string; attachments?: any[] }) => {
        const response = await axiosInstance.post(ENDPOINTS.MESSAGES.SEND_IN_THREAD(threadId), payload, {
            baseURL: MAIN_API_BASE_URL
        });
        return response.data;
    },

    getCounts: async () => {
        const response = await axiosInstance.get(ENDPOINTS.MESSAGES.COUNTS, {
            baseURL: MAIN_API_BASE_URL
        });
        return response.data;
    },

    archiveThread: async (threadId: string, status: boolean) => {
        const response = await axiosInstance.put(ENDPOINTS.MESSAGES.ARCHIVE(threadId), { status }, {
            baseURL: MAIN_API_BASE_URL
        });
        return response.data;
    },

    markThreadRead: async (threadId: string, lastSeenMessageId?: string) => {
        const payload = lastSeenMessageId ? { last_seen_message_id: lastSeenMessageId } : {};
        const response = await axiosInstance.put(ENDPOINTS.MESSAGES.READ(threadId), payload, {
            baseURL: MAIN_API_BASE_URL
        });
        return response.data;
    },

    markThreadUnread: async (threadId: string) => {
        const response = await axiosInstance.put(ENDPOINTS.MESSAGES.UNREAD(threadId), {}, {
            baseURL: MAIN_API_BASE_URL
        });
        return response.data;
    },

    addInternalNote: async (threadId: string, noteText: string) => {
        // Sending multiple variations to ensure backend captures the text correctly
        // as we suspect 'note_text' might be ignored or mapped incorrectly causing hash/ID return
        const payload = {
            note_text: noteText
        };
        const response = await axiosInstance.post(ENDPOINTS.MESSAGES.INTERNAL_NOTE(threadId), payload, {
            baseURL: MAIN_API_BASE_URL
        });
        return response.data;
    },

    deleteThread: async (threadId: string) => {
        const response = await axiosInstance.delete(ENDPOINTS.MESSAGES.DELETE(threadId), {
            baseURL: MAIN_API_BASE_URL
        });
        return response.data;
    },

    starThread: async (threadId: string) => {
        const response = await axiosInstance.post(ENDPOINTS.MESSAGES.STAR(threadId), {}, {
            baseURL: MAIN_API_BASE_URL
        });
        return response.data;
    },

    getThreadAssignedUsers: async (threadId: string, search?: string, signal?: AbortSignal) => {
        const response = await axiosInstance.get(ENDPOINTS.MESSAGES.THREAD_ASSIGNED_USERS(threadId), {
            params: { search },
            baseURL: MAIN_API_BASE_URL,
            signal,
        });
        return response.data.data;
    },

    assignThread: async (threadId: string, assignedUserIds: string[]) => {
        const response = await axiosInstance.put(ENDPOINTS.MESSAGES.ASSIGN_THREAD(threadId), {
            assigned_user_ids: assignedUserIds
        }, {
            baseURL: MAIN_API_BASE_URL
        });
        return response.data;
    },
};
