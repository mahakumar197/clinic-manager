import {
  Box,
  ListItem,
  ListItemButton,
  Typography,
  useTheme,
} from "@mui/material";
import { contentPreviewStyle } from "./styles";

interface Props {
  item: { title: string; badgeCount?: number; isLogout?: boolean };
  isActive: boolean;
  onClick: () => void;
}

const LeftFilters = ({ item, isActive, onClick }: Props) => {
  const theme = useTheme();

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: "6px",
          gap: "50px",
          p: "10px 14px",
          minHeight: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: isActive ? "primary.light" : "transparent",
          // flexWrap:'wrap',
          "&:hover": {
            bgcolor: isActive ? "primary.light" : "#F1F3F5",
          },
        }}
      >
        {/* FILTER TITLE */}
        <Typography
          variant="body2"
          sx={{...contentPreviewStyle,
            color: isActive ? theme.palette.primary.main : "text.secondary",
          }}
        >
          {item.title}
        </Typography>

        {/* BADGE */}
        {item?.badgeCount !== undefined && (
          <Box
            sx={{
              bgcolor: isActive
                ? theme.palette.primary.light
                : theme.palette.divider,
              color: isActive
                ? theme.palette.primary.main
                : theme.palette.text.primary,
              fontSize: theme.typography.caption.fontSize,
              fontWeight: theme.typography.subtitle2.fontWeight,
              minWidth: "28px",
              height: "23px",
              borderRadius: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              border: isActive
                ? `1px solid ${theme.palette.primary.main}`
                : "none",
            }}
          >
            {item.badgeCount}
          </Box>
        )}
      </ListItemButton>
    </ListItem>
  );
};

export default LeftFilters;
