import { createTheme, responsiveFontSizes, Theme } from "@mui/material/styles";
import { lightPalette, darkPalette } from "./palette";
import { typography } from "./typography";
import { components } from "./components";

/**
 * Create MUI theme with custom configuration
 */

const baseThemeOptions = {
  typography: typography as object,
  components,
  shape: {
    borderRadius: 8,
  },
  spacing: 8, // Base spacing unit (8px)
  breakpoints: {
    values: {
      xs: 0, // mobile portrait
      sm: 480, // mobile landscape
      md: 768, // tablet
      lg: 1024, // small laptops
      xl: 1920, // desktop / Figma frame size (main)
    },
  },
};

/**
 * Create light theme
 */
let lightTheme: Theme = createTheme({
  ...baseThemeOptions,
  palette: lightPalette,
});

/**
 * Create dark theme
 */
let darkTheme: Theme = createTheme({
  ...baseThemeOptions,
  palette: darkPalette,
});

/**
 * Apply responsive typography
 */
// lightTheme = responsiveFontSizes(lightTheme);
// darkTheme = responsiveFontSizes(darkTheme);

/**
 * Get theme by mode
 */
export const getTheme = (mode: "light" | "dark"): Theme => {
  return mode === "dark" ? darkTheme : lightTheme;
};

export { lightTheme, darkTheme };
export default lightTheme;
