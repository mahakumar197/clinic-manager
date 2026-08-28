import { Box, useTheme, useMediaQuery } from "@mui/material";

interface PageContainerProps {
  children: React.ReactNode;
  fullHeight?: boolean; // stretches to full vertical height
  disableGutters?: boolean; // removes side padding
  maxWidth?: number | string; // custom max-width (default 1920)
}

const PageContainer = ({
  children,
  fullHeight = false,
  disableGutters = false,
  maxWidth = 1920,
}: PageContainerProps) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md")); // < 900px

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: disableGutters ? "100%" : maxWidth,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        // Padding logic: responsive + removable
        px: { xs: 2, sm: 3, md: 3, lg: 3 },
        py: { xs: 2, md: 4 },

        ...(fullHeight && { minHeight: "100%" }),
      }}
    >
      {children}
    </Box>
  );
};

export default PageContainer;
