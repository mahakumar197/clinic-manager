import { Box, Typography, useTheme } from "@mui/material";
import CommonIcon from "./CommonIcon";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  height?: number | string;
  icon?: string;
}

const EmptyState = ({
  title = "",
  subtitle = "No Data Available",
  height = 140,
  icon = "FileX",
  
}: EmptyStateProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height,
        // border: `1px solid ${theme.palette.divider}`,
        borderRadius: "12px",
        backgroundColor: "#FAFAFA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Box>
        <CommonIcon name={icon as any} size={28} color={theme.palette.text.secondary} />

        <Typography  variant="h5" color="text.primary" mt={1} >
          {title}
        </Typography>

        <Typography variant="body2" color="text.primary" mt={0.5} >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default EmptyState;
