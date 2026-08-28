import {
  CommonButton,
  CommonIconButton,
  CommonIcon,
  CommonPageHeader,
} from "@/components/common";
import PageContainer from "@/components/layouts/PageContainer";
import Modal from "@/components/common/Modal";
import {
  Box,
  Chip,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import { useEffect, useState } from "react";
import { LucideIconName } from "@/components/common/lucideIcons";
import { CommonCards } from "@/components/common";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import { useNotifications } from "../hooks/useNotifications";
import { formatMessageTime, formatNotificationDate } from "@/utils/date";
import { formatDateTime } from "@/utils";

const NotificationsView = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const [deleteNotificationId, setDeleteNotificationId] = useState<string | null>(null);

  // Use the custom hook to fetch notifications
  const {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();

  // Map stats to cards
  const cards = [
    {
      id: 1,
      title: "Total Tasks",
      value: stats.totalCount,
      iconName: "Users",
      variant: "green",
    },
    {
      id: 2,
      title: "Urgency",
      value: stats.urgentCount,
      iconName: "ClipboardClock",
      variant: "red",
    },
    {
      id: 3,
      title: "High priority",
      value: stats.unreadCount,
      iconName: "Loader",
      variant: "orange",
    },
  ];

  const iconMap: Record<
    string,
    {
      icon: LucideIconName;
      color: string;
    }
  > = {
    task_created: {
      icon: "Clock",
      color: theme.palette.error.main,
    },
    patient: {
      icon: "MessageSquare",
      color: theme.palette.success.main,
    },
    system: {
      icon: "AlertCircle",
      color: theme.palette.error.main,
    },
    reminder: {
      icon: "Bell",
      color: theme.palette.secondary.light,
    },
    default: {
      icon: "FileText",
      color: theme.palette.info.main,
    },
  };

  // Handlers
  // ----------------------------------
  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDismiss = async (id: string) => {
    await dismissNotification(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const newCount = notifications.filter(
    (n) => n.notificationStatus === "unread"
  ).length;


  return (
    <PageContainer>
      {/* Only show header when there are notifications or loading */}
      {(loading || notifications.length > 0) && (
        <Grid
          container
          spacing={2}
          alignItems="center"
        >
          {/* HEADER */}
          <Grid size={{ xs: 12, md: 7 }}>
            <CommonPageHeader
              title="Notifications"
              subtitle="Stay updated with real-time alerts and reminders"
            />
          </Grid>

          {/* ACTIONS - Only show when there are notifications */}
          {!loading && notifications.length > 0 && (
            <Grid size={{ xs: 12, md: 5 }}>
              <Grid
                container
                spacing={1}
                alignItems="center"
                justifyContent="flex-end"
              >
                <Grid size={{ xs: 3, sm: "auto" }}>
                  <Chip
                    label={`${newCount} New`}
                    size="small"
                    sx={{
                      bgcolor: newCount > 0 ? theme.palette.error.main : theme.palette.primary.main,
                      color: "background.paper",
                      fontWeight: 600,
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 9, sm: "auto" }}>
                  <CommonButton
                    variant="outlined"
                    startIcon={<CommonIcon name="CheckCheck" />}
                    disabled={newCount === 0}
                    sx={{
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 0.6, sm: 0.8 },
                      whiteSpace: "nowrap",
                      width: { xs: "100%", sm: "auto" },
                    }}
                    onClick={handleMarkAllRead}
                  >
                    Mark all as read
                  </CommonButton>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      )}


      {/* cards - Only show when there are notifications or loading */}
      {(loading || notifications.length > 0) && (
        <Grid container spacing={2}>
          {cards.map((c) => (
            <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.5 }}>
              <CommonCards {...c} loading={loading} />
            </Grid>
          ))}
        </Grid>
      )}

      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
          <CommonSkeleton key={i} type="doctorNotification" />
        ))
        : notifications.length === 0
        ? (
          // Empty State - Centered on page
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh", // Take up most of viewport height
              py: 8,
              px: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: theme.palette.action.hover,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <CommonIcon
                name="BellOff"
                size={40}
                color={theme.palette.text.secondary}
              />
            </Box>
            <Typography variant="h6" gutterBottom>
              No Notifications Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up! No notifications at the moment.
            </Typography>
          </Box>
        )
        : notifications.map((item) => {
          const isUrgent =
            item.notificationStatus === "unread" && item.priority === "urgent";
          const isNew = item.notificationStatus === "unread" && !isUrgent;
          const isRead = item.notificationStatus === "read";

          const bgColor = isUrgent
            ? "error.light"
            : isNew
              ? "primary.light"
              : theme.palette.background.paper;

          const borderColor = isUrgent
            ? theme.palette.error.main
            : isNew
              ? theme.palette.warning.main
              : theme.palette.divider;

          const iconConfig = iconMap[item.notificationType || "default"] || iconMap.default;

          return (
            <Box
              key={item.id}
              sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: { xs: "12px", md: "14px" },
                border: `1px solid ${borderColor}`,
                borderLeft: `4px solid ${borderColor}`,
                bgcolor: bgColor,
              }}
            >
              {/* Mobile Layout */}
              {isBelowMd ? (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {/* Header Row: Icon + Title + Badge */}
                  <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "background.paper",
                        border: `1px solid ${theme.palette.divider}`,
                        flexShrink: 0,
                      }}
                    >
                      <CommonIcon
                        name={iconConfig.icon}
                        color={iconConfig.color}
                        size={18}
                      />
                    </Box>

                    {/* Title + Badge Row */}
                    <Box sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start",
                      flex: 1,
                      minWidth: 0,
                      gap: 1,
                    }}>
                      <Typography 
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1.4,
                          marginTop: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {item.subject}
                      </Typography>

                      {/* Urgent Badge - Top Right */}
                      {isUrgent && (
                        <Chip
                          icon={<CommonIcon name="ShieldAlert" size={14} />}
                          label="Urgent"
                          size="small"
                          sx={{
                            bgcolor: theme.palette.error.main,
                            color: "white",
                            height: 24,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Content */}
                  {item.content && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        mb: 1.5,
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.content}
                    </Typography>
                  )}

                  {/* Patient Info Pills */}
                  {(item.patientName || item.patientReference) && (
                    <Box sx={{ display: "flex", gap: 0.75, mb: 1.5, flexWrap: "wrap" }}>
                      {item.patientName && (
                        <Chip
                          label={item.patientName}
                          size="small"
                          sx={{
                            bgcolor: "transparent",
                            border: `0.3px solid ${theme.palette.secondary.contrastText}`,
                            fontSize: "11px",
                            height: "22px",
                            maxWidth: "100%",
                            "& .MuiChip-label": {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }
                          }}
                        />
                      )}
                      {/* {item.patientReference && (
                        <Chip
                          label={item.patientReference}
                          size="small"
                          sx={{
                            bgcolor: "transparent",
                            border: `0.3px solid ${theme.palette.secondary.contrastText}`,
                            color: theme.palette.text.secondary,
                            fontSize: "11px",
                            height: "22px",
                            maxWidth: "100%",
                            "& .MuiChip-label": {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }
                          }}
                        />
                      )} */}
                    </Box>
                  )}

                  {/* Footer: Time + Due Date + Actions */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {/* Left: Time + Due Date */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatMessageTime(item.createdAt)}
                      </Typography>
                      
                      {isUrgent && item.dueAt && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CommonIcon
                            name="Hourglass"
                            size={12}
                            color={theme.palette.error.main}
                          />
                          <Typography
                            variant="caption"
                            color="error.main"
                            sx={{ fontWeight: 600, fontSize: "11px" }}
                          >
                            {formatNotificationDate(item.dueAt)}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Right: Compact Actions */}
                    <Box sx={{ display: "flex", gap: 0.75 }}>
                      {item.notificationStatus === "unread" && (
                        <CommonIconButton
                          size="small"
                          onClick={() => handleMarkRead(item.id)}
                          sx={{ 
                            bgcolor: alpha(theme.palette.success.main, 0.08),
                            "&:hover": { bgcolor: alpha(theme.palette.success.main, 0.16) }
                          }}
                          icon={
                            <CommonIcon
                              name="CircleCheck"
                              size={18}
                              color={theme.palette.success.main}
                            />
                          }
                          tooltip="Mark Read"
                        />
                      )}
                      
                      <CommonIconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteNotificationId(item.id);
                        }}
                        sx={{ 
                          bgcolor: alpha(theme.palette.error.main, 0.08),
                          "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.16) }
                        }}
                        icon={
                          <CommonIcon
                            name="Trash2"
                            size={18}
                            color={theme.palette.error.main}
                          />
                        }
                        tooltip="Delete"
                      />
                    </Box>
                  </Box>
                </Box>
              ) : (
                // Desktop Layout (Original)
                <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, width: "100%" }}>
                  <Box sx={{ width: { xs: "36px", sm: "40px" }, flexShrink: 0 }}>
                    <Box
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "background.paper",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <CommonIcon
                        name={iconConfig.icon}
                        color={iconConfig.color}
                        size={18}
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 1.5, sm: 0 },
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: 1,
                        minWidth: 0,
                        flex: 1
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          flexWrap: "wrap",
                          minWidth: 0,
                        }}
                      >
                        <Typography 
                          variant="subtitle2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            wordBreak: "break-word"
                          }}
                        >
                          {item.subject}
                        </Typography>
                        <Box sx={{ display: "flex", gap: "2px" }}>
                          {isUrgent && (
                            <>
                              <Box>
                                <CommonIcon
                                  name="Hourglass"
                                  size={14}
                                  color={theme.palette.error.main}
                                />

                                <Typography
                                  variant="caption"
                                  color="error.main"
                                >
                                  {formatNotificationDate(item.dueAt)}
                                </Typography>
                              </Box>
                            </>
                          )}

                          {isUrgent && (
                            <Chip
                              label="Urgent"
                              size="small"
                              sx={{
                                bgcolor: theme.palette.error.main,
                                color: "background.paper",
                                height: 20,
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {item.content && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ 
                            mb: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            wordBreak: "break-word"
                          }}
                        >
                          {item.content}
                        </Typography>
                      )}

                      <Grid
                        sx={{ 
                          display: "flex", 
                          gap: 1, 
                          mb: { xs: 0, sm: 0 },
                          flexWrap: "wrap",
                          maxWidth: { xs: "100%", sm: "300px" }
                        }}
                      >
                        {item.patientName && (
                          <Chip
                            label={item.patientName}
                            size="small"
                            sx={{
                              bgcolor: "transparent",
                              border: `0.3px solid ${theme.palette.secondary.contrastText}`,
                              fontSize: { xs: "11px", sm: "12px" },
                              height: { xs: "22px", sm: "24px" },
                              maxWidth: "100%",
                              "& .MuiChip-label": {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }
                            }}
                          />
                        )}
                        {/* {item.patientReference && (
                          <Chip
                            label={item.patientReference}
                            size="small"
                            sx={{
                              bgcolor: "transparent",
                              border: `0.3px solid ${theme.palette.secondary.contrastText}`,
                              color: theme.palette.text.secondary,
                              fontSize: { xs: "11px", sm: "12px" },
                              height: { xs: "22px", sm: "24px" },
                              maxWidth: "100%",
                              "& .MuiChip-label": {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }
                            }}
                          />
                        )} */}
                      </Grid>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: { xs: "flex-start", sm: "flex-end" },
                        gap: 1.3,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {formatMessageTime(item.createdAt)}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        {/* MARK AS READ */}
                        {item.notificationStatus === "unread" && (
                          <CommonButton
                            size="small"
                            variant="outlined"
                            startIcon={<CommonIcon name="CircleCheck" />}
                            onClick={() => handleMarkRead(item.id)}
                            sx={{ bgcolor: "background.paper" }}
                          >
                            Mark Read
                          </CommonButton>
                        )}

                        {/* DISMISS */}
                        <CommonButton
                          size="small"
                          variant="outlined"
                          startIcon={<CommonIcon name="Trash2" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteNotificationId(item.id);
                          }}
                          sx={{ bgcolor: "background.paper" }}
                        >
                          Delete
                        </CommonButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}

      {/* DELETE CONFIRMATION DIALOG */}
      <Modal
        open={!!deleteNotificationId}
        onClose={() => setDeleteNotificationId(null)}
        title="Delete Notification"
        maxWidth="xs"
        actions={
          <>
            <CommonButton variant="outlined" onClick={() => setDeleteNotificationId(null)}>
              Cancel
            </CommonButton>
            <CommonButton
              variant="contained"
              onClick={() => {
                if (deleteNotificationId) handleDismiss(deleteNotificationId);
                setDeleteNotificationId(null);
              }}
              sx={{ bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}
            >
              Delete
            </CommonButton>
          </>
        }
      >
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to delete this notification?
        </Typography>
      </Modal>
    </PageContainer>
  );
};
export default NotificationsView;