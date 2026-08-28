import { PallMallLogo } from "@/assets";
import { Box, List, useTheme, Skeleton, ListItem } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { MenuItem, SIDEBAR_WIDTH } from "./sidebarConfig";
import LogoutModal from "@/components/common/LogoutModal";
import { useAppSelector } from "@/app/store";
import { usePermissions } from "@/hooks/usePermissions";
import { getFilteredMenuItems, getDefaultPermissionsByRole } from "./menuItems";
import { SKELETON_ANIMATION } from "@/components/common/CommonSkeleton/constants";

interface sidebarProps {
  isOpenSidebar: boolean;
}

const Sidebar = ({ isOpenSidebar }: sidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openLogoutModal, setOpenLogoutModal] = useState(false);

  // Get permissions and loading states (show skeleton during initial load OR refetch)
  const { permissions, loading, refetching } = usePermissions();
  const permissionsLoading = loading || refetching;

  // Get dynamic counts
  const messageCounts = useAppSelector((state) => state.messages.counts);
  const userRole = useAppSelector((state) => state.auth.user?.role);
  // Filter menu items based on permissions
  const filteredMenuItems = getFilteredMenuItems(permissions);

  // Inject dynamic badge counts into filtered items
  const menuItems = filteredMenuItems.map((item) => {
    if (item.title === "Messages") {
      return {
        ...item,
        badgeCount: messageCounts?.unread > 0 ? messageCounts?.unread : null,
      };
    }
    return item;
  });

  const handleNavigation = (item: MenuItem) => {
    if (item.isLogout) {
      setOpenLogoutModal(true);
      return;
    }
    navigate(item.path);
  };

  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          width: isOpenSidebar ? SIDEBAR_WIDTH.open : SIDEBAR_WIDTH.closed,
          height: "100vh",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          borderRight: { md: `1px solid ${theme.palette.divider}`, xs: "none" },
          transition: "all 0.3s ease",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <Box sx={{ px: 3, py: 6, display: "flex", justifyContent: "center" }}>
          <Box
            component="img"
            src={PallMallLogo}
            sx={{
              width: isOpenSidebar ? 150 : 100,
              transition: "0.3s ease",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Menu */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 2 }}>
          {permissionsLoading ? (
            // Show loading skeletons based on user role
            <List sx={{ p: 0 }}>
              {getFilteredMenuItems(
                getDefaultPermissionsByRole(userRole)
              ).map((item, index) => (
                <ListItem key={index} disablePadding sx={{ mb: 3.5 }}>
                  <Skeleton
                     animation={SKELETON_ANIMATION}
                    variant="rectangular"
                    height={48}
                    sx={{ borderRadius: "6px", width: "100%" }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <List sx={{ p: 0 }}>
              {menuItems?.map((item) => {
                const isActive = item.isLogout
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <SidebarItem
                    key={item.title}
                    item={item}
                    isOpenSidebar={isOpenSidebar}
                    isActive={isActive}
                    onClick={handleNavigation}
                  />
                );
              })}
            </List>
          )}
        </Box>
      </Box>

      {/* LOGOUT MODAL */}
      <LogoutModal
        open={openLogoutModal}
        onClose={() => setOpenLogoutModal(false)}
      />
    </>
  );
};

export default Sidebar;
