import {
  Box,
  Divider,
  Grid,
  List,
  Typography,
  useMediaQuery,
  useTheme,
  Drawer,
} from "@mui/material";
import { useState } from "react";
import MessagesList from "./MessagesList";
import MessageView from "./MessageView";
import LeftFilters from "./LeftFilters";

import { useAppSelector, useAppDispatch } from "@/app/store";
import { useEffect } from "react";
import { setFilter, setRoleGroup } from "@/features/messages/slice";
import { fetchMessageCounts } from "@/features/messages/thunks";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";

const Messages = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { filters, counts, selectedMessageId, list } = useAppSelector((state) => state.messages);
  const isBelowMd = useMediaQuery(theme.breakpoints.down("lg"));

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(!isBelowMd);

  useEffect(() => {
    dispatch(fetchMessageCounts());
  }, [dispatch]);

  // Sync selectedMessage with Redux selectedMessageId
  useEffect(() => {
    if (!selectedMessageId) {
      setSelectedMessage(null);
    } else {
      // Optional: If you want to keep local state strictly in sync with Redux for open thread
      const found = list.find(t => t.thread_id === selectedMessageId);
      if (found) setSelectedMessage(found);
    }
  }, [selectedMessageId, list]);

  const menuItems = [
    { title: "All Messages", value: "all", badgeCount: counts.all },
    { title: "Unread", value: "unread", badgeCount: counts.unread },
    { title: "Flagged", value: "flagged", badgeCount: counts.flagged },
    { title: "Sent", value: "sent", badgeCount: counts.sent },
    { title: "Archived", value: "archived", badgeCount: counts.archived },
  ];

  const { options: roleOptions } = useDropdown(DropdownType.USER_ROLE);
  const roles = roleOptions
    .filter(opt => opt.value !== "" && opt.label !== "Admin") // exclude "All" option
    .map(opt => {
      const matchKey = Object.keys(counts.role_groups || {}).find(
        key => key.toLowerCase() === (opt.label || "").toLowerCase()
      );
      return {
        title: opt.label,
        value: opt.value,
        badgeCount: matchKey ? counts.role_groups[matchKey] : 0
      };
    });

  const handleToggleFilters = () => {
    if (isBelowMd) {
      setShowFilters(true);
    } else {
      setShowFilters((prev) => !prev);
    }
  };

  const handleFilterClick = (filterValue: string) => {
    if (filters.filter === filterValue) return;
    dispatch(setFilter(filterValue));
    if (isBelowMd) setShowFilters(false);
  };

  const handleRoleClick = (roleValue: string) => {
    // Assuming role click in sidebar sets the role filter
    // But we already have a dropdown for this? 
    // The screenshot shows "By Role Group" in sidebar too.
    // So we should probably sync them.
    if (filters.roleGroup === roleValue) return;
    dispatch(setRoleGroup(roleValue));
    if (isBelowMd) setShowFilters(false);
  };

  return (
    <Box sx={{ flex: 1, overflowX: "hidden" }}>
      <Grid container wrap="nowrap">
        {/* 🔹 LEFT FILTERS — DESKTOP */}
        {!isBelowMd && (
          <Grid
            size={{
              md: showFilters ? 2 : 0,
              lg: showFilters ? 2 : 0,
              xl: showFilters ? 2 : 0,
            }}
            sx={{
              borderRight: showFilters
                ? `1px solid ${theme.palette.divider}`
                : "none",
              overflow: "hidden",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              flexShrink: 0,
            }}
          >
            {showFilters && (
              <List
                sx={{ p: 2, gap: 1, display: "flex", flexDirection: "column" }}
              >
                <Typography
                  sx={{ mb: 1 }}
                  variant="body2"
                  color="text.secondary"
                >
                  Inbox
                </Typography>
                {menuItems.map((item) => (
                  <LeftFilters
                    key={item.title}
                    item={item}
                    isActive={filters.filter === item.value}
                    onClick={() => handleFilterClick(item.value)}
                  />
                ))}

                <Divider sx={{ my: 1 }} />

                <Typography
                  sx={{ mb: 1, textWrap: "nowrap" }}
                  variant="body2"
                  color="text.secondary"
                >
                  By Role Group
                </Typography>
                {roles.map((item) => (
                  <Box
                    sx={{
                      p: "6px 14px",
                      cursor: "default",
                      bgcolor: filters.roleGroup === item.value ? "primary.light" : "transparent",
                      borderRadius: "6px",
                      mb: 0.5,
                      // "&:hover": {
                      //   bgcolor: filters.roleGroup === item.value ? "primary.light" : "#F1F3F5",
                      // },
                    }}
                    key={item.title}
                    // onClick={() => handleRoleClick(String(item.value))}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        textWrap: "nowrap",
                        color: filters.roleGroup === item.value ? "primary.main" : "text.secondary",
                        fontWeight: filters.roleGroup === item.value ? 500 : 400
                      }}
                    >
                      {item.title} ({item.badgeCount})
                    </Typography>
                  </Box>
                ))}
              </List>
            )}
          </Grid>
        )}

        {/* 🔹 MOBILE DRAWER */}
        {isBelowMd && (
          <Drawer
            open={showFilters}
            onClose={() => setShowFilters(false)}
            anchor="left"
          >
            <Box sx={{ width: 240, p: 2 }}>
              <List sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
                <Typography
                  sx={{ mb: 1 }}
                  variant="body2"
                  color="text.secondary"
                >
                  Inbox
                </Typography>
                {menuItems.map((item) => (
                  <LeftFilters
                    key={item.title}
                    item={item}
                    isActive={filters.filter === item.value}
                    onClick={() => handleFilterClick(item.value)}
                  />
                ))}

                <Divider sx={{ my: 1 }} />

                <Typography
                  sx={{ mb: 1, textWrap: "nowrap" }}
                  variant="body2"
                  color="text.secondary"
                >
                  By Role Group
                </Typography>
                {roles.map((item) => (
                  <Box
                    sx={{
                      p: "6px 14px",
                      cursor: "pointer",
                      bgcolor: filters.roleGroup === item.value ? "primary.light" : "transparent",
                      borderRadius: "6px",
                      mb: 0.5,
                      "&:hover": {
                        bgcolor: filters.roleGroup === item.value ? "primary.light" : "#F1F3F5",
                      },
                    }}
                    key={item.title}
                    onClick={() => handleRoleClick(String(item.value))}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        textWrap: "nowrap",
                        color: filters.roleGroup === item.value ? "primary.main" : "text.secondary",
                        fontWeight: filters.roleGroup === item.value ? 500 : 400
                      }}
                    >
                      {item.title} ({item.badgeCount})
                    </Typography>
                  </Box>
                ))}
              </List>
            </Box>
          </Drawer>
        )}

        {/* 🔹 MESSAGE LIST */}
        <Grid
          size={{
            xs: 12,
            md:
              (!showFilters && !selectedMessage) || isBelowMd
                ? 12
                : showFilters
                  ? selectedMessage
                    ? 4
                    : 10
                  : selectedMessage
                    ? 4
                    : 6,
            lg:
              !showFilters && !selectedMessage
                ? 12
                : showFilters
                  ? selectedMessage
                    ? 4
                    : 10
                  : selectedMessage
                    ? 4
                    : 6,
            xl:
              !showFilters && !selectedMessage
                ? 12
                : showFilters
                  ? selectedMessage
                    ? 4
                    : 10
                  : selectedMessage
                    ? 4
                    : 6,
          }}
          sx={{
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            display: isBelowMd && selectedMessage ? "none" : "block",
            flexShrink: 0,
          }}
        >
          <MessagesList
            isOpen={handleToggleFilters}
            onSelect={setSelectedMessage}
            selectedMessage={selectedMessage}
          />
        </Grid>

        {/* 🔹 MESSAGE VIEW */}
        {selectedMessage && (
          <Grid
            size={{
              xs: 12,
              md: showFilters ? 6 : isBelowMd ? 12 : 8,
              lg: showFilters ? 6 : 8,
              xl: showFilters ? 6 : 8,
            }}
            sx={{
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              flexShrink: 0,
            }}
          >
            <MessageView
              message={selectedMessage}
              onClose={() => setSelectedMessage(null)}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Messages;
