import { useAppDispatch, useAppSelector } from "@/app/store";
import { CommonIcon } from "@/components/common";
import { setSelectedRule } from "@/features/notification";
import { Box, Typography, useTheme } from "@mui/material";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import { useEscalation } from "../../hooks/useEscalation";
import { LucideIconName } from "@/components/common/lucideIcons";
import { formatDropdownLabel } from "@/utils";
import { tablePalette } from "@/theme/tablePalette";

const EscalationRulesSidebar = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { rules, loading } = useEscalation();

  const selectedId = useAppSelector(
    (state) => state.notifications.selectedRuleId
  );
  const selectedType = useAppSelector(
    (state) => state.notifications.selectedType
  );

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
      <Box
        sx={{
          px: 1,
          display: "flex",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="body1" color="text.primary">
          Escalation Rules
        </Typography>
      </Box>

      {/* Rules List with Scroll */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxHeight: "720px",
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
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <CommonSkeleton key={i} type="notificationCard" />
          ))
        ) : rules.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
              gap: 1,
            }}
          >
            <CommonIcon
              name="TriangleAlert"
              size={40}
              color={theme.palette.text.disabled}
            />
            <Typography variant="body2" color="text.secondary">
              No escalation rules found
            </Typography>
          </Box>
        ) : (
          rules.map((rule: any) => {
            console.log("Rule data:", rule);
            console.log("condition_label:", rule.condition_label);
            console.log("action_label:", rule.action_label);
            const isSelected =
              selectedType === "escalation" && selectedId === rule.id;
            const statusStyles = getStatusChip(rule.is_active);

            return (
              <Box
                key={rule.id}
                onClick={() =>
                  dispatch(
                    setSelectedRule({
                      id: rule.id,
                      type: "escalation",
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
                  backgroundColor: isSelected ? "#FFFBEB" : "background.paper",
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
                    display: { xs: "none", sm: "flex" },
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                    }}
                  >
                    <CommonIcon
                      name="TriangleAlert"
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

                  <CommonIcon
                    name={rule.is_active ? "CheckCircle" : "CircleSlash"}
                    size={18}
                    color={
                      rule.is_active
                        ? theme.palette.success.main
                        : theme.palette.error.main
                    }
                  />
                </Box>

                {/* IF */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 1,
                    ml: { xs: 0, sm: 4.2 },
                  }}
                >
                  <Typography variant="body2" color="primary.main">
                    If:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDropdownLabel(rule.condition_label)}
                  </Typography>
                </Box>

                {/* THEN */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    // mt: 1,
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
                    {/* {rule.action_label} */}
                    {formatDropdownLabel(rule.action_label)}
                  </Typography>
                </Box>

                {/* Channels & recipients */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    // mt: 1,
                    ml: { xs: 0, sm: 4.2 },
                  }}
                >
                  {rule.channels.map((chip: string, chipIndex: number) => {
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

                  {(rule?.recipients?.roles?.length > 0 ||
                    rule?.recipients?.users?.length > 0) && (
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
          })
        )}
      </Box>
    </Box>
  );
};

export default EscalationRulesSidebar;
