import { useAppSelector } from "@/app/store";
import {
  CommonButton,
  CommonIconButton,
  CommonTextField,
  ToggleSwitch,
  CommonIcon,
  CommonSelect,
} from "@/components/common";
import { ROUTES } from "@/constants";
import { Box, Divider, Typography, useTheme, Alert } from "@mui/material";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../hooks/useNotification";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
import { CommonMultiSelect } from "@/components/common";
import { useNotificationRule } from "../../hooks/editNotification";
import { notificationService } from "@/services/modules/ruleNotification.service";
import DeleteNotificationRuleModal from "../NotificationModals/DeleteNotificationRuleModal";
import { tablePalette } from "@/theme/tablePalette";
import { FinalRuleSchema } from "../CreateRule/Schemas";
import { toast } from "@/utils/toast";
import CommonSkeleton from "@/components/common/CommonSkeleton";

interface EditNotificationFormProps {
  selectedNotification?: any;
  onDelete: () => void;
}

type OptionType = { label: string; value: string | number };

const EditNotificationForm = ({ onDelete }: EditNotificationFormProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const formRef = useRef<HTMLDivElement>(null);

  const selectedId = useAppSelector(
    (state) => state.notifications.selectedRuleId
  );

  const { rules, loading, refresh } = useNotification();
  const [nameError, setNameError] = useState<string>("");

  const { options: triggerEventOptions } = useDropdown(
    DropdownType.TRIGGER_EVENT,
    false
  );
  const { options: roleOptions } = useDropdown(DropdownType.ROLE_TYPE, false);

  const selectedNotification = rules.find((r) => r.id === selectedId);

  const { updateNotificationRule, updating } = useNotificationRule(
    selectedNotification?.id
  );

  const [selectedTrigger, setSelectedTrigger] = useState<OptionType | null>(
    null
  );
  const [selectedRoles, setSelectedRoles] = useState<OptionType[]>([]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const notificationChannels = [
    {
      title: "In-App Notification",
      message: "Show alert in the portal",
      icon: (
        <CommonIcon
          name="Bell"
          size={20}
          color={theme.palette.text.secondary}
        />
      ),
    },
    {
      title: "Email Notification",
      message: "Send immediate email",
      icon: (
        <CommonIcon
          name="Mail"
          size={20}
          color={theme.palette.text.secondary}
        />
      ),
    },
    {
      title: "Daily Digest",
      message: "Include in daily summary email",
      icon: (
        <CommonIcon
          name="Clock"
          size={20}
          color={theme.palette.text.secondary}
        />
      ),
    },
  ];

  const [form, setForm] = useState({
    name: "",
    channels: [] as string[],
    is_active: false,
  });

  const [statusUpdating, setStatusUpdating] = useState(false);

  const backendToUiChannelMap: Record<string, string> = {
    IN_APP: "In-App",
    EMAIL: "Email",
    DIGEST: "Digest",
  };

  const uiToBackendChannelMap: Record<string, "IN_APP" | "EMAIL" | "DIGEST"> = {
    "In-App": "IN_APP",
    Email: "EMAIL",
    Digest: "DIGEST",
  };

  // Filter available trigger events (exclude already used ones, but keep current rule's trigger)
  const availableTriggerEvents = useMemo(() => {
    if (!selectedNotification) return triggerEventOptions;

    const usedTriggerEventIds = rules
      .filter((rule) => rule.id !== selectedNotification.id)
      .map((rule) => rule.trigger_event);

    const filtered = triggerEventOptions.filter(
      (opt) => !usedTriggerEventIds.includes(Number(opt.value))
    );

    return filtered;
  }, [triggerEventOptions, rules, selectedNotification]);

  // Check if all trigger events are used (excluding current rule's trigger)
  const allTriggerEventsUsed = useMemo(() => {
    if (!selectedNotification) return false;

    return (
      triggerEventOptions.length > 0 &&
      availableTriggerEvents.length === 1 &&
      Number(availableTriggerEvents[0].value) ===
        selectedNotification.trigger_event
    );
  }, [triggerEventOptions, availableTriggerEvents, selectedNotification]);

  useEffect(() => {
    if (selectedNotification && formRef.current) {
      const timer = setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedNotification]);

  useEffect(() => {
    if (!selectedNotification) return;
    setNameError("");
    setForm({
      name: selectedNotification.name,
      channels: selectedNotification.channels.map(
        (c) => backendToUiChannelMap[c]
      ),
      is_active: selectedNotification.is_active,
    });

    const triggerOption = triggerEventOptions.find(
      (opt) => opt.value === selectedNotification.trigger_event
    );
    setSelectedTrigger(triggerOption || null);

    const roleSelections = selectedNotification.recipients.roles
      .map((roleName: string) => {
        const option = roleOptions.find(
          (opt) => opt.label.toLowerCase() === roleName.toLowerCase()
        );
        return option;
      })
      .filter(Boolean) as OptionType[];

    setSelectedRoles(roleSelections);
  }, [selectedNotification, triggerEventOptions, roleOptions]);

  const handleStatusToggle = async () => {
    if (!selectedNotification) return;

    const newStatus = !form.is_active;
    setStatusUpdating(true);

    try {
      await notificationService.toggleNotificationRuleStatus(
        selectedNotification.id,
        newStatus
      );

      setForm((prev) => ({
        ...prev,
        is_active: newStatus,
      }));
      toast.success(`Rule ${newStatus ? "enabled" : "disabled"} successfully`);
    } catch (err) {
      console.error("Failed to toggle rule status", err);
      toast.error("Failed to update rule status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedNotification) return;

    const result = FinalRuleSchema.shape.ruleName.safeParse(form.name);
    if (!result.success) {
      setNameError(result.error.issues[0].message);
      toast.warning("Please fix the validation errors before saving.");
      return;
    }

    const backendRoles = selectedRoles.map((role) => role.value.toString());

    const payload = {
      name: form.name,
      triggerEvent: selectedTrigger?.value as number,
      recipients: {
        roles: backendRoles,
        users: selectedNotification.recipients.users || [],
      },
      channels: form.channels.map((c) => uiToBackendChannelMap[c]),
      is_active: form.is_active,
    };

    try {
      await updateNotificationRule(payload);
      toast.success("Notification rule updated successfully");
      navigate(-1);
    } catch (err) {
      console.error("Failed to update notification rule", err);
      toast.error("Failed to update notification rule");
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    refresh();
    navigate(-1);
  };

  if (loading) {
    return (
      <Box
        sx={{
          borderRadius: "14px",
          border: `1px solid ${tablePalette.pagination.contrastText}`,
          p: 3,
        }}
      >
        <CommonSkeleton type="editNotification" />
      </Box>
    );
  }

  if (!selectedNotification) {
    return (
      <Box
        sx={{
          borderRadius: "14px",
          border: `1px solid ${tablePalette.pagination.contrastText}`,
          p: 3,
        }}
      >
        <Typography>No notification rule selected</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        ref={formRef}
        sx={{
          borderRadius: "14px",
          border: `1px solid ${tablePalette.pagination.contrastText}`,
          p: 3,
        }}
      >
        <Box
          sx={{
            px: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="body1">Edit Rule</Typography>
          <CommonIconButton
            icon={<CommonIcon name="Trash2" color={theme.palette.error.dark} />}
            onClick={handleDeleteClick}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          {/* <CommonTextField
            label="Rule Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          /> */}
          <CommonTextField
            label="Rule Name"
            value={form.name}
            onChange={(e) => {
              const value = e.target.value;
              setForm({ ...form, name: value });
              const result = FinalRuleSchema.shape.ruleName.safeParse(value);
              setNameError(
                result.success ? "" : result.error.issues[0].message
              );
            }}
            error={!!nameError}
            helperText={nameError}
          />
        </Box>

        {/*  Warning: All trigger events are used */}
        {allTriggerEventsUsed && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="warning" sx={{ borderRadius: "10px" }}>
              <Typography variant="body2" fontWeight={500}>
                All other trigger events are in use
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                You can keep the current trigger event or delete another
                notification rule to free up a different trigger event.
              </Typography>
            </Alert>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <CommonSelect
            label="Trigger Event"
            value={selectedTrigger}
            onChange={setSelectedTrigger}
            options={availableTriggerEvents}
          />
        </Box>

        <Divider />

        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body1">Notification Channels</Typography>
        </Box>

        {notificationChannels.map((value, index) => {
          const channelKey =
            value.title === "Daily Digest"
              ? "Digest"
              : value.title.split(" ")[0];

          const isChecked = form.channels.includes(channelKey);

          return (
            <Box
              key={index}
              sx={{
                border: `1px solid ${tablePalette.pagination.contrastText}`,
                borderRadius: "10px",
                p: 2,
                mb: 2,
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box display="flex" gap={1.5} alignItems="flex-start">
                  <Box sx={{ mt: "4px" }}>{value.icon}</Box>
                  <Box>
                    <Typography>{value.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.message}
                    </Typography>
                  </Box>
                </Box>
                <ToggleSwitch
                  checked={isChecked}
                  onChange={() =>
                    setForm({
                      ...form,
                      channels: isChecked
                        ? form.channels.filter((c) => c !== channelKey)
                        : [...form.channels, channelKey],
                    })
                  }
                />
              </Box>
            </Box>
          );
        })}

        <Divider />

        <Box sx={{ mt: 2, mb: 2 }}>
          <CommonMultiSelect
            label="Select recipients"
            value={selectedRoles}
            options={roleOptions}
            onChange={setSelectedRoles}
          />
        </Box>

        <Box
          sx={{
            px: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="body1">Rule Status</Typography>
          <ToggleSwitch
            checked={form.is_active}
            disabled={statusUpdating}
            onChange={handleStatusToggle}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 1 },
            mt: 4,
          }}
        >
          <CommonButton
            variant="contained"
            fullWidth
            onClick={handleSave}
            disabled={updating}
          >
            {updating ? "Saving..." : "Save Changes"}
          </CommonButton>

          <CommonButton
            variant="outlined"
            fullWidth
            onClick={() => navigate(-1)}
          >
            Cancel
          </CommonButton>
        </Box>
      </Box>

      <DeleteNotificationRuleModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        ruleId={selectedNotification.id}
        ruleName={selectedNotification.name}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default EditNotificationForm;
