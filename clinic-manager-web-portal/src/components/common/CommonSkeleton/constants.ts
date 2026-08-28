// CommonSkeleton/constants.ts

/** Skeleton animation type */
export const SKELETON_ANIMATION = "wave" as const;

/** Common skeleton sizes */
export const SKELETON_SIZES = {
  avatar: {
    sm: 24,
    md: 40,
    lg: 72,
  },

  text: {
    xs: 12,
    sm: 14,
    md: 18,
    lg: 22,
    xl: 28,
  },

  button: {
    sm: 32,
    md: 36,
    lg: 44,
  },

  image: {
    sm: 120,
    md: 180,
    lg: 260,
  },
};

/** Common border radius values */
export const SKELETON_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  round: "50%",
};

/** Default spacing values */
export const SKELETON_SPACING = {
  xs: 0.5,
  sm: 1,
  md: 2,
  lg: 3,
};

/** Default card styles */
export const SKELETON_CARD_STYLE = {
  padding: 3,
  borderRadius: "14px",
  borderColor: "#E5E7EB",
  backgroundColor: "#fff",
};

/** Default chart heights */
export const SKELETON_CHART_HEIGHT = {
  bar: 320,
  line: 280,
  pie: 280,
};

/** Common colors (used only where needed) */
export const SKELETON_COLORS = {
  border: "#E5E7EB",
  background: "#FFFFFF",
  mutedBackground: "#F8FAFC",
};
