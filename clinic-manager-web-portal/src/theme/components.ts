import { Components, Theme } from '@mui/material/styles';

/**
 * Global component style overrides
 * Customize default MUI component styles
 */

export const components: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        padding: '8px 16px',
      },
      containedPrimary: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiFilledInput-root': {
          borderRadius: 10,
        },
      },
    },
    defaultProps: {
      variant: 'outlined',
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 600,
      },
    },
  },
  MuiLink:{
    styleOverrides:{
      root:{
        cursor:'pointer',
        '&:hover': {
          textDecoration: 'underline',
          textUnderlineOffset: "0.5rem",
        },
      }
    }
  }
};
