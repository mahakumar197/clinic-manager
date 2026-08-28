import { useAppSelector } from "@/app/store";
import { CommonIconButton } from "@/components/common";
import CommonIcon from "@/components/common/CommonIcon";
import { ROUTES } from "@/constants";
import { useNotificationBadge } from "@/contexts/NotificationContext";
import { formatUserName } from "@/utils";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DropdownIcon } from "../../../assets";

type HeightValue = number | string;

type HeightMap = {
  xs?: HeightValue;
  sm?: HeightValue;
  md?: HeightValue;
  lg?: HeightValue;
  xl?: HeightValue;
};
interface TopBarProps {
  isSidebarOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  height: HeightMap;
}

const TopBar = ({
  isSidebarOpen,
  isMobile,
  toggleSidebar,
  height,
}: TopBarProps) => {
  const [language, setLanguage] = useState("EN");
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useNotificationBadge();
  
  const userName =
    user?.userName ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    user?.email ||
    "User";

  const avatarUrl = user?.avatar || user?.profileImage;
  const avatarLetter = userName.charAt(0).toUpperCase();
  return (
    <Box
      sx={{
        height: height,
        bgcolor: "background.paper",
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        px: { xs: 2, sm: 3, md: 3 },
        position: "fixed",
        top: 0,
        left: isMobile ? 0 : isSidebarOpen ? "260px" : "80px",
        transition: "left 0.3s ease",
        right: 0,
        zIndex: 1100,
      }}
    >
      <CommonIconButton
        onClick={toggleSidebar}
        // color="inherit"
        sx={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
        }}
        icon={
          isMobile ? (
            <CommonIcon name="ListMinus" size={22} />
          ) :
           (
            <span
              style={{
                display: "inline-flex",
                transform: !isSidebarOpen ? "scaleX(-1)" : "none",
                transition: "transform 0.3s ease",
              }}
            >
              <CommonIcon name="ListIndentDecrease" size={22} />
            </span>
          )
          // isSidebarOpen ? (
          //   <CommonIcon name="CircleChevronLeft" size={22} />
          // ) : (
          //   <CommonIcon name="CircleChevronRight" size={22} />
          // )
        }
      ></CommonIconButton>

      {/* Right Side – Actions */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: theme.spacing(3) }}
      >
        {/* Language Select */}
        {/* <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          variant="standard"
          disableUnderline
          IconComponent={() => (
            <Box
              component="img"
              src={DropdownIcon}
              sx={{
                width: 12,
                height: 12,
                position: "absolute",
                right: 10,
                pointerEvents: "none",
              }}
            />
          )}
          sx={{
            fontSize: 15,
            fontWeight: 500,
            color: "text.primary",
            "& .MuiSelect-select": {
              py: 0,
              pr: "22px !important",
            },
          }}
        >
          <MenuItem value="EN">EN</MenuItem>
          <MenuItem value="ES">ES</MenuItem>
          <MenuItem value="FR">FR</MenuItem>
        </Select> */}

        {/* Notifications */}
        <IconButton onClick={() => navigate(ROUTES?.NOTIFICATIONS)}>
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: 10,
                minWidth: 16,
                height: 16,
                padding: "0 4px",
              },
            }}
          >
            <CommonIcon
              name="Bell"
              size={20}
              color={theme.palette.text.primary}
            />
          </Badge>
        </IconButton>

        {/* Profile */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            cursor: "default",
          }}
          // onClick={() => navigate(ROUTES?.EDITUSER)}
        >
          {avatarUrl ? (
            <Avatar
              src={avatarUrl}
              sx={{
                width: { xs: 32, md: 36 },
                height: { xs: 32, md: 36 },
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: { xs: 32, md: 36 },
                height: { xs: 32, md: 36 },
                bgcolor: theme.palette.primary.main,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {avatarLetter}
            </Avatar>
          )}

          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 500,
              color: "text.primary",
              display: { xs: "none", md: "block" },
            }}
          >
            {/* {formatUserName(userName)} */}
            {userName}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TopBar;
