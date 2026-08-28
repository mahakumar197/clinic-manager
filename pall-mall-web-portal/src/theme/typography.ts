/**
 * Typography configuration
 * Defines font families, sizes, and weights
 */

/*
 *REM CALCULATE
 *1rem = 16px   (default browser setting)
 *px → rem
 *32px -> 32/16 = 2rem
 */

export const typography = {
  fontFamily: "Inter, Arial, sans-serif",

  h1: {
    fontSize: "2.5rem",
    fontWeight: 700,
    lineHeight: 1.2,

    "@media (max-width: 768px)": {
      fontSize: "2.25rem",
    },
    "@media (max-width: 480px)": {
      fontSize: "2rem",
    },
  },

  h2: {
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1.3,

    "@media (max-width: 768px)": {
      fontSize: "1.75rem",
    },
    "@media (max-width: 480px)": {
      fontSize: "1.6rem",
    },
  },

  h3: {
    fontSize: "1.75rem",
    fontWeight: 700,
    lineHeight: 1.4,

    "@media (max-width: 768px)": {
      fontSize: "1.6rem",
    },
    "@media (max-width: 480px)": {
      fontSize: "1.45rem",
    },
  },

  h4: {
    fontSize: "1.5rem",
    fontWeight: 700,
    lineHeight: 1.4,

    "@media (max-width: 768px)": {
      fontSize: "1.35rem",
    },
    "@media (max-width: 480px)": {
      fontSize: "1.25rem",
    },
  },

  h5: {
    fontSize: "1.25rem",
    fontWeight: 700,
    lineHeight: 1.5,

    "@media (max-width: 768px)": {
      fontSize: "1.2rem",
    },
    "@media (max-width: 480px)": {
      fontSize: "1.1rem",
    },
  },

  h6: {
    fontSize: "1.2rem",
    fontWeight: 500,
    lineHeight: 1.5,

    "@media (max-width: 768px)": {
      fontSize: "1.1rem",
    },
    "@media (max-width: 480px)": {
      fontSize: "1rem",
    },
  },

  subtitle1: {
    fontSize: "1.25rem",
    fontWeight: 400,
    lineHeight: 1.5,

    "@media (max-width: 480px)": {
      fontSize: "1.05rem",
    },
  },

  subtitle2: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.5,

    "@media (max-width: 480px)": {
      fontSize: "0.9rem",
    },
  },

  body1: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.5,

    "@media (max-width: 480px)": {
      fontSize: "0.9rem",
    },
  },

  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.43,

    "@media (max-width: 480px)": {
      fontSize: "0.8rem",
    },
  },

  button: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: "none",

    "@media (max-width: 480px)": {
      fontSize: "0.8rem",
    },
  },

  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.66,

    "@media (max-width: 480px)": {
      fontSize: "0.7rem",
    },
  },

  overline: {
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: 2.66,
    textTransform: "uppercase",

    "@media (max-width: 480px)": {
      fontSize: "0.7rem",
    },
  },
};
