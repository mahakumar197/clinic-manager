import {
  CommonButton,
  CommonCards,
  CommonIcon,
  CommonPageHeader,
} from "@/components/common";
import PageContainer from "@/components/layouts/PageContainer";
import { Box, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import CreateRuleModal from "./CreateRule/CreateRuleModal";
import NotificationRulesList from "./NotificationRules/NotificationRulesList";
import EscalationRulesList from "./EscalationRules/EscalationRulesList";
import { useNotificationCardAnalytics } from "../hooks/usenotificationcard";
import { useNotification } from "../hooks/useNotification";
import { useEscalation } from "../hooks/useEscalation";

const RuleNotifications = () => {
  const [openRuleModal, setOpenRuleModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { metrics, loading } = useNotificationCardAnalytics();

  // Fetch notification rules
  const { rules: notificationRules, refresh: refreshNotifications } =
    useNotification();

  // Fetch escalation rules
  const { rules: escalationRules, refresh: refreshEscalations } =
    useEscalation();

  const allRules = [
    // Notification rules
    ...(notificationRules || []).map((rule) => ({
      id: rule.id,
      ruleName: rule.name,
      ruleType: "notification",
      triggerEvent: rule.trigger_event,
    })),
    // Escalation rules
    ...(escalationRules || []).map((rule) => ({
      id: rule.id,
      ruleName: rule.rule_name,
      ruleType: "escalation",
      escalationCondition: rule.condition,
      escalationAction: rule.action,
    })),
  ];

  // Refresh both lists after creating a rule
  const handleRefreshAll = () => {
    setRefreshTrigger(Date.now());
    refreshNotifications();
    refreshEscalations();
  };

  // Refetch rules when modal opens to get latest data
  const handleOpenModal = () => {
    refreshNotifications();
    refreshEscalations();
    setOpenRuleModal(true);
  };

  const cards = [
    {
      id: 1,
      title: "Total Approvals",
      value: metrics?.totalApprovals?.total ?? 0,
      iconName: "CircleCheck",
      variant: "orange",
      subtitle: metrics
        ? metrics.totalApprovals.percentageChange === 0
          ? "No change"
          : `${metrics.totalApprovals.percentageChange}% ${metrics.totalApprovals.comparisonPeriod}`
        : "",
    },
    {
      id: 2,
      title: "This Week",
      value: metrics?.thisWeek?.total ?? 0,
      iconName: "Calendar",
      variant: "blue",
      subtitle: metrics
        ? metrics.thisWeek.percentageChange === 0
          ? "No change"
          : `${metrics.thisWeek.percentageChange}% ${metrics.thisWeek.comparisonPeriod}`
        : "",
    },
    {
      id: 3,
      title: "Avg Response Time",
      value: metrics ? `${metrics.avgResponseTime.averageHours}h` : "0h",
      iconName: "Clock",
      variant: "red",
      subtitle: metrics
        ? metrics.avgResponseTime.percentageChange === 0
          ? "No change"
          : `${metrics.avgResponseTime.percentageChange}% ${metrics.avgResponseTime.comparisonPeriod}`
        : "",
    },
    {
      id: 4,
      title: "Outstanding Forms",
      value: metrics?.outstandingForms?.total ?? 0,
      iconName: "FileText",
      variant: "green",
      subtitle: metrics?.outstandingForms?.status ?? "",
    },
  ];

  return (
    <PageContainer>
      <Grid
        container
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Grid size={{ xs: 12, sm: 12, md: 8 }}>
          <Box>
            <CommonPageHeader
              title="Rule Notifications"
              subtitle="Configure automated notifications and escalation rules"
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <Box
            sx={{
              display: "flex",
              width: { xs: "100%", sm: "100%", md: "auto" },
              mt: { xs: 2, sm: 2, md: 0 },
              justifyContent: "end",
              flexDirection: { xs: "column", sm: "row" },
              textAlign: { xs: "right", sm: "right", md: "left" },
            }}
          >
            <CommonButton
              variant="contained"
              startIcon={<CommonIcon name="Plus" />}
              onClick={handleOpenModal}
            >
              Create Rule
            </CommonButton>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <CommonCards {...c} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <NotificationRulesList key={`notifications-${refreshTrigger}`} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <EscalationRulesList key={`escalations-${refreshTrigger}`} />
        </Grid>
      </Grid>

      <CreateRuleModal
        open={openRuleModal}
        onClose={() => setOpenRuleModal(false)}
        onSuccess={handleRefreshAll}
        existingRules={allRules}
      />
    </PageContainer>
  );
};

export default RuleNotifications;
