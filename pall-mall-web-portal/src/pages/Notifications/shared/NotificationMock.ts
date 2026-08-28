// ================= Types =================

export type NotificationStatus = "NEW" | "READ";

export type NotificationType =
  | "APPROVAL"
  | "PATIENT"
  | "SYSTEM"
  | "REMINDER"
  | "GENERAL";

export interface NotificationItem {
  id: string;
  title: string;
  createdAt: string;

  status: NotificationStatus;
  type: NotificationType;

  description?: string;
  priority?: "URGENT" | "NORMAL";
}

// ================= Dummy Data =================

export const dummyNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Approval Overdue",
    description: "Insurance approval pending for more than 48 hours.",
    createdAt: "2025-02-10T10:15:00Z",
    status: "NEW",
    priority: "URGENT",
    type: "APPROVAL",
  },
  {
    id: "2",
    title: "New Recovery Form Submitted",
    description: "Patient Sarah Johnson has submitted the recovery form.",
    createdAt: "2025-02-10T09:45:00Z",
    status: "NEW",
    type: "GENERAL",
  },
  {
    id: "3",
    title: "System Maintenance Notice",
    description: "Scheduled maintenance will occur tonight at 11 PM.",
    createdAt: "2025-02-09T18:30:00Z",
    status: "NEW",
    type: "SYSTEM",
  },
  {
    id: "4",
    title: "Follow-up Reminder",
    description: "Reminder to follow up with patient regarding documents.",
    createdAt: "2025-02-09T16:00:00Z",
    status: "NEW",
    type: "REMINDER",
  },
  {
    id: "5",
    title: "Patient Message Viewed",
    description: "You have already read the message from the patient.",
    createdAt: "2025-02-08T14:10:00Z",
    status: "READ",
    type: "PATIENT",
  },
  {
    id: "6",
    title: "Daily Report Generated",
    createdAt: "2025-02-08T08:00:00Z",
    status: "READ",
    type: "GENERAL",
  },
];
