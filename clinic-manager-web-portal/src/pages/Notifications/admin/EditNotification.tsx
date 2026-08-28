// import { useAppDispatch, useAppSelector } from "@/app/store";
// import {
//   CommonButton,
//   CommonIconButton,
//   CommonTextField,
//   ToggleSwitch,
//   CommonCards,
//   CommonIcon,
//   CommonPageHeader,
//   CommonSelect,
// } from "@/components/common";
// import PageContainer from "@/components/layouts/PageContainer";
// import { ROUTES } from "@/constants";
// import {
//   EscalationRule,
//   NotificationRule,
//   setSelectedRule,
//   updateRule,
// } from "@/features/notification";
// import { Box, Divider, Grid, Typography, useTheme } from "@mui/material";
// import { JSX, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import DeleteEscalationRuleModal from "./NotificationModals/DeleteEscalationRuleModal";
// import DeleteNotificationRuleModal from "./NotificationModals/DeleteNotificationRuleModal";

// const EditNotifications = () => {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const [filter, setFilter] = useState({ filterType: null });
//   // ---------- STATIC UI DATA  ----------
//   const notificationChannels = [
//     {
//       title: "In-App Notification",
//       message: "Show alert in the portal",
//       icon: (
//         <CommonIcon
//           name="Bell"
//           size={20}
//           color={theme.palette.text.secondary}
//         />
//       ),
//     },
//     {
//       title: "Email Notification",
//       message: "Send immediate email",
//       icon: (
//         <CommonIcon
//           name="Mail"
//           size={20}
//           color={theme.palette.text.secondary}
//         />
//       ),
//     },
//     {
//       title: "Daily Digest",
//       message: "Include in daily summary email",
//       icon: (
//         <CommonIcon
//           name="Clock"
//           size={20}
//           color={theme.palette.text.secondary}
//         />
//       ),
//     },
//   ];

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

//   // Normalize any legacy strings
//   const normalizeChannelKey = (chip: string) =>
//     chip === "Daily Digest" ? "Digest" : chip;
//   const getChannelLabel = (chip: string) =>
//     chip === "Daily Digest" ? "Digest" : chip;

//   const getStatusChip = (status: boolean) => ({
//     label: status ? "Active" : "Inactive",
//     bg: status ? "success.light" : "error.light",
//     color: status ? "success.dark" : "error.dark",
//   });

//   //  REDUX STATE
//   const notifications = useAppSelector((state) => state.notifications.list);
//   const escalations = useAppSelector(
//     (state) => state.notifications.escalationList
//   );
//   const selectedId = useAppSelector(
//     (state) => state.notifications.selectedRuleId
//   );
//   const selectedType = useAppSelector(
//     (state) => state.notifications.selectedType
//   );

//   const selectedNotification = notifications.find((r) => r.id === selectedId);
//   const selectedEscalation = escalations.find((r) => r.id === selectedId);

//   const activeRule: NotificationRule | EscalationRule | undefined =
//     selectedType === "notification" ? selectedNotification : selectedEscalation;

//   // FORM STATE
//   const [form, setForm] = useState<{
//     title: string;
//     trigger: string; // for Notification
//     condition: string; // for Escalation
//     actionText: string; // Escalation
//     assigned: string;
//     channels: string[];
//     status: boolean;
//   }>({
//     title: "",
//     trigger: "",
//     condition: "",
//     actionText: "",
//     assigned: "",
//     channels: [],
//     status: false,
//   });

//   // Fill form when selected
//   useEffect(() => {
//     if (!activeRule || !selectedType) return;

//     if (selectedType === "notification" && selectedNotification) {
//       setForm({
//         title: selectedNotification.title,
//         trigger: selectedNotification.trigger,
//         condition: "",
//         actionText: "",
//         assigned: selectedNotification.assigned?.join(", ") || "",
//         channels: selectedNotification.channels.map((c) =>
//           normalizeChannelKey(c)
//         ),
//         status: selectedNotification.status,
//       });
//     } else if (selectedType === "escalation" && selectedEscalation) {
//       setForm({
//         title: selectedEscalation.title,
//         trigger: "",
//         condition: selectedEscalation.condition,
//         actionText: selectedEscalation.action.join(", "),
//         assigned: selectedEscalation.assigned.join(", "),
//         channels: selectedEscalation.channels.map((c) =>
//           normalizeChannelKey(c)
//         ),
//         status: selectedEscalation.status,
//       });
//     }
//   }, [
//     selectedType,
//     selectedId,
//     activeRule,
//     selectedNotification,
//     selectedEscalation,
//   ]);

//   const handleSave = () => {
//     if (!selectedType || !activeRule) return;

//     if (selectedType === "notification" && selectedNotification) {
//       const updated: NotificationRule = {
//         ...selectedNotification,
//         title: form.title,
//         trigger: form.trigger,
//         assigned: form.assigned
//           ? form.assigned.split(",").map((a) => a.trim())
//           : [],
//         channels: form.channels,
//         status: form.status,
//       };

//       dispatch(updateRule({ data: updated, type: "notification" }));
//     } else if (selectedType === "escalation" && selectedEscalation) {
//       const updated: EscalationRule = {
//         ...selectedEscalation,
//         title: form.title,
//         condition: form.condition,
//         action: form.actionText
//           ? form.actionText.split(",").map((a) => a.trim())
//           : [],
//         channels: form.channels,
//         assigned: form.assigned
//           ? form.assigned.split(",").map((a) => a.trim())
//           : [],
//         status: form.status,
//       };

//       dispatch(updateRule({ data: updated, type: "escalation" }));
//     }

//     console.log("Saved Rule Data:", { type: selectedType, form });
//   };

//   const [openNotificationDeleteModal, setOpenNotificationDeleteModal] =
//     useState(false);

//   const [openEscalationDeleteModal, setOpenEscalationDeleteModal] =
//     useState(false);

//   const ROLE_OPTIONS = [
//     { label: "All", value: "all" },
//     { label: "Manager", value: "manager" },
//     { label: "Surgeon", value: "surgeon" },
//     { label: "Coordinator", value: "coordinator" },
//     { label: "Nurse", value: "nurse" },
//     { label: "Admin", value: "admin" },
//   ];

//   return (
//     <PageContainer>
//       <Grid
//         container
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           flexWrap: "wrap",
//           alignItems: "flex-start",
//         }}
//       >
//         <Grid size={{ xs: 12, sm: 12, md: 8 }}>
//           <Box>
//             <CommonPageHeader
//               enableBack
//               title="Notifications & Alerts"
//               subtitle="Configure automated notifications and escalation rules"
//             />
//           </Box>
//         </Grid>
//       </Grid>

//       <Grid container spacing={2}>
//         {cards.map((c) => (
//           <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
//             <CommonCards {...c} />
//           </Grid>
//         ))}
//       </Grid>
//       {/* notification */}
//       {selectedType === "notification" && (
//         <Grid container spacing={3}>
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Box
//               sx={{
//                 borderRadius: "14px",
//                 border: "1px solid #E5E7EB",
//                 padding: 3,
//                 height: "100%",
//               }}
//             >
//               <Box
//                 sx={{
//                   px: 1,
//                   display: "flex",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="body1" color="text.primary">
//                   Notification Rules
//                 </Typography>
//               </Box>
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                 {notifications.map((rule) => {
//                   const isSelected =
//                     selectedType === "notification" && selectedId === rule.id;
//                   const statusStyles = getStatusChip(rule.status);
//                   return (
//                     <Box
//                       key={rule.id}
//                       onClick={() =>
//                         dispatch(
//                           setSelectedRule({
//                             id: rule.id,
//                             type: "notification",
//                           })
//                         )
//                       }
//                       sx={{
//                         borderRadius: "10px",
//                         border: `1px solid ${
//                           isSelected ? theme.palette.primary.main : "#E5E7EB"
//                         }`,
//                         backgroundColor: isSelected
//                           ? "#FFFBEB"
//                           : "background.paper",
//                         padding: 2,
//                         cursor: "pointer",
//                       }}
//                     >
//                       <Box
//                         sx={{
//                           display: "flex",
//                           justifyContent: "space-between",
//                           alignItems: "center",
//                           width: "100%",
//                         }}
//                       >
//                         <Box
//                           sx={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: 1.5,
//                           }}
//                         >
//                           <CommonIcon
//                             name="Bell"
//                             size={20}
//                             color={theme.palette.primary.main}
//                           />
//                           <Typography variant="body1" color="text.primary">
//                             {rule.title}
//                           </Typography>
//                           <Box
//                             sx={{
//                               height: "22px",
//                               borderRadius: "8px",
//                               px: 1.5,
//                               display: "inline-flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               fontSize: "12px",
//                               fontWeight: 500,
//                               backgroundColor: statusStyles.bg,
//                               color: statusStyles.color,
//                             }}
//                           >
//                             {statusStyles.label}
//                           </Box>
//                         </Box>
//                       </Box>

//                       <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
//                         <Typography variant="body2" color="text.secondary">
//                           {rule.trigger}
//                         </Typography>
//                       </Box>

//                       <Box
//                         sx={{
//                           display: "flex",
//                           flexWrap: "wrap",
//                           gap: 1,
//                           mt: 1,
//                         }}
//                       >
//                         {rule.channels.map((chip, chipIndex) => {
//                           const normalized = normalizeChannelKey(chip);
//                           const label = getChannelLabel(chip);
//                           return (
//                             <Box
//                               key={chipIndex}
//                               sx={{
//                                 height: "22px",
//                                 borderRadius: "8px",
//                                 border: "1px solid #E5E7EB",
//                                 px: 1.5,
//                                 display: "inline-flex",
//                                 alignItems: "center",
//                                 gap: 0.8,
//                                 fontSize: "12px",
//                                 color: "#111827",
//                               }}
//                             >
//                               {channelIcons[normalized]}
//                               {label}
//                             </Box>
//                           );
//                         })}
//                       </Box>
//                     </Box>
//                   );
//                 })}
//               </Box>
//             </Box>
//           </Grid>

//           {/*Notification Edit Form */}
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Box
//               sx={{
//                 borderRadius: "14px",
//                 border: "1px solid #E5E7EB",
//                 padding: 3,
//                 height: "100%",
//               }}
//             >
//               <Box
//                 sx={{
//                   px: 1,
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="body1" color="text.primary">
//                   Edit Rule
//                 </Typography>
//                 <CommonIconButton
//                   icon={
//                     <CommonIcon
//                       name="Trash2"
//                       color={`${theme.palette.error.dark}`}
//                     />
//                   }
//                   onClick={() => setOpenNotificationDeleteModal(true)}
//                 />
//               </Box>

//               <Box>
//                 <Box sx={{ mb: 2 }}>
//                   <CommonTextField
//                     label="Rule Name"
//                     value={form.title}
//                     onChange={(e) =>
//                       setForm({ ...form, title: e.target.value })
//                     }
//                   />
//                 </Box>

//                 <Box sx={{ mb: 2 }}>
//                   <CommonTextField
//                     label="Trigger Event"
//                     value={form.trigger}
//                     onChange={(e) =>
//                       setForm({ ...form, trigger: e.target.value })
//                     }
//                   />
//                 </Box>
//               </Box>

//               <Divider />

//               <Box
//                 sx={{
//                   px: 1,
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                   mt: 2,
//                 }}
//               >
//                 <Typography variant="body1" color="text.primary">
//                   Notification Channels
//                 </Typography>
//               </Box>

//               <Box
//                 sx={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 2,
//                   mb: 2,
//                 }}
//               >
//                 {notificationChannels.map((value, index) => {
//                   let channelKey: string;
//                   if (value.title === "Daily Digest") {
//                     channelKey = "Digest";
//                   } else {
//                     channelKey = value.title.split(" ")[0];
//                   }
//                   const isChecked = form.channels.includes(channelKey);
//                   return (
//                     <Box
//                       key={index}
//                       sx={{
//                         borderRadius: "10px",
//                         border: "1px solid #E5E7EB",
//                         padding: 2,
//                       }}
//                     >
//                       <Box
//                         sx={{
//                           display: "flex",
//                           justifyContent: "space-between",
//                           alignItems: "center",
//                           width: "100%",
//                         }}
//                       >
//                         <Box
//                           sx={{
//                             display: "flex",
//                             alignItems: "flex-start",
//                             gap: 1.5,
//                           }}
//                         >
//                           <Box sx={{ color: "#4B5563", mt: "7px" }}>
//                             {value.icon}
//                           </Box>

//                           <Box
//                             sx={{
//                               display: "flex",
//                               flexDirection: "column",
//                               gap: "2px",
//                             }}
//                           >
//                             <Typography variant="body1" color="text.primary">
//                               {value.title}
//                             </Typography>

//                             <Typography variant="body2" color="text.secondary">
//                               {value.message}
//                             </Typography>
//                           </Box>
//                         </Box>
//                         <ToggleSwitch
//                           checked={isChecked}
//                           onChange={() => {
//                             let updated = [...form.channels];
//                             if (isChecked) {
//                               updated = updated.filter((c) => c !== channelKey);
//                             } else {
//                               updated.push(channelKey);
//                             }
//                             setForm({ ...form, channels: updated });
//                           }}
//                         />
//                       </Box>
//                     </Box>
//                   );
//                 })}
//               </Box>

//               <Divider />

//               <Box sx={{ mt: 2, mb: 2 }}>
//                 <CommonSelect
//                   label="Select recipients"
//                   name="filterType"
//                   value={filter.filterType}
//                   onChange={(newValue) => setFilter({ filterType: newValue })}
//                   options={[
//                     { label: "All", value: "all" },
//                     { label: "Manager", value: "manager" },
//                     { label: "Surgeon", value: "surgeon" },
//                     { label: "Coordinator", value: "coordinator" },
//                     { label: "Nurse", value: "nurse" },
//                     { label: "Admin", value: "admin" },
//                   ]}
//                 />
//               </Box>

//               <Box
//                 sx={{
//                   px: 1,
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="body1" color="text.primary">
//                   Rule Status
//                 </Typography>
//                 <ToggleSwitch
//                   checked={form.status}
//                   onChange={() => setForm({ ...form, status: !form.status })}
//                 />
//               </Box>

//               <Box
//                 sx={{
//                   display: "flex",
//                   width: "100%",
//                   gap: 1,
//                   flexDirection: { xs: "column", sm: "row" },
//                 }}
//               >
//                 <Box sx={{ flex: 1 }}>
//                   <CommonButton
//                     variant="contained"
//                     fullWidth
//                     onClick={handleSave}
//                   >
//                     Save Changes
//                   </CommonButton>
//                 </Box>

//                 <Box sx={{ flex: 1 }}>
//                   <CommonButton
//                     variant="outlined"
//                     fullWidth
//                     onClick={() => navigate(ROUTES.NOTIFICATIONS)}
//                   >
//                     Cancel
//                   </CommonButton>
//                 </Box>
//               </Box>
//             </Box>
//           </Grid>
//         </Grid>
//       )}

//       {/* escalation edit */}
//       {selectedType === "escalation" && (
//         <Grid container spacing={3}>
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Box
//               sx={{
//                 borderRadius: "14px",
//                 border: "1px solid #E5E7EB",
//                 padding: 3,
//                 height: "100%",
//               }}
//             >
//               <Box
//                 sx={{
//                   px: 1,
//                   display: "flex",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="body1" color="text.primary">
//                   Escalation Rules
//                 </Typography>
//               </Box>
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                 {escalations.map((rule) => {
//                   const isSelected =
//                     selectedType === "escalation" && selectedId === rule.id;
//                   const statusStyles = getStatusChip(rule.status);
//                   return (
//                     <Box
//                       key={rule.id}
//                       onClick={() =>
//                         dispatch(
//                           setSelectedRule({
//                             id: rule.id,
//                             type: "escalation",
//                           })
//                         )
//                       }
//                       sx={{
//                         borderRadius: "10px",
//                         border: `1px solid ${
//                           isSelected ? theme.palette.primary.main : "#E5E7EB"
//                         }`,
//                         backgroundColor: isSelected
//                           ? "#FFFBEB"
//                           : "background.paper",
//                         padding: 2,
//                         cursor: "pointer",
//                       }}
//                     >
//                       <Box
//                         sx={{
//                           display: "flex",
//                           justifyContent: "space-between",
//                           alignItems: "center",
//                           width: "100%",
//                         }}
//                       >
//                         <Box
//                           sx={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: 1.5,
//                           }}
//                         >
//                           <CommonIcon
//                             name="TriangleAlert"
//                             size={20}
//                             color={theme.palette.primary.main}
//                           />
//                           <Typography variant="body1" color="text.primary">
//                             {rule.title}
//                           </Typography>
//                           <Box
//                             sx={{
//                               height: "22px",
//                               borderRadius: "8px",
//                               px: 1.5,
//                               display: "inline-flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               fontSize: "12px",
//                               fontWeight: 500,
//                               backgroundColor: statusStyles.bg,
//                               color: statusStyles.color,
//                             }}
//                           >
//                             {statusStyles.label}
//                           </Box>
//                         </Box>
//                       </Box>

//                       <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
//                         <Typography variant="body2" color="primary.main">
//                           If:
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           {rule.condition}
//                         </Typography>
//                       </Box>
//                       <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
//                         <Typography variant="body2" color="info.light">
//                           Then:
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           {rule.action.join(", ")}
//                         </Typography>
//                       </Box>

//                       <Box
//                         sx={{
//                           display: "flex",
//                           flexWrap: "wrap",
//                           gap: 1,
//                           mt: 1,
//                         }}
//                       >
//                         {rule.channels.map((chip, chipIndex) => {
//                           const normalized = normalizeChannelKey(chip);
//                           const label = getChannelLabel(chip);
//                           return (
//                             <Box
//                               key={chipIndex}
//                               sx={{
//                                 height: "22px",
//                                 borderRadius: "8px",
//                                 border: "1px solid #E5E7EB",
//                                 px: 1.5,
//                                 display: "inline-flex",
//                                 alignItems: "center",
//                                 gap: 0.8,
//                                 fontSize: "12px",
//                                 color: "#111827",
//                               }}
//                             >
//                               {channelIcons[normalized]}
//                               {label}
//                             </Box>
//                           );
//                         })}
//                       </Box>
//                     </Box>
//                   );
//                 })}
//               </Box>
//             </Box>
//           </Grid>

//           {/*  Escalation Edit Form */}
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Box
//               sx={{
//                 borderRadius: "14px",
//                 border: "1px solid #E5E7EB",
//                 padding: 3,
//                 height: "100%",
//               }}
//             >
//               <Box
//                 sx={{
//                   px: 1,
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                 }}
//               >
//                 <Typography variant="body1" color="text.primary">
//                   Edit Rule
//                 </Typography>
//                 <CommonIconButton
//                   icon={
//                     <CommonIcon
//                       name="Trash2"
//                       color={`${theme.palette.error.dark}`}
//                     />
//                   }
//                   onClick={() => setOpenEscalationDeleteModal(true)}
//                 />
//               </Box>
//               <Box>
//                 <Box sx={{ mb: 2 }}>
//                   <CommonTextField
//                     label="Rule Name"
//                     value={form.title}
//                     onChange={(e) =>
//                       setForm({ ...form, title: e.target.value })
//                     }
//                   />
//                 </Box>

//                 <Box sx={{ mb: 2 }}>
//                   <CommonTextField
//                     label="Escalation Condition"
//                     value={form.condition}
//                     onChange={(e) =>
//                       setForm({ ...form, condition: e.target.value })
//                     }
//                   />
//                 </Box>

//                 <Box sx={{ mb: 2 }}>
//                   <CommonTextField
//                     label="Escalation Action"
//                     value={form.actionText}
//                     onChange={(e) =>
//                       setForm({ ...form, actionText: e.target.value })
//                     }
//                   />
//                 </Box>
//               </Box>

//               <Divider />

//               <Box
//                 sx={{
//                   px: 1,
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                   mt: 2,
//                 }}
//               >
//                 <Typography variant="body1" color="text.primary">
//                   Notification Channels
//                 </Typography>
//               </Box>

//               <Box
//                 sx={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 2,
//                   mb: 2,
//                 }}
//               >
//                 {notificationChannels.map((value, index) => {
//                   let channelKey: string;
//                   if (value.title === "Daily Digest") {
//                     channelKey = "Digest";
//                   } else {
//                     channelKey = value.title.split(" ")[0];
//                   }

//                   const isChecked = form.channels.includes(channelKey);

//                   return (
//                     <Box
//                       key={index}
//                       sx={{
//                         borderRadius: "10px",
//                         border: "1px solid #E5E7EB",
//                         padding: 2,
//                       }}
//                     >
//                       <Box
//                         sx={{
//                           display: "flex",
//                           justifyContent: "space-between",
//                           alignItems: "center",
//                           width: "100%",
//                         }}
//                       >
//                         <Box
//                           sx={{
//                             display: "flex",
//                             alignItems: "flex-start",
//                             gap: 1.5,
//                           }}
//                         >
//                           <Box sx={{ color: "#4B5563", mt: "7px" }}>
//                             {value.icon}
//                           </Box>

//                           <Box
//                             sx={{
//                               display: "flex",
//                               flexDirection: "column",
//                               gap: "2px",
//                             }}
//                           >
//                             <Typography variant="body1" color="text.primary">
//                               {value.title}
//                             </Typography>

//                             <Typography variant="body2" color="text.secondary">
//                               {value.message}
//                             </Typography>
//                           </Box>
//                         </Box>
//                         <ToggleSwitch
//                           checked={isChecked}
//                           onChange={() => {
//                             let updated = [...form.channels];
//                             if (isChecked) {
//                               updated = updated.filter((c) => c !== channelKey);
//                             } else {
//                               updated.push(channelKey);
//                             }
//                             setForm({ ...form, channels: updated });
//                           }}
//                         />
//                       </Box>
//                     </Box>
//                   );
//                 })}
//               </Box>

//               <Divider />

//               <Box sx={{ mt: 2, mb: 2 }}>
//                 <CommonSelect
//                   label="Select recipients"
//                   name="filterType"
//                   value={filter.filterType}
//                   onChange={(newValue) => setFilter({ filterType: newValue })}
//                   options={[
//                     { label: "All", value: "all" },
//                     { label: "Manager", value: "manager" },
//                     { label: "Surgeon", value: "surgeon" },
//                     { label: "Coordinator", value: "coordinator" },
//                     { label: "Nurse", value: "nurse" },
//                     { label: "Admin", value: "admin" },
//                   ]}
//                 />
//               </Box>

//               <Box
//                 sx={{
//                   px: 1,
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   mb: 2,
//                   mt: 5,
//                 }}
//               >
//                 <Typography variant="body1" color="text.primary">
//                   Rule Status
//                 </Typography>
//                 <ToggleSwitch
//                   checked={form.status}
//                   onChange={() => setForm({ ...form, status: !form.status })}
//                 />
//               </Box>

//               <Box
//                 sx={{
//                   display: "flex",
//                   width: "100%",
//                   gap: 1,
//                   flexDirection: { xs: "column", sm: "row" },
//                   mt: 6,
//                 }}
//               >
//                 <Box sx={{ flex: 1 }}>
//                   <CommonButton
//                     variant="contained"
//                     fullWidth
//                     onClick={handleSave}
//                   >
//                     Save Changes
//                   </CommonButton>
//                 </Box>

//                 <Box sx={{ flex: 1 }}>
//                   <CommonButton
//                     variant="outlined"
//                     fullWidth
//                     onClick={() => navigate(ROUTES.NOTIFICATIONS)}
//                   >
//                     Cancel
//                   </CommonButton>
//                 </Box>
//               </Box>
//             </Box>
//           </Grid>
//         </Grid>
//       )}
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

// export default EditNotifications;
