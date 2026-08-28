import { format } from "date-fns";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

/**
 * Call this in any file BEFORE using dayjs.utc()
 */
export const enableDayjsUTC = () => {
  dayjs.extend(utc);
};

/**
 * Formats a date string for message bubble timestamp display.
 * Always shows the time (e.g., "09:30 AM") since date dividers
 * already indicate the day (Today, Yesterday, etc.)
 */
export const formatMessageTime = (dateString?: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return format(date, "hh:mm a");
};

/**
 * Formats a date string for notification display (date only, no time)
 * Format: "yyyy-MM-dd" (e.g., 2025-10-25)
 */
export const formatNotificationDate = (dateString?: string | null): string => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return format(date, "yyyy-MM-dd");
};

