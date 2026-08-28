import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from "@mui/material";

interface CustomButtonProps extends MuiButtonProps {
  loading?: boolean;
  height?: string;
  isBaseHeight?: boolean;
}

/**
 * Custom Button component wrapper around MUI Button
 * Adds loading state support
 */
const CommonButton = ({
  loading = false,
  disabled,
  children,
  height,
  isBaseHeight = false,
  ...props
}: CustomButtonProps) => {
  return (
    <MuiButton
      {...props}
      sx={{ height: height || (isBaseHeight ? "40px" : "36px"), ...props.sx }}
      disabled={disabled || loading}
      startIcon={
        loading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          props.startIcon
        )
      }
    >
      {children}
    </MuiButton>
  );
};

export default CommonButton;
