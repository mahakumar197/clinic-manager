// import { useAppDispatch, useAppSelector } from "@/app/store";
// import {
//   CommonButton,
//   CommonIconButton,
//   ToggleSwitch,
//   CommonCards,
//   CommonIcon,
//   CommonPageHeader,
// } from "@/components/common";

// import PageContainer from "@/components/layouts/PageContainer";
// import { ROUTES } from "@/constants";
// import { setSelectedRule, toggleStatus } from "@/features/notification";
// import { Box, Grid, Typography, useTheme } from "@mui/material";
// import { JSX, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import RuleActionsMenu from "../RuleActionsMenu";
// import CreateRuleModal from "./CreateRule/CreateRuleModal";
// import DeleteEscalationRuleModal from "./NotificationModals/DeleteEscalationRuleModal";
// import DeleteNotificationRuleModal from "./NotificationModals/DeleteNotificationRuleModal";
// // import CommonSkeleton from "@/components/common/CommonSkeleton";
// import CommonSkeleton from "@/components/common/CommonSkeleton/index";

// const AdminNotifications = () => {
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const dispatch = useAppDispatch();
//   const notification = useAppSelector((s) => s.notifications.list);
//   const escalations = useAppSelector((s) => s.notifications.escalationList);
//   const [openRuleModal, setOpenRuleModal] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, []);

//   const cards = [
//     {
//       id: 1,
//       title: "Total Approvals",
//       value: 88,
//       iconName: "CircleCheck",
//       variant: "orange",
//       subtitle: "+12% vs last month",
//     },
//     {
//       id: 2,
//       title: "This Week",
//       value: 24,
//       iconName: "Calendar",
//       variant: "blue",
//       subtitle: "+8% vs last week",
//     },
//     {
//       id: 3,
//       title: "Avg Response Time",
//       value: "1.5h",
//       iconName: "Clock",
//       variant: "red",
//       subtitle: "-20% improvement",
//     },
//     {
//       id: 4,
//       title: "Outstanding Forms",
//       value: 12,
//       iconName: "FileText",
//       variant: "green",
//       subtitle: "Awaiting review",
//     },
//   ];

//   const channelIcons: Record<string, JSX.Element> = {
//     "In-App": (
//       <CommonIcon name="Bell" size={12} color={theme.palette.text.primary} />
//     ),

//     Email: (
//       <CommonIcon name="Mail" size={12} color={theme.palette.text.primary} />
//     ),

//     Digest: (
//       <CommonIcon name="Clock" size={12} color={theme.palette.text.primary} />
//     ),
//   };

//   const normalizeChannelKey = (chip: string) =>
//     chip === "Daily Digest" ? "Digest" : chip;

//   const getChannelLabel = (chip: string) =>
//     chip === "Daily Digest" ? "Digest" : chip;

//   const getStatusChip = (status: boolean) => ({
//     label: status ? "Active" : "Inactive",
//     bg: status ? "success.light" : "error.light",
//     color: status ? "success.dark" : "error.dark",
//   });

//   const [openNotificationDeleteModal, setOpenNotificationDeleteModal] =
//     useState(false);
//   const [openEscalationDeleteModal, setOpenEscalationDeleteModal] =
//     useState(false);

//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const [menuRuleId, setMenuRuleId] = useState<string | null>(null);

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setMenuRuleId(null);
//   };

//   return (
//     <PageContainer>
//       <Grid
//         container
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//         }}
//       >
//         <Grid size={{ xs: 12, sm: 12, md: 8 }}>
//           <Box>
//             <CommonPageHeader
//               title="Notifications & Alerts"
//               subtitle="Configure automated notifications and escalation rules"
//             />
//           </Box>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 12, md: 4 }}>
//           <Box
//             sx={{
//               display: "flex",
//               width: { xs: "100%", sm: "100%", md: "auto" },
//               mt: { xs: 2, sm: 2, md: 0 },
//               justifyContent: "end",
//               flexDirection: { xs: "column", sm: "row" },
//               textAlign: { xs: "right", sm: "right", md: "left" },
//             }}
//           >
//             <CommonButton
//               variant="contained"
//               startIcon={<CommonIcon name="Plus" />}
//               onClick={() => setOpenRuleModal(true)}
//             >
//               Create Rule
//             </CommonButton>
//           </Box>
//         </Grid>
//       </Grid>
//       <Grid container spacing={2}>
//         {cards.map((c) => (
//           <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
//             <CommonCards {...c} loading={loading} />
//           </Grid>
//         ))}
//       </Grid>
//       <Grid container spacing={3}>
//         <Grid size={{ xs: 12 }}>
//           <Box
//             sx={{
//               borderRadius: "14px",
//               border: "1px solid #E5E7EB",
//               width: "100%",
//               padding: 3,
//             }}
//           >
//             <Box
//               sx={{
//                 px: 1,
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 mb: 2,
//               }}
//             >
//               <Typography variant="h6" color="text.primary">
//                 Notification Rules
//               </Typography>
//               <Typography variant="body2" color="text.primary">
//                 {notification.length} total rules
//               </Typography>
//             </Box>

//             <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//               {loading
//                 ? Array.from({ length: 4 }).map((_, i) => (
//                     <CommonSkeleton key={i} type="notificationCard" />
//                   ))
//                 : notification.map((rule, index) => {
//                     const statusStyles = getStatusChip(rule.status);
//                     return (
//                       <Box
//                         key={index}
//                         sx={{
//                           borderRadius: "10px",
//                           border: "1px solid #E5E7EB",
//                           padding: 2,
//                         }}
//                       >
//                         {/* sm and above */}
//                         <Box
//                           sx={{
//                             display: { xs: "none", sm: "flex" },
//                             justifyContent: "space-between",
//                             alignItems: "center",
//                             width: "100%",
//                           }}
//                         >
//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 1.5,
//                             }}
//                           >
//                             <CommonIcon
//                               name="Bell"
//                               size={20}
//                               color={theme.palette.primary.main}
//                             />
//                             <Typography variant="body1" color="text.primary">
//                               {rule.title}
//                             </Typography>
//                             <Box
//                               sx={{
//                                 height: "22px",
//                                 borderRadius: "8px",
//                                 px: 1.5,
//                                 display: "inline-flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 fontSize: "12px",
//                                 fontWeight: 500,
//                                 backgroundColor: statusStyles.bg,
//                                 color: statusStyles.color,
//                               }}
//                             >
//                               {statusStyles.label}
//                             </Box>
//                           </Box>

//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 1,
//                             }}
//                           >
//                             <CommonIconButton
//                               icon={
//                                 <CommonIcon
//                                   name="SquarePen"
//                                   color={theme.palette.text.primary}
//                                 />
//                               }
//                               onClick={() => {
//                                 dispatch(
//                                   setSelectedRule({
//                                     id: rule.id,
//                                     type: "notification",
//                                   })
//                                 );
//                                 navigate(ROUTES.EDITNOTIFICATIONS);
//                               }}
//                             />
//                             <CommonIconButton
//                               icon={
//                                 <CommonIcon
//                                   name="Trash2"
//                                   color={theme.palette.error.dark}
//                                 />
//                               }
//                               onClick={() =>
//                                 setOpenNotificationDeleteModal(true)
//                               }
//                             />

//                             <ToggleSwitch
//                               checked={rule.status}
//                               onChange={() =>
//                                 dispatch(
//                                   toggleStatus({
//                                     id: rule.id,
//                                     type: "notification",
//                                   })
//                                 )
//                               }
//                             />
//                           </Box>
//                         </Box>

//                         {/* MobileScreens */}
//                         {/* 👇 untouched */}
//                         <Box
//                           sx={{
//                             display: { xs: "flex", sm: "none" },
//                             flexDirection: "row",
//                             justifyContent: "space-between",
//                             alignItems: "flex-start",
//                             width: "100%",
//                             flexWrap: "nowrap",
//                           }}
//                         >
//                           {/* Icon + Title */}
//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "flex-start",
//                               gap: 1.2,
//                               overflow: "hidden",
//                               minWidth: 0,
//                             }}
//                           >
//                             <Box sx={{ flexShrink: 0 }}>
//                               <CommonIcon
//                                 name="Bell"
//                                 size={18}
//                                 color={theme.palette.primary.main}
//                               />
//                             </Box>

//                             <Typography
//                               variant="body1"
//                               sx={{
//                                 whiteSpace: "nowrap",
//                                 textOverflow: "ellipsis",
//                                 overflow: "hidden",
//                                 maxWidth: "100%",
//                               }}
//                             >
//                               {rule.title}
//                             </Typography>
//                           </Box>

//                           {/* Status */}
//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 1.5,
//                               flexShrink: 0,
//                             }}
//                           >
//                             <CommonIcon
//                               name={rule.status ? "CheckCircle" : "CircleSlash"}
//                               size={18}
//                               color={
//                                 rule.status
//                                   ? theme.palette.success.main
//                                   : theme.palette.error.main
//                               }
//                             />

//                             <CommonIconButton
//                               sx={{ p: 0, m: 0 }}
//                               icon={<CommonIcon name="MoreVertical" />}
//                               onClick={(e) => {
//                                 setAnchorEl(e.currentTarget);
//                                 setMenuRuleId(rule.id);
//                               }}
//                             />
//                             <RuleActionsMenu
//                               anchorEl={anchorEl}
//                               open={menuRuleId === rule.id}
//                               onClose={handleMenuClose}
//                               rule={rule}
//                               type="notification"
//                               onToggleStatus={(id, type) =>
//                                 dispatch(toggleStatus({ id, type }))
//                               }
//                               onEdit={(id, type) => {
//                                 dispatch(setSelectedRule({ id, type }));
//                                 navigate(ROUTES.EDITNOTIFICATIONS);
//                               }}
//                               onDelete={() => {
//                                 setOpenNotificationDeleteModal(true);
//                               }}
//                             />
//                           </Box>
//                         </Box>

//                         <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
//                           <Typography variant="body2" color="info.light">
//                             Trigger:
//                           </Typography>
//                           <Typography variant="body2" color="text.secondary">
//                             {rule.trigger}
//                           </Typography>
//                         </Box>

//                         <Box
//                           sx={{
//                             display: "flex",
//                             flexWrap: "wrap",
//                             gap: 1,
//                             mt: 1,
//                           }}
//                         >
//                           {rule.channels.map((chip, chipIndex) => {
//                             const normalized = normalizeChannelKey(chip);
//                             const label = getChannelLabel(chip);

//                             return (
//                               <Box
//                                 key={chipIndex}
//                                 sx={{
//                                   height: "22px",
//                                   borderRadius: "8px",
//                                   border: "1px solid #E5E7EB",
//                                   px: 1.5,
//                                   display: "inline-flex",
//                                   alignItems: "center",
//                                   gap: 0.8,
//                                   fontSize: "12px",
//                                   color: "#111827",
//                                 }}
//                               >
//                                 {channelIcons[normalized]}
//                                 {label}
//                               </Box>
//                             );
//                           })}
//                           {rule.assigned?.length > 0 && (
//                             <Box
//                               sx={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 0.3,
//                               }}
//                             >
//                               <CommonIcon
//                                 name="ArrowRight"
//                                 size={14}
//                                 color={theme.palette.text.secondary}
//                               />
//                               <Typography
//                                 variant="caption"
//                                 color="text.secondary"
//                               >
//                                 {rule.assigned.join(", ")}
//                               </Typography>
//                             </Box>
//                           )}
//                         </Box>
//                       </Box>
//                     );
//                   })}
//             </Box>
//           </Box>
//         </Grid>
//         <Grid size={{ xs: 12 }}>
//           <Box
//             sx={{
//               borderRadius: "14px",
//               border: "1px solid #E5E7EB",
//               width: "100%",
//               padding: 3,
//             }}
//           >
//             <Box
//               sx={{
//                 px: 1,
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 mb: 2,
//               }}
//             >
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
//                 <Typography variant="h6" color="text.primary">
//                   Escalation Rules
//                 </Typography>
//                  <Typography variant="body2" color="text.secondary">
//                  Automatic escalation when conditions are met
//                 </Typography>
//               </Box>
//               <Typography variant="body1" color="text.primary">
//                 {escalations.length} total rules
//               </Typography>
//             </Box>

//             <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//               {loading
//                 ? Array.from({ length: 4 }).map((_, i) => (
//                     <CommonSkeleton key={i} type="escalationCard" />
//                   ))
//                 : escalations.map((rule) => {
//                     const statusStyles = getStatusChip(rule.status);
//                     return (
//                       <Box
//                         key={rule.id}
//                         sx={{
//                           borderRadius: "10px",
//                           border: "1px solid #E5E7EB",
//                           padding: 2,
//                         }}
//                       >
//                         {/* (sm and above) */}
//                         <Box
//                           sx={{
//                             display: { xs: "none", sm: "flex" },
//                             justifyContent: "space-between",
//                             alignItems: "center",
//                             width: "100%",
//                           }}
//                         >
//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 1.5,
//                             }}
//                           >
//                             <CommonIcon
//                               name="TriangleAlert"
//                               size={20}
//                               color={theme.palette.primary.main}
//                             />

//                             <Typography variant="body1" color="text.primary">
//                               {rule.title}
//                             </Typography>
//                             <Box
//                               sx={{
//                                 height: "22px",
//                                 borderRadius: "8px",
//                                 px: 1.5,
//                                 display: "inline-flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 fontSize: "12px",
//                                 fontWeight: 500,
//                                 backgroundColor: statusStyles.bg,
//                                 color: statusStyles.color,
//                               }}
//                             >
//                               {statusStyles.label}
//                             </Box>
//                           </Box>

//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 1,
//                             }}
//                           >
//                             <CommonIconButton
//                               icon={
//                                 <CommonIcon
//                                   name="SquarePen"
//                                   color={theme.palette.text.primary}
//                                 />
//                               }
//                               onClick={() => {
//                                 dispatch(
//                                   setSelectedRule({
//                                     id: rule.id,
//                                     type: "escalation",
//                                   })
//                                 );
//                                 navigate(ROUTES.EDITNOTIFICATIONS);
//                               }}
//                             />
//                             <CommonIconButton
//                               icon={
//                                 <CommonIcon
//                                   name="Trash2"
//                                   color={theme.palette.error.dark}
//                                 />
//                               }
//                               onClick={() => setOpenEscalationDeleteModal(true)}
//                             />

//                             <ToggleSwitch
//                               checked={rule.status}
//                               onChange={() =>
//                                 dispatch(
//                                   toggleStatus({
//                                     id: rule.id,
//                                     type: "escalation",
//                                   })
//                                 )
//                               }
//                             />
//                           </Box>
//                         </Box>

//                         {/* Mobile */}
//                         <Box
//                           sx={{
//                             display: { xs: "flex", sm: "none" },
//                             flexDirection: "row",
//                             justifyContent: "space-between",
//                             alignItems: "flex-start",
//                             width: "100%",
//                             flexWrap: "nowrap",
//                           }}
//                         >
//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "flex-start",
//                               gap: 1.2,
//                               overflow: "hidden",
//                               minWidth: 0,
//                             }}
//                           >
//                             <Box sx={{ flexShrink: 0 }}>
//                               <CommonIcon
//                                 name="TriangleAlert"
//                                 size={18}
//                                 color={theme.palette.primary.main}
//                               />
//                             </Box>

//                             <Typography
//                               variant="body1"
//                               sx={{
//                                 whiteSpace: "nowrap",
//                                 textOverflow: "ellipsis",
//                                 overflow: "hidden",
//                                 maxWidth: "100%",
//                               }}
//                             >
//                               {rule.title}
//                             </Typography>
//                           </Box>

//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 1.5,
//                               flexShrink: 0,
//                             }}
//                           >
//                             <CommonIcon
//                               name={rule.status ? "CheckCircle" : "CircleSlash"}
//                               size={18}
//                               color={
//                                 rule.status
//                                   ? theme.palette.success.main
//                                   : theme.palette.error.main
//                               }
//                             />

//                             <CommonIconButton
//                               sx={{ p: 0, m: 0 }}
//                               icon={<CommonIcon name="MoreVertical" />}
//                               onClick={(e) => {
//                                 setAnchorEl(e.currentTarget);
//                                 setMenuRuleId(rule.id);
//                               }}
//                             />
//                             <RuleActionsMenu
//                               anchorEl={anchorEl}
//                               open={menuRuleId === rule.id}
//                               onClose={handleMenuClose}
//                               rule={rule}
//                               type="escalation"
//                               onToggleStatus={(id, type) =>
//                                 dispatch(toggleStatus({ id, type }))
//                               }
//                               onEdit={(id, type) => {
//                                 dispatch(setSelectedRule({ id, type }));
//                                 navigate(ROUTES.EDITNOTIFICATIONS);
//                               }}
//                               onDelete={() => {
//                                 setOpenEscalationDeleteModal(true);
//                               }}
//                             />
//                           </Box>
//                         </Box>

//                         <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
//                           <Typography variant="body2" color="primary.main">
//                             If:
//                           </Typography>
//                           <Typography variant="body2" color="text.secondary">
//                             {rule.condition}
//                           </Typography>
//                         </Box>

//                         <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
//                           <Typography variant="body2" color="info.light">
//                             Then:
//                           </Typography>
//                           <Typography variant="body2" color="text.secondary">
//                             {rule.action}
//                           </Typography>
//                         </Box>

//                         <Box
//                           sx={{
//                             display: "flex",
//                             flexWrap: "wrap",
//                             gap: 1,
//                             mt: 1,
//                           }}
//                         >
//                           {rule.channels.map((chip, chipIndex) => {
//                             const normalized = normalizeChannelKey(chip);
//                             const label = getChannelLabel(chip);

//                             return (
//                               <Box
//                                 key={chipIndex}
//                                 sx={{
//                                   height: "22px",
//                                   borderRadius: "8px",
//                                   border: "1px solid #E5E7EB",
//                                   px: 1.5,
//                                   display: "inline-flex",
//                                   alignItems: "center",
//                                   gap: 0.8,
//                                   fontSize: "12px",
//                                   color: "#111827",
//                                 }}
//                               >
//                                 {channelIcons[normalized]}
//                                 {label}
//                               </Box>
//                             );
//                           })}
//                           {rule.assigned?.length > 0 && (
//                             <Box
//                               sx={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 0.3,
//                               }}
//                             >
//                               <CommonIcon
//                                 name="ArrowRight"
//                                 size={14}
//                                 color={theme.palette.text.secondary}
//                               />
//                               <Typography
//                                 variant="caption"
//                                 color="text.secondary"
//                               >
//                                 {rule.assigned.join(", ")}
//                               </Typography>
//                             </Box>
//                           )}
//                         </Box>
//                       </Box>
//                     );
//                   })}
//             </Box>
//           </Box>
//         </Grid>
//       </Grid>
//       <CreateRuleModal
//         open={openRuleModal}
//         onClose={() => setOpenRuleModal(false)}
//       />
//       <DeleteNotificationRuleModal
//         open={openNotificationDeleteModal}
//         onClose={() => setOpenNotificationDeleteModal(false)}
//       />
//       <DeleteEscalationRuleModal
//         open={openEscalationDeleteModal}
//         onClose={() => setOpenEscalationDeleteModal(false)}
//       />
//     </PageContainer>
//   );
// };

// export default AdminNotifications;
