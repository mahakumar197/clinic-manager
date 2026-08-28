import { useAppSelector } from "@/app/store";
import {
  CommonCards,
  CommonPageHeader,
} from "@/components/common";
import PageContainer from "@/components/layouts/PageContainer";
import { Box, Grid } from "@mui/material";
import { useState } from "react";
import DeleteEscalationRuleModal from "../NotificationModals/DeleteEscalationRuleModal";
import DeleteNotificationRuleModal from "../NotificationModals/DeleteNotificationRuleModal";
import NotificationRulesSidebar from "../NotificationRules/NotificationRulesSidebar";
import EscalationRulesSidebar from "../EscalationRules/EscalationRulesSidebar";
import EditNotificationForm from "./EditNotificationForm";
import EditEscalationForm from "./EditEscalationForm";
import { useNotificationCardAnalytics } from "../../hooks/usenotificationcard";
import { useLocation, useParams } from "react-router-dom";

import { useEffect } from "react";
import { useAppDispatch } from "@/app/store";
import { setSelectedRule } from "@/features/notification";





const EditNotifications = () => {


  const { id } = useParams<{ id: string }>();
const location = useLocation();

const type: "notification" | "escalation" =
  location.pathname.includes("edit-escalations")
    ? "escalation"
    : "notification";





const dispatch = useAppDispatch();


  const [openNotificationDeleteModal, setOpenNotificationDeleteModal] =
    useState(false);
  const [openEscalationDeleteModal, setOpenEscalationDeleteModal] =
    useState(false);

  // Redux state
  const notifications = useAppSelector((state) => state.notifications.list);
  const escalations = useAppSelector(
    (state) => state.notifications.escalationList
  );
  const selectedId = useAppSelector(
    (state) => state.notifications.selectedRuleId
  );
  const selectedType = useAppSelector(
    (state) => state.notifications.selectedType
  );

  const selectedNotification = notifications.find((r) => r.id === selectedId);
  const selectedEscalation = escalations.find((r) => r.id === selectedId);

   const { metrics , loading } = useNotificationCardAnalytics();
  
useEffect(() => {
  if (id) {
    dispatch(setSelectedRule({ id, type }));
  }
}, [id, type, dispatch]);


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
      value: metrics
        ? `${metrics.avgResponseTime.averageHours}h`
        : "0h",
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
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <Grid size={{ xs: 12, sm: 12, md: 8 }}>
          <Box>
            <CommonPageHeader
              enableBack
              title="Notifications & Alerts"
              subtitle="Configure automated notifications and escalation rules"
            />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <CommonCards {...c}  loading={loading}/>
          </Grid>
        ))}
      </Grid>

      {/* Notification Section */}
      {selectedType === "notification" && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <NotificationRulesSidebar />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <EditNotificationForm
              selectedNotification={selectedNotification}
              onDelete={() => setOpenNotificationDeleteModal(true)}
            />
          </Grid>
        </Grid>
      )}

      {/* Escalation Section */}
      {selectedType === "escalation" && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <EscalationRulesSidebar />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <EditEscalationForm
              selectedEscalation={selectedEscalation}
              onDelete={() => setOpenEscalationDeleteModal(true)}
            />
            {/* <EditEscalationForm
  onDelete={() => setOpenEscalationDeleteModal(true)}
/> */}
          </Grid>
        </Grid>
      )}

      <DeleteNotificationRuleModal
        open={openNotificationDeleteModal}
         ruleId={selectedId}
        onClose={() => setOpenNotificationDeleteModal(false)}
          onDeleteSuccess={() => {
    setOpenNotificationDeleteModal(false);
  }}
      />
      <DeleteEscalationRuleModal
        open={openEscalationDeleteModal}
          ruleId={selectedId}
        onClose={() => setOpenEscalationDeleteModal(false)}
          onDeleteSuccess={() => {
    setOpenEscalationDeleteModal(false);
  }}
      />
    </PageContainer>
  );
};

export default EditNotifications;