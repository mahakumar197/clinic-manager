// features/messages/slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchThreads, fetchMessageCounts, archiveThread, markThreadRead, markThreadUnread, fetchThreadMessages, sendMessage, starThread, deleteThread } from "./thunks";
import { Thread } from "./types";

// interface MessagesState {
//   list: Message;
//   selectedMessageId: string | null;
// }

const initialState = {
  list: [] as Thread[],
  loading: false,
  selectedMessageId: null,
  filters: {
    search: "",
    filter: "all",
    roleGroup: "",
  },
  counts: {
    all: 0,
    unread: 0,
    flagged: 0,
    sent: 0,
    archived: 0,
    role_groups: {
      "Nurse": 0,
      "Surgeon": 0,
      "Coordinator": 0,
    } as Record<string, number>
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  currentThreadMessages: [] as any[], // Using any[] for now, should define Message type
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setSelectedMessage: (state, action: PayloadAction<string | null>) => {
      state.selectedMessageId = action.payload;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const msg = state.list.find((m) => m.thread_id === action.payload);
      if (msg) {
        msg.is_read = true;
        // If currently filtering by 'unread', remove this thread from the list
        if (state.filters.filter === 'unread') {
          state.list = state.list.filter(m => m.thread_id !== action.payload);
          if (state.selectedMessageId === action.payload) {
            state.selectedMessageId = null;
          }
        }
      }
    },
    receiveMessage: (state, action: PayloadAction<any>) => {
      let message = action.payload;

      // Handle data wrapped in 'data' property if present (common in socket responses)
      if (message.data) message = message.data;

      // 1. Append to current conversation if open
      if (state.selectedMessageId && (message.thread_id === state.selectedMessageId || message.threadId === state.selectedMessageId)) {
        // Avoid duplicates
        const exists = state.currentThreadMessages.some(m => m.message_id === message.message_id);
        if (!exists) {
          state.currentThreadMessages.push(message);
        }
      }

      // 2. Update thread list preview
      const threadId = message.thread_id || message.threadId;
      const threadIndex = state.list.findIndex(t => t.thread_id === threadId);

      if (threadIndex !== -1) {
        // Update existing thread
        const thread = state.list[threadIndex];
        thread.last_message = message;
        (thread as any).updated_at = message.created_at;
        // Move to top
        state.list.splice(threadIndex, 1);
        state.list.unshift(thread);
      } else {
        // New thread? - Usually 'new_message' comes with thread data? 
        // If not, we rely on 'new_thread' or fetchThreads.
        // For now, if not in list, we might want to trigger a fetch (handled in socketThunks).
      }
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      // Keep previous list visible until new data arrives (no flicker)
      state.pagination.page = 1;
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.filters.filter = action.payload;
      state.filters.roleGroup = ""; // Clear role group
      state.list = [];
      state.pagination.page = 1;
      state.selectedMessageId = null;
    },
    setRoleGroup: (state, action: PayloadAction<string>) => {
      state.filters.roleGroup = action.payload;
      state.filters.filter = ""; // Clear filter to ensure mutual exclusivity
      // Keep previous list visible until new data arrives (no flicker)
      state.pagination.page = 1;
      state.selectedMessageId = null;
    },
    setThreads: (state, action: PayloadAction<any>) => {
      // Action payload can now be { data: Thread[], meta: ... } or just Thread[]
      const payload = action.payload;
      let threads: Thread[] = [];

      if (Array.isArray(payload)) {
        threads = payload;
      } else if (payload.data) {
        threads = payload.data;
        // Update pagination if meta is present
        if (payload.meta) {
          state.pagination = {
            ...state.pagination,
            total: payload.meta.total || state.pagination.total,
            totalPages: payload.meta.totalPages || state.pagination.totalPages,
            page: payload.meta.page || state.pagination.page,
            limit: payload.meta.limit || state.pagination.limit,
          };
        }
      }

      // let processedList = threads.map((t: any) => ({
      //   ...t,
      //   // Normalize isRead (camelCase from backend?) to is_read (snake_case used in frontend)
      //   is_read: t.is_read !== undefined ? t.is_read : (t.isRead !== undefined ? t.isRead : false)
      // }));

      let processedList = threads.map((t: any) => {
        // Check if this thread already exists in local Redux state
        const existingThread = state.list.find(e => e.thread_id === t.thread_id);
        // Normalize BE's is_read (handles both camelCase isRead and snake_case is_read)
        const beIsRead = t.is_read !== undefined ? t.is_read : (t.isRead !== undefined ? t.isRead : false);
        return {
          ...t,
          // If thread already exists locally, preserve its local is_read value.
          // For brand new threads not yet in the list, trust BE's value.
          is_read: existingThread !== undefined ? existingThread.is_read : beIsRead,
        };
      });

      // Enforce client-side filtering to ensure list consistency with current active filter
      if (state.filters.filter === 'unread') {
        // If unread filter is active, we might want to ensure we only show unread?
        // But usually the socket sends what we asked for.
        // Let's trust the backend or the filter logic in the component.
      } else if (state.filters.filter === 'flagged') {
        processedList = processedList.filter((t: any) => t.flagged);
      } else if (state.filters.filter === 'archived') {
        processedList = processedList.filter((t: any) => t.status === 'closed');
      } else {
        // For Inbox/All, usually exclude archived
        processedList = processedList.filter((t: any) => t.status !== 'archived');
      }

      state.list = processedList;
      // Socket response received, loading done
      state.loading = false;
    },
    setMessages: (state, action: PayloadAction<any[]>) => {
      const messages = action.payload;
      if (messages && messages.length > 0) {
        // If we have messages, verify they belong to the selected thread
        if (state.selectedMessageId === messages[0].thread_id) {
          state.currentThreadMessages = messages;
        }
      }
    },
    setCounts: (state, action: PayloadAction<any>) => {
      let counts = action.payload;
      if (counts.data) counts = counts.data;
      state.counts = counts;
    },
    markAsUnread: (state, action: PayloadAction<string>) => {
      const msg = state.list.find((m) => m.thread_id === action.payload);
      if (msg) {
        msg.is_read = false;
      }
    },
    removeThread: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((t) => t.thread_id !== action.payload);
      if (state.selectedMessageId === action.payload) {
        state.selectedMessageId = null;
      }
    },
    updateThread: (state, action: PayloadAction<Thread>) => {
      console.log("Redux updateThread: Received update for thread:", action.payload);
      const updatedThread = action.payload;
      const index = state.list.findIndex((t) => t.thread_id === updatedThread.thread_id);
      if (index !== -1) {
        console.log("Redux updateThread: Thread found. Updating properties.");
        // Prevent overwriting is_read status from generic updates to avoid race conditions
        const { is_read, ...safeUpdate } = updatedThread as any;
        state.list[index] = { ...state.list[index], ...safeUpdate };
      } else {
        console.log("Redux updateThread: Thread NOT found in list. Ignoring update.");
      }
    },
    setThreadFlagged: (state, action: PayloadAction<{ threadId: string; flagged: boolean }>) => {
      const { threadId, flagged } = action.payload;
      const thread = state.list.find((t) => t.thread_id === threadId);
      if (thread) {
        thread.flagged = flagged;
      }
    },
    handleThreadArchived: (state, action: PayloadAction<string>) => {
      const threadId = action.payload;
      const thread = state.list.find((t) => t.thread_id === threadId);
      if (thread) {
        thread.status = 'archived';
        if (state.filters.filter !== 'archived') {
          state.list = state.list.filter(t => t.thread_id !== threadId);
          if (state.selectedMessageId === threadId) {
            state.selectedMessageId = null;
          }
        }
      }
    },
    handleThreadUnarchived: (state, action: PayloadAction<string>) => {
      const threadId = action.payload;
      const thread = state.list.find((t) => t.thread_id === threadId);
      if (thread) {
        thread.status = 'active';
        if (state.filters.filter === 'archived') {
          state.list = state.list.filter(t => t.thread_id !== threadId);
        }
      }
    },
    markMessagesAsRead: (state, action: PayloadAction<{ threadId: string; lastSeenMessageId: string; status: string }>) => {
      console.log("Redux markMessagesAsRead:", action.payload);
      const { threadId, lastSeenMessageId, status } = action.payload;
      // Only update messages in the currently open thread
      if (state.selectedMessageId !== threadId) return;
      // Check if the last_seen_message exists in the current thread
      const lastMsg = state.currentThreadMessages.find(
        (m) => m.message_id === lastSeenMessageId
      );
      // Only update if the message exists and status has changed
      if (lastMsg && lastMsg.status !== status) {
        // Update ALL messages in the thread with the new status (same as mobile team)
        state.currentThreadMessages = state.currentThreadMessages.map((m) => ({
          ...m,
          status: status,
        }));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThreads.pending, (state) => {
        // Only show loading skeleton on initial load (no data yet)
        if (state.list.length === 0) {
          state.loading = true;
        }
      })
      .addCase(fetchThreads.fulfilled, (state) => {
        // Data handled via socket 'threads_list' -> setThreads
        // state.loading = false;
      })
      .addCase(fetchThreads.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchMessageCounts.fulfilled, (state, action) => {
        // Counts handled via socket 'counts_updated' -> setCounts
      })
      .addCase(archiveThread.fulfilled, (state, action) => {
        const { threadId, status } = action.payload;
        // If we are in "archived" view and we unarchive (status=false), remove it.
        // If we are in "inbox/all" view and we archive (status=true), remove it.
        // Simplified: check if the new status conflicts with current filter?

        // Actually, simpler logic:
        // status = true means "Move to Archive"
        // status = false means "Move to Inbox" (Unarchive)

        if (status) {
          // Archived -> Remove from lists except "archived" filter (unless we implement sophisticated valid/invalid check)
          // Typically "archive" action removes from Inbox/Unread/etc.
          // If current filter is NOT 'archived', remove it.
          if (state.filters.filter !== 'archived') {
            state.list = state.list.filter(t => t.thread_id !== threadId);
          }
        } else {
          // Unarchived -> Remove from "archived" list.
          if (state.filters.filter === 'archived') {
            state.list = state.list.filter(t => t.thread_id !== threadId);
          }
        }
      })
      .addCase(markThreadRead.fulfilled, (state, action) => {
        const thread = state.list.find(t => t.thread_id === action.payload);
        if (thread) {
          thread.is_read = true;
        }
      })
      .addCase(markThreadUnread.fulfilled, (state, action) => {
        const thread = state.list.find(t => t.thread_id === action.payload);
        if (thread) {
          thread.is_read = false;
        }
      })
      .addCase(fetchThreadMessages.pending, (state) => {
        // Maybe set a loading for messages?
      })
      .addCase(fetchThreadMessages.fulfilled, (state, action) => {
        // action.payload only contains threadId now, messages come via socket 'messages_list'
        // We could set loading false if we had it
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Optimistic update disabled. UI updates via socket 'receive_message' event.
      })
      .addCase(starThread.fulfilled, (state, action) => {
        const thread = state.list.find(t => t.thread_id === action.payload);
        if (thread) {
          // Toggle flagged status or set true? API name implies star/unstar toggle usually?
          // The Swagger doc says "Star / Unstar a thread". So it's a toggle.
          // But here we rely on the current state.
          // Ideally the API returns the new state, but it returns empty object in example.
          // Let's assume toggle for now.
          thread.flagged = !thread.flagged;
        }
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        console.log("Redux deleteThread fulfilled:", action.payload);
        console.log("Current selectedMessageId:", state.selectedMessageId);
        state.list = state.list.filter((t) => String(t.thread_id) !== String(action.payload));
        if (String(state.selectedMessageId) === String(action.payload)) {
          console.log("Closing selected thread (delete)");
          state.selectedMessageId = null;
        }
      });
  }
});

export const { setSelectedMessage, markAsRead, receiveMessage, setSearch, setFilter, setRoleGroup, setThreads, setMessages, setCounts, markAsUnread, removeThread, updateThread, setThreadFlagged, handleThreadArchived, handleThreadUnarchived, markMessagesAsRead } = messagesSlice.actions;
export default messagesSlice.reducer;
