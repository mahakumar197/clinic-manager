// Step1RuleDetails.tsx
import { Box, Paper, Typography, useTheme, Alert } from "@mui/material";
import { Controller } from "react-hook-form";
import { CommonTextField, CommonSelect, CommonIcon } from "@/components/common";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
import { useMemo, useEffect } from "react";

interface Props {
  form: any;
  existingRules?: any[];
}

const Step1RuleDetails = ({ form, existingRules = [] }: Props) => {
  const theme = useTheme();
  const ruleType = form.watch("ruleType");

  // Trigger events (Notification)
  const { options: triggerEventOptions } = useDropdown(
    DropdownType.TRIGGER_EVENT,
    false
  );

  // Escalation conditions
  const { options: escalationConditionOptions } = useDropdown(
    DropdownType.ESCALATION_CONDITION,
    false
  );

  // Escalation actions
  const { options: escalationActionOptions } = useDropdown(
    DropdownType.ESCALATION_TYPE,
    false
  );

  // useEffect(() => {
  //   form.setValue("ruleName", "");
  // }, [ruleType]);

  const availableTriggerEvents = useMemo(() => {
    const usedTriggerEventIds = existingRules
      .filter((rule) => rule.ruleType === "notification" && rule.triggerEvent)
      .map((rule) => rule.triggerEvent);

    return triggerEventOptions
      .filter((opt) => !usedTriggerEventIds.includes(opt.value))
      .map((opt) => ({
        label: opt.label,
        value: opt.value,
      }));
  }, [triggerEventOptions, existingRules]);

  const availableEscalationConditions = useMemo(() => {
    const usedConditionIds = existingRules
      .filter(
        (rule) => rule.ruleType === "escalation" && rule.escalationCondition
      )
      .map((rule) => rule.escalationCondition);

    return escalationConditionOptions
      .filter((opt) => !usedConditionIds.includes(opt.value))
      .map((opt) => ({
        label: opt.label,
        value: opt.value,
      }));
  }, [escalationConditionOptions, existingRules]);

  const availableEscalationActions = useMemo(() => {
    const usedActionIds = existingRules
      .filter((rule) => rule.ruleType === "escalation" && rule.escalationAction)
      .map((rule) => rule.escalationAction);

    return escalationActionOptions
      .filter((opt) => !usedActionIds.includes(opt.value))
      .map((opt) => ({
        label: opt.label,
        value: opt.value,
      }));
  }, [escalationActionOptions, existingRules]);

  // Check if all options are used
  const allTriggerEventsUsed =
    triggerEventOptions.length > 0 && availableTriggerEvents.length === 0;
  const allEscalationConditionsUsed =
    escalationConditionOptions.length > 0 &&
    availableEscalationConditions.length === 0;
  const allEscalationActionsUsed =
    escalationActionOptions.length > 0 &&
    availableEscalationActions.length === 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Rule Type */}
      <Box>
        <Typography 
          variant="button"
          sx={{ 
            mb: 1.5,
            display: "block"
          }}
        >
          Rule Type
        </Typography>
        <Controller
          name="ruleType"
          control={form.control}
          render={({ field }) => (
            <Box 
              sx={{ 
                display: "flex", 
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1.5, sm: 2 }
              }}
            >
              {[
                {
                  key: "notification",
                  title: "Notification Rule",
                  description: "Send alerts when events occur",
                },
                {
                  key: "escalation",
                  title: "Escalation Rule",
                  description: "Escalate when conditions are met",
                },
              ].map((item) => {
                const isActive = field.value === item.key;

                return (
                  <Paper
                    key={item.key}
                    elevation={0}
                    onClick={() => {
                      if (field.value !== item.key) {
                        form.setValue("ruleName", "");
                        field.onChange(item.key);
                      }
                    }}
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: "10px",
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor: isActive ? "primary.main" : "divider",
                      bgcolor: isActive ? "#FFFBEB" : "background.paper",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    {/* Icon and Title - Responsive Layout */}
                    <Box
                      sx={{
                        display: { xs: "flex", sm: "block" },
                        alignItems: {
                          xs: "center",
                          sm: "flex-start",
                        },
                        gap: {
                          xs: 1,
                          sm: 0,
                        },
                        mb: 1,
                      }}
                    >
                    <CommonIcon
                      name={
                        item.key === "notification" ? "Bell" : "AlertTriangle"
                      }
                      size={24}
                      color={theme.palette.primary.main}
                    />
                    <Typography variant="body1">{item.title}</Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          )}
        />
      </Box>

      {/*  Warning: All Notification Trigger Events Used */}
      {ruleType === "notification" && allTriggerEventsUsed && (
        <Alert severity="warning" sx={{ borderRadius: "10px" }}>
          <Typography variant="body2" fontWeight={500}>
            All trigger events have been used
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            You cannot create more notification rules because all available
            trigger events are already assigned to existing rules. Please delete
            an existing notification rule to free up a trigger event.
          </Typography>
        </Alert>
      )}

      {/*  Warning: All Escalation Options Used */}
      {ruleType === "escalation" &&
        (allEscalationConditionsUsed || allEscalationActionsUsed) && (
          <Alert severity="warning" sx={{ borderRadius: "10px" }}>
            <Typography variant="body2" fontWeight={500}>
              {allEscalationConditionsUsed && allEscalationActionsUsed
                ? "All escalation conditions and actions have been used"
                : allEscalationConditionsUsed
                ? "All escalation conditions have been used"
                : "All escalation actions have been used"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              You cannot create more escalation rules because all available
              options are already assigned to existing rules. Please edit or
              delete an existing escalation rule to free up the required
              options.
            </Typography>
          </Alert>
        )}

      {/* Rule Name */}
      <Controller
        name="ruleName"
        control={form.control}
        render={({ field, fieldState }) => (
          <CommonTextField
            {...field}
            label="Rule Name *"
            placeholder="e.g., Task Overdue Reminder"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      {/* Notification Rule */}
      {ruleType === "notification" && (
        <Controller
          name="triggerEvent"
          control={form.control}
          render={({ field, fieldState }) => (
            <CommonSelect
              label="Trigger Event *"
              options={availableTriggerEvents}
              value={
                availableTriggerEvents.find((o) => o.value === field.value) ||
                null
              }
              onChange={(option: any) =>
                field.onChange(option ? option.value : undefined)
              }
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              placeholder={
                availableTriggerEvents.length === 0
                  ? "All trigger events are already used"
                  : "Select trigger event"
              }
              disabled={availableTriggerEvents.length === 0}
            />
          )}
        />
      )}

      {/* Escalation Rule */}
      {ruleType === "escalation" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Escalation Condition */}
          <Controller
            name="escalationCondition"
            control={form.control}
            render={({ field, fieldState }) => (
              <CommonSelect
                label="Escalation Condition *"
                options={availableEscalationConditions}
                value={
                  availableEscalationConditions.find(
                    (o) => o.value === field.value
                  ) || null
                }
                onChange={(option: any) =>
                  field.onChange(option ? option.value : undefined)
                }
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                placeholder={
                  availableEscalationConditions.length === 0
                    ? "All escalation conditions are already used"
                    : "Select escalation condition"
                }
                disabled={availableEscalationConditions.length === 0}
              />
            )}
          />

          {/* Escalation Action */}
          <Controller
            name="escalationAction"
            control={form.control}
            render={({ field, fieldState }) => (
              <CommonSelect
                label="Escalation Action *"
                options={availableEscalationActions}
                value={
                  availableEscalationActions.find(
                    (o) => o.value === field.value
                  ) || null
                }
                onChange={(option: any) =>
                  field.onChange(option ? option.value : undefined)
                }
                placeholder={
                  availableEscalationActions.length === 0
                    ? "All escalation actions are already used"
                    : "Select escalation action"
                }
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                disabled={availableEscalationActions.length === 0}
              />
            )}
          />
        </Box>
      )}
    </Box>
  );
};

export default Step1RuleDetails;
