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
import RuleActionsMenu from "../../RuleActionsMenu";
import DeleteEscalationRuleModal from "../NotificationModals/DeleteEscalationRuleModal";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import { toast } from "@utils/toast";

import { useEscalation } from "../../hooks/useEscalation";
import { escalationService } from "@/services/modules/ruleEscalation.service";
import { formatDropdownLabel } from "@/utils";
import { tablePalette } from "@/theme/tablePalette";

const EscalationRulesList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { rules, total, loading, refresh } = useEscalation();

  const [openEscalationDeleteModal, setOpenEscalationDeleteModal] =
    useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRuleId, setMenuRuleId] = useState<string | null>(null);
  const [selectedRuleName, setSelectedRuleName] = useState<string>("");

  const [togglingRuleId, setTogglingRuleId] = useState<string | null>(null);

  const getStatusChip = (status: boolean) => ({
    label: status ? "Active" : "Inactive",
    bg: status ? "success.light" : "error.light",
    color: status ? "success.dark" : "error.dark",
  });

  const backendToUiChannelMap: Record<string, string> = {
    IN_APP: "In-App",
    EMAIL: "Email",
    DIGEST: "Digest",
  };

  const getChannelIcon = (chip: string): LucideIconName => {
    const iconMap: Record<string, LucideIconName> = {
      IN_APP: "Bell",
      EMAIL: "Mail",
      DIGEST: "Timer",
    };
    return iconMap[chip] || "Bell";
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRuleId(null);
  };

  const handleToggleStatus = async (ruleId: string, currentStatus: boolean) => {
    setTogglingRuleId(ruleId);
    const newStatus = !currentStatus;

    try {
      await escalationService.toggleNotificationRuleStatus(ruleId, newStatus);

      refresh();

      toast.success(
        `Escalation rule ${
          newStatus ? "activated" : "deactivated"
        } successfully`
      );
    } catch (error) {
      console.error("Failed to toggle escalation rule status:", error);

      toast.error("Failed to update escalation rule status");
    } finally {
      setTogglingRuleId(null);
    }
  };

  const handleDeleteSuccess = () => {
    setOpenEscalationDeleteModal(false);
    setSelectedRuleId(null);
    setSelectedRuleName("");
    refresh();
  };

  const formatRole = (role: any): string => {
    if (typeof role === "number") {
      return String(role);
    }

    if (typeof role === "string") {
      return role;
    }

    if (typeof role === "object" && role !== null) {
      return String(role.id || role.value || role);
    }

    return String(role);
  };

  return (
    <>
      <Box
        sx={{
          borderRadius: "14px",
          border: `1px solid ${tablePalette.pagination.contrastText}`,
          width: "100%",
          padding: 3,
        }}
      >
        <Box
          sx={{
            px: 1,
            display: { sx: "none", sm: "flex" },
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
            <Typography variant="h6" color="text.primary">
              Escalation Rules
            </Typography>
          </Box>
          <Typography variant="body2" color="text.primary">
            {total} Total rules
          </Typography>
        </Box>

        {/* Rules List with Scroll */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: "500px",
            overflowY: "auto",
            pr: 0.5,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
          }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CommonSkeleton key={i} type="escalationCard" />
              ))
            : (rules || []).map((rule: any) => {
                const statusStyles = getStatusChip(rule.is_active);
                const isToggling = togglingRuleId === rule.id;

                return (
                  <Box
                    key={rule.id}
                    sx={{
                      borderRadius: "10px",
                      border: `1px solid ${tablePalette.pagination.contrastText}`,
                      padding: 2,
                      opacity: isToggling ? 0.6 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {/* ================= DESKTOP ================= */}
                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <CommonIcon
                          name="TriangleAlert"
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

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CommonIconButton
                          icon={
                            <CommonIcon
                              name="SquarePen"
                              color={theme.palette.text.primary}
                            />
                          }
                          disabled={isToggling}
                          onClick={() => {
                            dispatch(
                              setSelectedRule({
                                id: rule.id,
                                type: "escalation",
                              })
                            );
                            navigate(
                              ROUTES.EDIT_ESCALATIONS.replace(":id", rule.id)
                            );
                          }}
                        />
                        <CommonIconButton
                          icon={
                            <CommonIcon
                              name="Trash2"
                              color={theme.palette.error.dark}
                            />
                          }
                          disabled={isToggling}
                          onClick={() => {
                            setSelectedRuleId(rule.id);
                            setOpenEscalationDeleteModal(true);
                            setSelectedRuleName(rule.name);
                          }}
                        />
                        <ToggleSwitch
                          checked={rule.is_active}
                          disabled={isToggling}
                          onChange={() =>
                            handleToggleStatus(rule.id, rule.is_active)
                          }
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
                          name="TriangleAlert"
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

                        <CommonIconButton
                          sx={{ p: 0, m: 0 }}
                          icon={<CommonIcon name="MoreVertical" />}
                          disabled={isToggling}
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setMenuRuleId(rule.id);
                          }}
                        />

                        <RuleActionsMenu
                          anchorEl={anchorEl}
                          open={menuRuleId === rule.id}
                          onClose={handleMenuClose}
                          rule={{
                            id: rule.id,
                            title: rule.name,
                            status: rule.is_active,
                            condition: rule.condition_label ?? rule.condition,
                            action: rule.action_label ?? rule.action,
                            channels: rule.channels,
                            assigned: [
                              ...rule.recipients.roles.map(formatRole),
                              ...(rule.recipients?.users || []),
                            ],
                          }}
                          type="escalation"
                          onToggleStatus={(id) =>
                            handleToggleStatus(id, rule.is_active)
                          }
                          onEdit={(id) => {
                            dispatch(
                              setSelectedRule({ id, type: "escalation" })
                            );
                            navigate(
                              ROUTES.EDIT_ESCALATIONS.replace(":id", id)
                            );
                          }}
                          onDelete={() => {
                            setSelectedRuleId(rule.id);
                            setSelectedRuleName(rule.name);
                            setOpenEscalationDeleteModal(true);
                            handleMenuClose();
                          }}
                        />
                      </Box>
                    </Box>

                    {/* IF */}
                    <Box
                      sx={{ display: "flex", gap: 1, mt: 1, ml: { sm: 4.2 } }}
                    >
                      <Typography variant="body2" color="primary.main">
                        If:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {/* {rule.condition_label ?? rule.condition} */}
                        {formatDropdownLabel(rule.condition_label)}
                      </Typography>
                    </Box>

                    {/* TYPE */}
                    {rule.escalation_type_label && (
                      <Box
                        sx={{ display: "flex", gap: 1, mt: 1, ml: { sm: 4.2 } }}
                      >
                        <Typography variant="body2" color="secondary.main">
                          Type:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rule.escalation_type_label}
                        </Typography>
                      </Box>
                    )}

                    {/* THEN */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: 1,
                        ml: { xs: 0, sm: 4.2 },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color={tablePalette.tableText.Trigger}
                      >
                        Then:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {/* {rule.action_label ?? rule.action} */}
                        {formatDropdownLabel(rule.action_label)}
                      </Typography>
                    </Box>

                    {/* Channels & Recipients */}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        mt: 1,
                        ml: { xs: 0, sm: 4.2 },
                      }}
                    >
                      {rule.channels.map((chip, chipIndex) => {
                        const label = backendToUiChannelMap[chip] || chip;

                        return (
                          <Box
                            key={chipIndex}
                            sx={{
                              height: "22px",
                              borderRadius: "8px",
                              border: `1px solid ${tablePalette.pagination.contrastText}`,
                              px: 1.5,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              fontSize: "12px",
                              color: "#111827",
                            }}
                          >
                            <CommonIcon
                              name={getChannelIcon(chip)}
                              size={14}
                              color={theme.palette.text.secondary}
                            />
                            {label}
                          </Box>
                        );
                      })}
                      {((rule.recipients?.roles || []).length > 0 ||
                        (rule.recipients?.users || []).length > 0) && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.3,
                          }}
                        >
                          <CommonIcon
                            name="ArrowRight"
                            size={14}
                            color={theme.palette.text.secondary}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {[
                              ...rule.recipients.roles.map(formatRole),
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

      <DeleteEscalationRuleModal
        open={openEscalationDeleteModal}
        onClose={() => {
          setOpenEscalationDeleteModal(false);
          setSelectedRuleId(null);
          setSelectedRuleName("");
        }}
        ruleId={selectedRuleId}
        ruleName={selectedRuleName}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default EscalationRulesList;
