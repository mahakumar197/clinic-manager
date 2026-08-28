// Step3RuleSummary.tsx
import { CommonMultiSelect } from "@/components/common";
import { Box, Typography, Paper, Chip, Stack } from "@mui/material";
import { Controller } from "react-hook-form";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
const Step3RuleSummary = ({ form }) => {
  const data = form.watch();

  const { options: triggerEventOptions } = useDropdown(
    DropdownType.TRIGGER_EVENT,
    false,
  );
  const { options: escalationConditionOptions } = useDropdown(
    DropdownType.ESCALATION_CONDITION,
    false,
  );
  const { options: escalationActionOptions } = useDropdown(
    DropdownType.ESCALATION_TYPE,
    false,
  );
  const { options: roleOptions } = useDropdown(DropdownType.ROLE_TYPE, false);

  const ROLE_OPTIONS = [
    { label: "All Roles", value: "ALL" }, 
    ...roleOptions.map((opt) => ({
      label: opt.label,
      value: opt.value.toString(),
    })),
  ];

  const channels: string[] = [];
  if (data.channelInApp) channels.push("In-App");
  if (data.channelEmail) channels.push("Email");
  if (data.channelDigest) channels.push("Daily Digest");

  const getLabel = (options, value?: number) => {
    if (!value) return "—";
    return options.find((o) => o.value === value)?.label ?? "—";
  };

  const getRecipientLabels = (ids: string[] = []) =>
    ids.map((id) => ROLE_OPTIONS.find((o) => o.value === id)?.label ?? id);

  return (
    <Stack spacing={3}>
      {/* Recipients */}
      <Controller
        name="recipients"
        control={form.control}
        rules={{ required: "At least one recipient is required" }}
        render={({ field, fieldState }) => (
          <CommonMultiSelect
            label="Select recipients *"
            value={
              Array.isArray(field.value)
                ? field.value
                    .map((v) => ROLE_OPTIONS.find((o) => o.value === v))
                    .filter(Boolean)
                : []
            }
            options={ROLE_OPTIONS}
            onChange={(opts) => {
              const values = opts.map((o) => o.value);

              if (values.includes("ALL")) {
                field.onChange(roleOptions.map((r) => r.value.toString()));
              } else {
                field.onChange(values);
              }
            }}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      {/* Rule Summary */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Rule Summary
        </Typography>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "12px",
            bgcolor: "#FFFFFF",
            px: { xs: 1.5, sm: 2.5 },
            py: { xs: 1, sm: 1.5 },
            overflow: "visible", 
          }}
        >
          <SummaryRow
            label={
              data.ruleType === "notification"
                ? "Notification Rule Name:"
                : "Escalation Rule Name:"
            }
            value={data.ruleName || "—"}
          />

          <SummaryRow
            label="Type:"
            value={
              <Chip
                label={
                  data.ruleType === "notification"
                    ? "Notification"
                    : "Escalation"
                }
                size="small"
                sx={{
                  bgcolor:
                    data.ruleType === "notification" ? "#E0E7FF" : "#FEF3C7",
                  color:
                    data.ruleType === "notification" ? "#1E40AF" : "#92400E",
                  fontWeight: 500,
                  borderRadius: "8px",
                  fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                  height: { xs: 20, sm: 24 },
                }}
              />
            }
          />

          {data.ruleType === "notification" ? (
            <SummaryRow
              label="Trigger:"
              value={getLabel(triggerEventOptions, data.triggerEvent)}
            />
          ) : (
            <>
              <SummaryRow
                label="Condition:"
                value={getLabel(
                  escalationConditionOptions,
                  data.escalationCondition,
                )}
              />
              <SummaryRow
                label="Action:"
                value={getLabel(escalationActionOptions, data.escalationAction)}
              />
            </>
          )}

          <SummaryRow
            label="Channels:"
            value={
              channels.length ? (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                    gap: 0.75,
                    width: "100%",
                    justifyContent: { xs: "flex-start", sm: "flex-end" },
                  }}
                >
                  {channels.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      size="small"
                      sx={{
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "transparent",
                        fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                        height: { xs: 20, sm: 24 },
                      }}
                    />
                  ))}
                </Box>
              ) : (
                "—"
              )
            }
          />

          <SummaryRow
            label="Recipients:"
            value={
              data.recipients?.length ? (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                    gap: 0.75,
                    width: "100%",
                    justifyContent: { xs: "flex-start", sm: "flex-end" },
                  }}
                >
                  {getRecipientLabels(data.recipients).map((label, i) => (
                    <Chip
                      key={i}
                      label={label}
                      size="small"
                      sx={{
                        bgcolor: "#EEF2FF",
                        color: "#1E3A8A",
                        fontWeight: 500,
                        borderRadius: "8px",
                        fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                        height: { xs: 20, sm: 24 },
                      }}
                    />
                  ))}
                </Box>
              ) : (
                "Not set"
              )
            }
          />
        </Paper>
      </Box>
    </Stack>
  );
};

export default Step3RuleSummary;

/* ---------------- SUMMARY ROW ---------------- */

const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        sm: "auto 1fr", 
      },
      gap: { xs: 0.5, sm: 2 },
      py: { xs: 1, sm: 1.25 },
      alignItems: { xs: "flex-start", sm: "center" },
    }}
  >
    <Typography
      variant="body2"
      sx={{
        color: "text.secondary",
        fontWeight: 500,
        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Typography>

    {typeof value === "string" ? (
      <Typography
        variant="body2"
        fontWeight={500}
        sx={{
          fontSize: { xs: "0.8125rem", sm: "0.875rem" },
          wordBreak: { xs: "break-word" },
          overflowWrap: { xs: "anywhere" },
          textAlign: { xs: "left", sm: "right" },
          whiteSpace: { sm: "nowrap" },
        }}
      >
        {value}
      </Typography>
    ) : (
      <Box
        sx={{
          minWidth: 0,
          width: "100%",
          display: "flex",
          justifyContent: { xs: "flex-start", sm: "flex-end" },
        }}
      >
        {value}
      </Box>
    )}
  </Box>
);