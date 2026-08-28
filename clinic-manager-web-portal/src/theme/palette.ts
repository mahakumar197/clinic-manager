import { PaletteOptions } from "@mui/material/styles";

/**
 * Color palette configuration for light and dark modes
 */

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: "#E9A708",
    light: "#FFFBEB",
    dark: "#d39607ff",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#9c27b0",
    light: "#ba68c8",
    dark: "#7b1fa2",
    contrastText: "#B6B6B8",
  },
  error: {
    main: "#d32f2f",
    light: "#FEF2F2",
    dark: "#c62828",
  },
  warning: {
    main: "#ed6c02",
    light: "#ff9800",
    dark: "#e65100",
  },
  info: {
    main: "#0288d1",
    light: "#03a9f4",
    dark: "#01579b",
  },
  success: {
    main: "#2e7d32",
    light: "#DCFCE7",
    dark: "#1b5e20",
  },
  background: {
    default: "#FBFBFB",
    paper: "#ffffff",
  },
  text: {
    primary: "#000000",
    secondary: "#45556C",
    disabled: "rgba(0, 0, 0, 0.38)",
  },
  divider: "#E5E5E5",
};

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#90caf9",
    light: "#e3f2fd",
    dark: "#42a5f5",
    contrastText: "#000000",
  },
  secondary: {
    main: "#ce93d8",
    light: "#f3e5f5",
    dark: "#ab47bc",
    contrastText: "#000000",
  },
  error: {
    main: "#f44336",
    light: "#e57373",
    dark: "#d32f2f",
  },
  warning: {
    main: "#ffa726",
    light: "#ffb74d",
    dark: "#f57c00",
  },
  info: {
    main: "#29b6f6",
    light: "#4fc3f7",
    dark: "#0288d1",
  },
  success: {
    main: "#66bb6a",
    light: "#81c784",
    dark: "#388e3c",
  },
  background: {
    default: "#121212",
    paper: "#1e1e1e",
  },
  text: {
    primary: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.7)",
    disabled: "rgba(255, 255, 255, 0.5)",
  },
};
