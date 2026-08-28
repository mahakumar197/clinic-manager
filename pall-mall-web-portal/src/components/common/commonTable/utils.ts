import { ColorStyle } from "./types";

export const buildChipStyles = (style: ColorStyle) => ({
  backgroundColor: style.bg,
  color: style.color,
  border: `1px solid ${style.border}`,
  boxSizing: "border-box",
  fontWeight: 500,
  borderRadius: "8px",
  height: "22px",
  fontSize: "12px",
});

export const getInitials = (name: string): string => {
  if (!name) return "PT";
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
};

export const normalizeValue = (value: any): string => {
  return String(value).trim().toUpperCase();
};