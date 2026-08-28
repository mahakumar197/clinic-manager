export type SkeletonType =
  | "text"
  | "image"
  | "list"
  | "table"
  | "avatar"
  | "avatarText"
  | "contentImage"
  | "progress"
  | "contentImageLibrary"
  | "card"
  | "statusCard"
  | "notificationCard"
  | "messageCard"
  | "escalationCard"
  | "doctorNotification"
  | "chart"
  | "lineChart"
  | "pieChart"
  | "editUserPage"
  | "taskDetailsPage"
  | "patientModal"
  | "approvalList"
  | "approvalDetails"
  | "messageView"
  | "editEscalation"
  | "editNotification"
  | "contentViewModal"
  | "patientList";

export interface CommonSkeletonProps {
  rows?: number;
  width?: number | string;
  height?: number | string;
  columns?: 1 | 2;
  showSubLabel?: boolean;
  barCount?: number;
  categoryCount?: number;
  lineCount?: number;
  withSubtitle?: boolean;
}
