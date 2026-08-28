import { JSX } from "react";
import { LucideIconName } from "../lucideIcons";



export interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  sortKey?: string;
  color?: boolean;
  actionType?: "view" | "menu" | "none";
  render?: (value: any, row: any, col?: Column) => JSX.Element;
  textColor?: string;
  
  // Avatar support
  avatar?: boolean;
  avatarNameKey?: string;
  avatarEmailKey?: string;
  avatarInitialKey?: string;
  
  // Menu items
  menuItems?: {
    label: string;
    icon?: LucideIconName;
    color?: string;
    disabled?: (row: any) => boolean;
    onClick?: (row: any) => void;
  }[];
  
  // Patient cell
  patient?: boolean;
  patientNameKey?: string;
  patientIdKey?: string;
  patientAvatarKey?: string;
  
  // Surgery cell
  surgery?: boolean;
  surgeryNameKey?: string;
  surgeryDateKey?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommonTableProps<T> {
  title?: string;
  columns: Column[];
  data: T[];
  scrollHeight?: number;
  onViewClick?: (row: T) => void;
  pageMeta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (limit: number) => void;
  loading?: boolean;
  /** True when a refetch is in progress (shows progress bar below header) */
  isFetching?: boolean;
  onSortChange?: (sortQuery: Record<string, number>) => void;
}

export type SortOrder = 1 | -1 | null;

export interface ColorStyle {
  bg: string;
  color: string;
  border: string;
}

export interface TwoFAStyle extends ColorStyle {
  icon: LucideIconName;
}