import { Box, useTheme } from "@mui/material";
import { tablePalette } from "@/theme/tablePalette";
import { CommonIcon } from "@/components/common";

export const Card = ({ children, sx = {} }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        borderRadius: "14px",
        border: `1px solid ${theme.palette.divider}`,
        p: 3,
        width: "100%",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export const Dot = ({ color = "primary.main" }) => (
  <Box
    sx={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: color,
      mt: "6px",
      flexShrink: 0,
    }}
  />
);

export const IconImg = ({ src, size = 20, alt = "" }) => (
  <Box
    component="img"
    src={src}
    alt={alt}
    sx={{ width: size, height: size, objectFit: "contain" }}
  />
);

export const DotWithLine = ({ isLast = false }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 24,
      }}
    >
      <Dot />
      {!isLast && (
        <Box
          sx={{
            position: "absolute",
            top: 20,
            width: 3,
            height: "calc(100% - 10px)",
            backgroundColor: "#E2E8F0",
            zIndex: 0,
          }}
        />
      )}
    </Box>
  );
};


export const commentsDummy = [
  {
    id: 1,
    name: "Jane Williams",
    role: "Coordinator",
    avatar: "JW",
    avatarBg: "#FEF3C6",
    avatarColor: tablePalette.tableText.pending,
    timestamp: "2025-11-04 14:30",
    message:
      "Patient has been contacted and confirmed availability for pre-op appointment.",
  },
  {
    id: 2,
    name: "Dr. James Smith",
    role: "Surgeon",
    avatar: "DJS",
    avatarBg: "#FEF3C6",
    avatarColor: tablePalette.tableText.pending,
    timestamp: "2025-11-04 10:15",
    message:
      "Please ensure all consent forms are completed before the scheduled date.",
  },
  {
    id: 2,
    name: "Dr. James Smith",
    role: "Surgeon",
    avatar: "DJS",
    avatarBg: "#FEF3C6",
    avatarColor: tablePalette.tableText.pending,
    timestamp: "2025-11-04 10:15",
    message:
      "Please ensure all consent forms are completed before the scheduled date.",
  },
];

export const attachmentsDummy = [
  {
    name: "consent-form.pdf",
    size: "142 KB",
    iconColor: tablePalette.tableTextBackground.manager,
    icon: <CommonIcon name="FileText" color="#155DFC" />,
  },
  {
    name: "medical-history.pdf",
    size: "98 KB",
    iconColor: tablePalette.tableTextBackground.active,
    icon: <CommonIcon name="FileText" color="#00A63E" />,
  },
  {
    name: "medical-history.pdf",
    size: "98 KB",
    iconColor: tablePalette.tableTextBackground.active,
    icon: <CommonIcon name="FileText" color="#00A63E" />,
  },
];
