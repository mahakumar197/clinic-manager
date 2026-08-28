import { useAppDispatch } from "@/app/store";
import {
  CommonIconButton,
  ToggleSwitch,
  CommonIcon,
} from "@/components/common";
import { LucideIconName } from "@/components/common/lucideIcons";
import { ROUTES } from "@/constants";
import { setSelectedRule } from "@/features/notification";
import { Box, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteNotificationRuleModal from "../NotificationModals/DeleteNotificationRuleModal";
import CommonSkeleton from "@/components/common/CommonSkeleton";
import { useNotification } from "../../hooks/useNotification";
import RuleActionsMenu from "../../RuleActionsMenu";
import { toast } from "@utils/toast";
import { formatDropdownLabel } from "@/utils";
import { tablePalette } from "@/theme/tablePalette";

const NotificationRulesList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { rules, total, loading, refresh, toggleRuleStatus, toggling } =
    useNotification();

  const [openNotificationDeleteModal, setOpenNotificationDeleteModal] =
    useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [selectedRuleName, setSelectedRuleName] = useState<string>("");

  const getChannelLabel = (chip: string) =>
    chip === "DIGEST" ? "Digest" : chip.replace("_", " ");

  const getChannelIcon = (chip: string): LucideIconName => {
    const iconMap: Record<string, LucideIconName> = {
      IN_APP: "Bell",
      EMAIL: "Mail",
      DIGEST: "Timer",
    };
    return iconMap[chip] || "Bell";
  };

  const getStatusChip = (status: boolean) => ({
    label: status ? "Active" : "Inactive",
    bg: status ? "success.light" : "error.light",
    color: status ? "success.dark" : "error.dark",
  });

  const handleDeleteSuccess = () => {
    setOpenNotificationDeleteModal(false);
    setSelectedRuleId(null);
    setSelectedRuleName("");
    refresh();
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRuleId, setMenuRuleId] = useState<string | null>(null);

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRuleId(null);
  };

  const handleToggle = async (ruleId: string, currentStatus: boolean) => {
    try {
      await toggleRuleStatus(ruleId, currentStatus);
      const newStatus = !currentStatus;
      toast.success(
        `Notification rule ${
          newStatus ? "activated" : "deactivated"
        } successfully`
      );
    } catch (error) {
      toast.error("Failed to update notification rule status");
      console.error("Toggle error:", error);
    }
  };

  return (
    <>
      <Box
        sx={{
          borderRadius: "14px",
          border: `1px solid ${tablePalette.pagination.contrastText}`,
          p: 3,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 1,
            display: { sx: "none", sm: "flex" },
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6">Notification Rules</Typography>
          <Typography variant="body2">{total} Total rules</Typography>
        </Box>

        {/* Rules List with Scroll */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: "550px",
            overflowY: "auto",
            pr: 0.5,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
          }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CommonSkeleton key={i} type="notificationCard" />
              ))
            : rules.map((rule) => {
                const statusStyles = getStatusChip(rule.is_active);

                return (
                  <Box
                    key={rule.id}
                    sx={{
                      borderRadius: "10px",
                      border: `1px solid ${tablePalette.pagination.contrastText}`,
                      p: 2,
                    }}
                  >
                    {/* Rule Header */}
                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CommonIcon
                          name="Bell"
                          size={20}
                          color={theme.palette.primary.main}
                        />
                        <Typography>{rule.name}</Typography>
                        <Box
                          sx={{
                            height: "22px",
                            borderRadius: "8px",
                            px: 1.5,
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: "12px",
                            fontWeight: 500,
                            backgroundColor: statusStyles.bg,
                            color: statusStyles.color,
                          }}
                        >
                          {statusStyles.label}
                        </Box>
                      </Box>

                      {/* Action buttons */}
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        {/* Edit */}
                        <CommonIconButton
                          icon={
                            <CommonIcon
                              name="SquarePen"
                              color={theme.palette.text.primary}
                            />
                          }
                          onClick={() => {
                            dispatch(
                              setSelectedRule({
                                id: rule.id,
                                type: "notification",
                              })
                            );
                            navigate(
                              ROUTES.EDIT_NOTIFICATIONS.replace(":id", rule.id)
                            );
                          }}
                        />

                        {/* Delete */}
                        <CommonIconButton
                          icon={
                            <CommonIcon
                              name="Trash2"
                              color={theme.palette.error.dark}
                            />
                          }
                          onClick={() => {
                            setSelectedRuleId(rule.id);
                            setSelectedRuleName(rule.name);
                            setOpenNotificationDeleteModal(true);
                          }}
                        />

                        {/* Toggle Active/Inactive */}
                        <ToggleSwitch
                          checked={rule.is_active}
                          disabled={toggling[rule.id]}
                          onChange={() => handleToggle(rule.id, rule.is_active)}
                        />
                      </Box>
                    </Box>

                    {/* ================= MOBILE ================= */}
                    <Box
                      sx={{
                        display: { xs: "flex", sm: "none" },
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1.2 }}>
                        <CommonIcon
                          name="Bell"
                          size={18}
                          color={theme.palette.primary.main}
                        />
                        <Typography>{rule.name}</Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <CommonIcon
                          name={rule.is_active ? "CheckCircle" : "CircleSlash"}
                          size={18}
                          color={
                            rule.is_active
                              ? theme.palette.success.main
                              : theme.palette.error.main
                          }
                        />

                        {/* MENU BUTTON */}
                        <CommonIconButton
                          sx={{ p: 0, m: 0 }}
                          icon={<CommonIcon name="MoreVertical" />}
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setMenuRuleId(rule.id);
                          }}
                        />

                        {/* RULE ACTION MENU */}
                        <RuleActionsMenu
                          anchorEl={anchorEl}
                          open={menuRuleId === rule.id}
                          onClose={handleMenuClose}
                          rule={{
                            id: rule.id,
                            title: rule.name,
                            status: rule.is_active,
                            channels: rule.channels,
                            assigned: [
                              ...rule.role_labels_ui,
                              ...(rule.recipients?.users || []),
                            ],
                            trigger: rule.trigger_event_label_ui,
                          }}
                          type="notification"
                          onToggleStatus={(id) =>
                            toggleRuleStatus(id, rule.is_active)
                          }
                          onEdit={(id) => {
                            dispatch(
                              setSelectedRule({ id, type: "notification" })
                            );
                            navigate(
                              ROUTES.EDIT_NOTIFICATIONS.replace(":id", id)
                            );
                          }}
                          onDelete={(id) => {
                            setSelectedRuleId(id);
                            setSelectedRuleName(rule.name);
                            setOpenNotificationDeleteModal(true);
                            handleMenuClose();
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Trigger */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: 1,
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
                        mt: 1,
                        ml: { xs: 0.5, sm: 3.6 },
                      }}
                    >
                      {rule.channels.map((chip, i) => (
                        <Box
                          key={i}
                          sx={{
                            height: 22,
                            borderRadius: 8,
                            border: `1px solid ${tablePalette.pagination.contrastText}`,
                            px: 1.5,
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CommonIcon
                            name={getChannelIcon(chip)}
                            size={14}
                            color={theme.palette.text.secondary}
                          />
                          {getChannelLabel(chip)}
                        </Box>
                      ))}

                      {(rule.role_labels_ui.length > 0 ||
                        (rule.recipients?.users?.length || 0) > 0) && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <CommonIcon name="ArrowRight" size={14} />
                          <Typography variant="caption">
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

      {/* Delete Modal */}
      <DeleteNotificationRuleModal
        open={openNotificationDeleteModal}
        ruleId={selectedRuleId}
        ruleName={selectedRuleName}
        // onClose={() => setOpenNotificationDeleteModal(false);
        //   setSelectedRuleName("");
        // }
        onClose={() => {
          setOpenNotificationDeleteModal(false);
          setSelectedRuleId(null);
        }}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default NotificationRulesList;
