import { tablePalette } from "@/theme/tablePalette";
import { ColorStyle, TwoFAStyle } from "./types";

export const STATUS_COLORS: Record<string, ColorStyle> = {
  "IN PROGRESS": {
    bg: tablePalette.tableTextBackground.manager,
    color: tablePalette.tableText.manager,
    border: tablePalette.tableTextBordercolor.inprogress,
  },
  PENDING: {
    bg: tablePalette.tableTextBackground.pending,
    color: tablePalette.tableText.pending,
    border: tablePalette.tableTextBordercolor.pending,
  },
  OVERDUE: {
    bg: tablePalette.tableTextBackground.overdue,
    color: tablePalette.tableText.suspended,
    border: tablePalette.tableTextBordercolor.overdue,
  },
  COMPLETED: {
    bg: tablePalette.tableTextBackground.active,
    color: tablePalette.tableText.active,
    border: tablePalette.tableTextBordercolor.completed,
  },
  ACTIVE: {
    bg: tablePalette.tableTextBackground.active,
    color: tablePalette.tableText.active,
    border: tablePalette.tableTextBordercolor.completed,
  },
  SUSPENDED: {
    bg: tablePalette.tableTextBackground.suspended,
    color: tablePalette.tableText.suspended,
    border: tablePalette.tableTextBordercolor.overdue,
  },
  DISABLED: {
    bg: tablePalette.tableTextBackground.disable,
    color: tablePalette.tableText.disable,
    border: tablePalette.tableTextBordercolor.disable,
  },
  "NEEDS ATTENTION": {
    bg: tablePalette.tableTextBackground.suspended,
    color: tablePalette.tableText.suspended,
    border: tablePalette.tableTextBordercolor.overdue,
  },
  "ON TRACK": {
    bg: tablePalette.tableTextBackground.manager,
    color: tablePalette.tableText.manager,
    border: tablePalette.tableTextBordercolor.inprogress,
  },
  DELETED: {
    bg: tablePalette.tableTextBackground.suspended,
    color: tablePalette.tableText.suspended,
    border: tablePalette.tableTextBordercolor.overdue,
  },
};

export const ROLE_COLORS: Record<string, ColorStyle> = {
  DOCTOR: {
    bg: tablePalette.tableTextBackground.surgeon,
    color: tablePalette.tableText.surgeon,
    border: tablePalette.tableTextBordercolor.pending,
  },
  COORDINATOR: {
    bg: tablePalette.tableTextBackground.active,
    color: tablePalette.tableText.active,
    border: tablePalette.tableTextBordercolor.completed,
  },
  NURSE: {
    bg: tablePalette.tableTextBackground.nurse,
    color: tablePalette.tableText.nurse,
    border: tablePalette.tableTextBordercolor.nurse,
  },
  ADMIN: {
    bg: tablePalette.tableTextBackground.admin,
    color: tablePalette.tableText.admin,
    border: tablePalette.tableTextBordercolor.admin,
  },
  RECEPTIONIST: {
    bg: tablePalette.tableTextBackground.marketing,
    color: tablePalette.tableText.marketing,
    border: tablePalette.tableTextBordercolor.marketing,
  },
  MANAGER: {
    bg: tablePalette.tableTextBackground.manager,
    color: tablePalette.tableText.manager,
    border: tablePalette.tableTextBackground.manager,
  },
};

export const TWO_FA_COLORS: Record<string, TwoFAStyle> = {
  ENABLED: {
    bg: tablePalette.tableTextBackground.manager,
    color: tablePalette.tableText.manager,
    border: tablePalette.tableTextBordercolor.inprogress,
    icon: "ShieldCheck",
  },
  DISABLED: {
    bg: tablePalette.tableTextBackground.disable,
    color: tablePalette.tableText.disable,
    border: tablePalette.tableTextBordercolor.disable,
    icon: "ShieldX",
  },
};

export const DEFAULT_ROWS_PER_PAGE = [5, 10, 20, 50];