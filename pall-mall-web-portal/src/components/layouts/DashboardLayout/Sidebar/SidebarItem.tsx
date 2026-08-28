import {
  Box,
  ListItem,
  ListItemButton,
  Typography,
  Tooltip,
  useTheme,
} from "@mui/material";
import { MenuItem } from "./sidebarConfig";

interface Props {
  item: MenuItem;
  isActive: boolean;
  isOpenSidebar: boolean;
  onClick: (item: MenuItem) => void;
}

const SidebarItem = ({ item, isActive, isOpenSidebar, onClick }: Props) => {
  const theme = useTheme();
  const isLogout = item.isLogout;

  // ACTIVE STATE COLORS
  const activeBg = isLogout ? "error.main" : "primary.main";
  const activeText = theme.palette.primary.contrastText;
  const activeIcon = "brightness(0) invert(100%)"; // white icon

  // DEFAULT (not active)
  const defaultText = "text.secondary";
  const defaultIcon = isLogout
    ? "brightness(0) saturate(100%) opacity(0.6)" // gray icon
    : "brightness(0) saturate(0%) opacity(0.6)";

  // HOVER STATE
  const hoverBg = 0.5;
  const hoverText = isLogout ? "error.main" : "text.secondary";
  const hoverIcon = isLogout
    ? "brightness(0) saturate(100%) invert(40%) sepia(92%) saturate(3898%) hue-rotate(351deg)"
    : defaultIcon;

  return (
    <ListItem disablePadding sx={{ mb: 3.5 }}>
      <Tooltip
        title={!isOpenSidebar ? item.title : ""}
        placement="right"
        arrow
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: isLogout ? "error.main" : "primary.main",
              color: "primary.contrastText",
              fontSize: theme.typography.caption.fontSize,
              fontWeight: theme.typography.subtitle2.fontWeight,
              borderRadius: "6px",
              px: 1.5,
              py: 0.5,
            },
          },
          arrow: {
            sx: {
              color: isLogout ? "error.main" : "primary.main",
            },
          },
        }}
      >
        <ListItemButton
          onClick={() => onClick(item)}
          sx={{
            borderRadius: "6px",
            p: isOpenSidebar ? "13px 16px" : "10px",
            minHeight: { xs: "44px", md: "48px" },
            justifyContent: isOpenSidebar ? "flex-start" : "center",
            gap: isOpenSidebar ? "12px" : "0px",
            bgcolor: isActive ? activeBg : "transparent",

            "&:hover": {
              bgcolor: isActive
                ? activeBg
                : isLogout
                ? "error.light"
                : "primary.light",

              "& .sidebar-text": {
                color: isActive ? activeText : hoverText,
              },

              "& img": {
                filter: isActive
                  ? activeIcon
                  : isLogout
                  ? hoverIcon
                  : defaultIcon,
              },
            },
          }}
        >
          {/* Icon */}
          <Box
            component="img"
            src={item.icon}
            sx={{
              width: { xs: 20, md: 24 },
              height: { xs: 20, md: 24 },
              flexShrink: 0,
              filter: isActive ? activeIcon : defaultIcon,
            }}
          />
          {/* Text */}
          {isOpenSidebar && (
            <Typography
              className="sidebar-text"
              variant="body1"
              sx={{
                color: isActive ? activeText : defaultText,
                flex: 1,
                whiteSpace: "nowrap",
                // overflow: "hidden",
                // textOverflow: "ellipsis",
              }}
            >
              {item.title}
            </Typography>
          )}
          {/* Badge */}
          {isOpenSidebar && item.badgeCount && (
            <Box
              sx={{
                bgcolor: "error.main",
                color: "primary.contrastText",
                fontSize: theme.typography.body2.fontSize,
                fontWeight: theme.typography.body2.fontWeight,
                minWidth: "28px",
                height: "23px",
                borderRadius: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.badgeCount}
            </Box>
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
};

export default SidebarItem;
