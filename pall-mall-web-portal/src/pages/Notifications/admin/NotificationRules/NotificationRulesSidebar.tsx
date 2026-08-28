import { useAppDispatch, useAppSelector } from "@/app/store";
import { CommonIcon } from "@/components/common";
import { LucideIconName } from "@/components/common/lucideIcons";
import { setSelectedRule } from "@/features/notification";
import { Box, Typography, useTheme } from "@mui/material";
import CommonSkeleton from "@/components/common/CommonSkeleton";
import { useNotification } from "../../hooks/useNotification";
import { formatDropdownLabel } from "@/utils";
import { tablePalette } from "@/theme/tablePalette";

const NotificationRulesSidebar = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { rules, loading } = useNotification();

  const selectedId = useAppSelector(
    (state) => state.notifications.selectedRuleId
  );
  const selectedType = useAppSelector(
    (state) => state.notifications.selectedType
  );

  const getChannelLabel = (chip: string) =>
    chip === "DIGEST" ? "Digest" : chip.replace("_", " ");

  const getChannelIcon = (chip: string): LucideIconName => {
    const channelMap: Record<string, LucideIconName> = {
      IN_APP: "Bell",
      EMAIL: "Mail",
      DIGEST: "Timer",
    };
    return channelMap[chip] || "Bell";
  };

  const getStatusChip = (status: boolean) => ({
    label: status ? "Active" : "Inactive",
    bg: status ? "success.light" : "error.light",
    color: status ? "success.dark" : "error.dark",
  });

  return (
    <Box
      sx={{
        display: { xs: "none", sm: "block" },
        borderRadius: "14px",
        border: `1px solid ${tablePalette.pagination.contrastText}`,
        padding: 3,
        height: "100%",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ px: 1, display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="body1" color="text.primary">
          Notification Rules
        </Typography>
      </Box>

      {/* Rules List with Scroll */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxHeight: "755px",
          overflowY: "auto",
          pr: 0.5,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#CBD5E1",
            borderRadius: "10px",
            "&:hover": {
              backgroundColor: "#94A3B8",
            },
          },
        }}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <CommonSkeleton key={i} type="notificationCard" />
            ))
          : rules.map((rule) => {
              const isSelected =
                selectedType === "notification" && selectedId === rule.id;

              const statusStyles = getStatusChip(rule.is_active);

              return (
                <Box
                  key={rule.id}
                  onClick={() =>
                    dispatch(
                      setSelectedRule({
                        id: rule.id,
                        type: "notification",
                      })
                    )
                  }
                  sx={{
                    borderRadius: "10px",
                    border: `1px solid ${
                      isSelected
                        ? theme.palette.primary.main
                        : tablePalette.pagination.contrastText
                    }`,
                    backgroundColor: isSelected
                      ? "#FFFBEB"
                      : "background.paper",
                    padding: 2,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: isSelected ? "#FFFBEB" : "#FAFAFA",
                    },
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.2 }}
                    >
                      <CommonIcon
                        name="Bell"
                        size={18}
                        color={theme.palette.primary.main}
                      />

                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ fontWeight: 500 }}
                      >
                        {rule.name}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        height: "20px",
                        borderRadius: "999px",
                        px: 1.2,
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: "11px",
                        fontWeight: 500,
                        backgroundColor: statusStyles.bg,
                        color: statusStyles.color,
                        lineHeight: 1,
                      }}
                    >
                      {statusStyles.label}
                    </Box>
                  </Box>

                  {/* Trigger */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      // mt: 1,
                      ml: { xs: 0.5, sm: 3.6 },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color={tablePalette.tableText.Trigger}
                    >
                      Trigger:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDropdownLabel(rule.trigger_event_label_ui)}
                    </Typography>
                  </Box>

                  {/* Channels & Recipients */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      // mt: 1,
                      ml: { xs: 0.5, sm: 3.6 },
                    }}
                  >
                    {rule.channels.map((chip, chipIndex) => (
                      <Box
                        key={chipIndex}
                        sx={{
                          height: "22px",
                          borderRadius: "8px",
                          border: `1px solid ${tablePalette.pagination.contrastText}`,
                          px: 1.5,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.8,
                          fontSize: "12px",
                          color: "#111827",
                        }}
                      >
                        <CommonIcon
                          name={getChannelIcon(chip)}
                          size={14}
                          color="#111827"
                        />
                        {getChannelLabel(chip)}
                      </Box>
                    ))}

                    {(rule.role_labels_ui.length > 0 ||
                      (rule.recipients?.users?.length || 0) > 0) && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.3 }}
                      >
                        <CommonIcon
                          name="ArrowRight"
                          size={14}
                          color={theme.palette.text.secondary}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {[
                            ...rule.role_labels_ui,
                            ...(rule.recipients?.users || []),
                          ].join(", ")}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
      </Box>
    </Box>
  );
};

export default NotificationRulesSidebar;
