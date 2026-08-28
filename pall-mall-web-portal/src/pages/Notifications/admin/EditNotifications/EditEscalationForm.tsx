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
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEscalation } from "../../hooks/useEscalation";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
import { CommonMultiSelect } from "@/components/common";
import { useEscalationRule } from "../../hooks/useEditEscalation";
import DeleteEscalationRuleModal from "../NotificationModals/DeleteEscalationRuleModal";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import { tablePalette } from "@/theme/tablePalette";
import { FinalRuleSchema } from "../CreateRule/Schemas";
import { toast } from "@/utils/toast";

interface EditEscalationFormProps {
  selectedEscalation?: any;
  onDelete: () => void;
}

type OptionType = { label: string; value: string | number };

const EditEscalationForm = ({
  selectedEscalation,
  onDelete,
}: EditEscalationFormProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const formRef = useRef<HTMLDivElement>(null);

  const selectedId = useAppSelector(
    (state) => state.notifications.selectedRuleId
  );

  const { rules, loading, refresh } = useEscalation();
  const [nameError, setNameError] = useState<string>("");

  const { options: conditionOptions } = useDropdown(
    DropdownType.ESCALATION_CONDITION,
    false
  );

  const { options: escalationTypeOptions } = useDropdown(
    DropdownType.ESCALATION_TYPE,
    false
  );

  const { options: actionOptions } = useDropdown(
    DropdownType.ESCALATION_TYPE,
    false
  );

  const { options: roleOptions } = useDropdown(DropdownType.ROLE_TYPE, false);

  const escalationData =
    selectedEscalation || rules.find((r) => r.id === selectedId);

  const { updateEscalationRule, toggleRuleStatus, updating, toggling } =
    useEscalationRule(escalationData?.id);

  const [selectedCondition, setSelectedCondition] = useState<OptionType | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<OptionType | null>(null);
  const [selectedAction, setSelectedAction] = useState<OptionType | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<OptionType[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const initialLoadDone = useRef<string | null>(null);

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

  const normalizeChannelKey = (chip: string) =>
    chip === "Daily Digest" ? "Digest" : chip;

  const denormalizeChannelKey = (
    key: string
  ): "IN_APP" | "EMAIL" | "DIGEST" => {
    if (key === "Digest") return "DIGEST";
    if (key === "In-App" || key === "In-App Notification") return "IN_APP";
    return "EMAIL";
  };

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

  // Filter available escalation conditions (exclude already used ones, but keep current rule's condition)
  const availableEscalationConditions = useMemo(() => {
    if (!escalationData)
      return conditionOptions.map((opt) => ({
        label: opt.label,
        value: opt.value,
      }));

    const usedConditionIds = rules
      .filter((rule) => rule.id !== escalationData.id)
      .map((rule) => rule.condition);

    const filtered = conditionOptions
      .filter((opt) => !usedConditionIds.includes(Number(opt.value)))
      .map((opt) => ({ label: opt.label, value: opt.value }));

    return filtered;
  }, [conditionOptions, rules, escalationData]);

  // Filter available escalation actions (exclude already used ones, but keep current rule's action)
  const availableEscalationActions = useMemo(() => {
    if (!escalationData)
      return escalationTypeOptions.map((opt) => ({
        label: opt.label,
        value: opt.value,
      }));

    const usedActionIds = rules
      .filter((rule) => rule.id !== escalationData.id)
      .map((rule) => rule.action);

    const filtered = escalationTypeOptions
      .filter((opt) => !usedActionIds.includes(Number(opt.value)))
      .map((opt) => ({ label: opt.label, value: opt.value }));

    return filtered;
  }, [escalationTypeOptions, rules, escalationData]);

  // Check if all escalation conditions are used (excluding current rule's condition)
  const allConditionsUsed = useMemo(() => {
    if (!escalationData) return false;

    return (
      conditionOptions.length > 0 &&
      availableEscalationConditions.length === 1 &&
      Number(availableEscalationConditions[0].value) ===
        escalationData.condition
    );
  }, [conditionOptions, availableEscalationConditions, escalationData]);

  // Check if all escalation actions are used (excluding current rule's action)
  const allActionsUsed = useMemo(() => {
    if (!escalationData) return false;

    return (
      escalationTypeOptions.length > 0 &&
      availableEscalationActions.length === 1 &&
      Number(availableEscalationActions[0].value) === escalationData.action
    );
  }, [escalationTypeOptions, availableEscalationActions, escalationData]);

  // Auto-scroll effect when escalationData changes
  useEffect(() => {
    if (escalationData && formRef.current) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [escalationData]);

  useEffect(() => {
    if (!escalationData) return;
    setNameError("");

    const ruleId = String(escalationData.id);
    const isNewRule = initialLoadDone.current !== ruleId;
    const hasAllOptions =
      availableEscalationConditions.length > 0 &&
      availableEscalationActions.length > 0 &&
      roleOptions.length > 0;

    if (isNewRule && hasAllOptions) {
      setForm({
        name: escalationData.name,
        channels: escalationData.channels.map(
          (c) => backendToUiChannelMap[c] ?? normalizeChannelKey(c)
        ),
        is_active: escalationData.is_active,
      });

      if (escalationData.condition !== undefined) {
        const conditionOption = availableEscalationConditions.find(
          (opt) => Number(opt.value) === escalationData.condition
        );
        setSelectedCondition(conditionOption || null);
      }

      if (escalationData.action !== undefined) {
        const typeOption = availableEscalationActions.find(
          (opt) => Number(opt.value) === escalationData.action
        );
        setSelectedType(typeOption || null);
      }

      if (escalationData.escalation_action !== undefined) {
        const actionOption = availableEscalationActions.find(
          (opt) => Number(opt.value) === escalationData.escalation_action
        );
        setSelectedAction(actionOption || null);
      }

      if (escalationData.recipients?.roles) {
        const roleSelections = escalationData.recipients.roles
          .map((roleName: string) => {
            const option = roleOptions.find(
              (opt) => opt.label.toLowerCase() === roleName.toLowerCase()
            );
            return option;
          })
          .filter(Boolean) as OptionType[];

        setSelectedRoles(roleSelections);
      }

      initialLoadDone.current = ruleId;
    }
  }, [
    escalationData?.id,
    availableEscalationConditions.length,
    availableEscalationActions.length,
    roleOptions.length,
  ]);

  const handleSave = async () => {
    if (!escalationData) return;

    const result = FinalRuleSchema.shape.ruleName.safeParse(form.name);
    if (!result.success) {
      setNameError(result.error.issues[0].message);
      toast.warning("Please fix the validation errors before saving.");
      return;
    }

    const backendRoles = selectedRoles.map((role) => role.value.toString());

    const payload = {
      ...escalationData,
      name: form.name,
      condition: selectedCondition?.value as number,
      action: selectedType?.value as number,
      recipients: {
        roles: backendRoles,
        users: escalationData.recipients.users,
        assignedTo: escalationData.recipients.assignedTo ?? false,
      },
      channels: form.channels.map(
        (c) => uiToBackendChannelMap[c] ?? denormalizeChannelKey(c)
      ),
      is_active: form.is_active,
    };

    try {
      await updateEscalationRule(payload);
      toast.success("Escalation rule updated successfully");
      navigate(-1);
    } catch (err) {
      console.error("Failed to update escalation rule", err);
      toast.error("Failed to update escalation rule");
    }
  };

  const handleToggleStatus = async (newStatus: boolean) => {
    if (!escalationData) return;

    setIsToggling(true);
    try {
      await toggleRuleStatus(newStatus);
      setForm((prev) => ({ ...prev, is_active: newStatus }));
      toast.success(`Rule ${newStatus ? "enabled" : "disabled"} successfully`);
    } catch (err) {
      console.error("Failed to toggle rule status", err);
      toast.error("Failed to update rule status");
      setForm((prev) => ({ ...prev, is_active: !newStatus }));
    } finally {
      setIsToggling(false);
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
          padding: 3,
          height: "100%",
        }}
      >
        {/* <Typography>Loading...</Typography> */}
        <CommonSkeleton type="editEscalation" />
      </Box>
    );
  }

  if (!escalationData) {
    return (
      <Box
        sx={{
          borderRadius: "14px",
          border: `1px solid ${tablePalette.pagination.contrastText}`,
          padding: 3,
          height: "100%",
        }}
      >
        <Typography>No escalation rule selected</Typography>
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
          padding: 3,
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

        {/*  Warning: All escalation conditions are used */}
        {allConditionsUsed && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="warning" sx={{ borderRadius: "10px" }}>
              <Typography variant="body2" fontWeight={500}>
                All other escalation conditions are in use
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                You can keep the current condition or delete another escalation
                rule to free up a different condition.
              </Typography>
            </Alert>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <CommonSelect
            label="Escalation Condition (If)"
            value={selectedCondition}
            onChange={setSelectedCondition}
            options={availableEscalationConditions}
          />
        </Box>

        {/*  Warning: All escalation actions are used */}
        {allActionsUsed && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="warning" sx={{ borderRadius: "10px" }}>
              <Typography variant="body2" fontWeight={500}>
                All other escalation actions are in use
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                You can keep the current action or delete another escalation
                rule to free up a different action.
              </Typography>
            </Alert>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <CommonSelect
            label="Escalation Type (Then)"
            value={selectedType}
            onChange={setSelectedType}
            options={availableEscalationActions}
          />
        </Box>

        <Divider />

        <Box sx={{ px: 1, my: 2 }}>
          <Typography>Notification Channels</Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                  borderRadius: "10px",
                  border: `1px solid ${tablePalette.pagination.contrastText}`,
                  padding: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5 }}>
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
                    onChange={() => {
                      let updatedChannels = [...form.channels];
                      if (isChecked) {
                        updatedChannels = updatedChannels.filter(
                          (c) => c !== channelKey
                        );
                      } else {
                        updatedChannels.push(channelKey);
                      }
                      setForm({ ...form, channels: updatedChannels });
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ my: 2 }} />

        <CommonMultiSelect
          label="Select recipients"
          value={selectedRoles}
          options={roleOptions}
          onChange={setSelectedRoles}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            my: 2,
          }}
        >
          <Typography>Rule Status</Typography>
          <ToggleSwitch
            checked={form.is_active}
            disabled={isToggling}
            onChange={() => handleToggleStatus(!form.is_active)}
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
            disabled={updating}
          >
            Cancel
          </CommonButton>
        </Box>
      </Box>

      <DeleteEscalationRuleModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        ruleId={escalationData.id}
        ruleName={escalationData.name}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default EditEscalationForm;
