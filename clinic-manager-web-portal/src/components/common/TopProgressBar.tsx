import { Box, LinearProgress } from "@mui/material";

interface TopProgressBarProps {
  /** When true the progress bar is visible */
  loading: boolean;
}

/**
 * A non-intrusive, thin loading bar that renders at the top of its
 * nearest `position: relative` parent. Uses absolute positioning so it
 * causes **zero layout shift**.
 */
const TopProgressBar = ({ loading }: TopProgressBarProps) => {
  if (!loading) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        height: "3px",
        overflow: "hidden",
        borderRadius: "10px 10px 0 0",
      }}
    >
      <LinearProgress
        sx={{
          height: "2.8px",
          // "& .MuiLinearProgress-bar": {
          //   borderRadius: "4px",
          // },
        }}
      />
    </Box>
  );
};

export default TopProgressBar;
