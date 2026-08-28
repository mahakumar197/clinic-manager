export interface MessageUser {
  name: string;
  role: string | null;
}

export interface LastMessage {
  message_id: string;
  text: string;
  sender_id: string;
  sender_name: string | null;
  sender_role: string | null;
  created_at: string;
  attachments?: any[];
}

export interface Thread {
  thread_id: string;
  subject: string | null;
  status: string;
  created_at: string;
  is_read: boolean;
  flagged: boolean;
  patient: MessageUser;
  assigned_users: MessageUser[];
  last_message: LastMessage | null;
  // For compatibility with UI (might need mapping or direct usage)
  messages?: any[]; // If we fetch full details
}

export interface Message {
  // Keeping this for individual message details if needed, or replacing with LastMessage structure
  id: string;
  content: string;
  timestamp: string;
  sender: string;
  isInternal: boolean;
  // ... other fields
}

export interface ThreadsResponse {
  success: boolean;
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  data: Thread[];
}
