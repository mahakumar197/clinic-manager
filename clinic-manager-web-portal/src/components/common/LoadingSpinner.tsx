import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
  color?: "primary" | "secondary" | "inherit";
}

/**
 * Loading spinner component
 * Can be used as inline spinner or full-screen loading overlay
 */
const LoadingSpinner = ({
  size = 40,
  text,
  fullScreen = false,
  color = "primary",
}: LoadingSpinnerProps) => {
  const content = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress size={size} color={color} />
      {text && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;
