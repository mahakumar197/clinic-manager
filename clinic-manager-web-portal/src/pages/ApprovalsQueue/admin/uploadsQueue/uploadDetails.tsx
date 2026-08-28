import { useAuthRole } from "@/hooks/useAuthRole";
import {
  capitalize,
  convertToCamelCase,
  formatDropdownLabel,
  getInitials,
} from "@/utils";
import { enableDayjsUTC } from "@/utils/date";
import {
  BaseTextField,
  CommonButton,
  CommonIcon,
  CommonIconButton,
  CommonTextField,
} from "@components/common";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { useUploadAdminDetails } from "../hooks/uploadHooks/useUploadAdminDetails";
import { useUploadApprovalComments } from "../hooks/uploadHooks/useUploadComments";
import { DATE_FORMATS } from "@/constants";
enableDayjsUTC();

type Props = {
  approvalId: string | null;
  onBack?: () => void;
  onOpenForm?: () => void;
  onActionSuccess?: () => void;
  formOpened?: boolean;
};

const AdminUploadsApprovalDetails = ({
  approvalId,
  onBack,
  onOpenForm,
  onActionSuccess,
    formOpened = false,
}: Props) => {
  const theme = useTheme();
  const role = useAuthRole();
  const isBelowMd = useMediaQuery("(max-width:1400px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isBetweenSmAndMd = useMediaQuery(
    "(min-width:477px) and (max-width:510px)",
  );

    const isExactly1440 = useMediaQuery(
    "(min-width:1400px) and (max-width:1500px)"
  );
  const { details: approval, loading } = useUploadAdminDetails(approvalId);

  const [comment, setComment] = useState("");
  const {
    comments,
    loading: commentsLoading,
    posting,
    addComment,
    approve,
    reject,
    actionLoading,
  } = useUploadApprovalComments(approvalId);

  if (loading || !approval) return null;

  // //  Loading state
  //   if (loading) return <CommonSkeleton type="approvalDetails" />;

  //   //  Empty / error state
  //   if (!approval) {
  //     return (
  //       <Paper sx={{ p: 4 }}>
  //         <EmptyStateLoader
  //           title="No approval selected"
  //           subtitle="Select an approval from the list"
  //           height={240}
  //           icon="FileSearch"
  //         />
  //       </Paper>
  //     );
  //   }

  const { task, patient, assigned_to_user, submitted_at } = approval;

  const handleChipClick = (text: string) => {
    setComment((prev) => (prev ? `${prev} ${text}` : text));
  };

  /** Task type styles based on theme */
  const taskTypeStyles: Record<
    "E Signature" | "File Upload",
    { bg: string; text: string }
  > = {
    "E Signature": {
      bg: theme.palette.error.light,
      text: theme.palette.error.main,
    },
    "File Upload": {
      bg: theme.palette.success.light,
      text: theme.palette.success.main,
    },
  };

  const chipMessage =
    role === "admin"
      ? [
          "Hi!",
          "Reviewing Your Documents",
          "Good progress!",
          "Update received, we’ll reply shortly",
        ]
      : ["Needs further consultation", "Happy to proceed"];

  type taskType = "E Signature" | "File Upload";

  const taskTypeIconMap: Record<taskType, "ClipboardPen" | "File"> = {
    "E Signature": "ClipboardPen",
    "File Upload": "File",
  };
  const taskType = approval?.type
    ? (formatDropdownLabel(approval?.type) as taskType)
    : undefined;

  const approvalStatus = approval?.status; // e.g. "approved" | "rejected"
  // for action buttons to be disabled
  const isFinalized =
    approvalStatus === "Approved" || approvalStatus === "Rejected";

  const adminStatusConfig = (() => {
    if (approvalStatus === "Approved") {
      return {
        bg: theme.palette.success.light,
        border: theme.palette.success.main,
        text: theme.palette.success.main,
        icon: "CircleCheckBig" as const,
        message: "This form has been approved",
      };
    }

    if (approvalStatus === "Rejected") {
      return {
        bg: theme.palette.error.light,
        border: theme.palette.error.main,
        text: theme.palette.error.main,
        icon: "CircleX" as const,
        message: "This form has been rejected",
      };
    }

    // default
    return {
      bg: theme.palette.primary.light,
      border: theme.palette.primary.main,
      text: theme.palette.primary.main,
      icon: "CircleAlert" as const,
      message: "Requires medical team review before approval",
    };
  })();

  const CommentItem = ({ c }: { c: any }) => (
    <Box sx={{ display: "flex", gap: 1.5 }}>
      <Avatar
        sx={{
          width: 30,
          height: 30,
          backgroundColor: "#FEF3C6",
          color: theme.palette.warning.main,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {getInitials(c?.commentedByUser?.userName || "")}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}>
          <Typography variant="body2">
            {c?.commentedByUser?.userName}
          </Typography>

          <Chip
            label={convertToCamelCase(c?.commentedByUser?.role)}
            size="small"
            sx={{
              fontSize: 11,
              backgroundColor: "#F1F5F9",
            }}
          />

          <Typography variant="caption" color="text.secondary">
            {dayjs(c.commented_at).format("YYYY-MM-DD HH:mm")}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: "#314158" }}>
          {c.comment}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: "100%", overflowY: "auto" }}>
      {/* SECTION 1 — DETAILS AREA */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        {/* TOP CONTENT (with Back Icon for mobile) */}
        <Grid container spacing={2} alignItems="flex-start">
          {/* LEFT — Back Icon + Title */}
          <Grid size={{ xs: 7, md: 7 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              {isBelowMd && onBack && (
                <CommonIconButton
                  icon={
                    <CommonIcon
                      name="ChevronLeft"
                      color={theme.palette.text.primary}
                    />
                  }
                  onClick={onBack}
                />
              )}
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  {task?.task_name ?? "--"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Patient: {patient?.userName ?? "--"}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{textWrapMode: "nowrap"}}>
                  Submitted:{" "}
                  {submitted_at
                    ? dayjs(submitted_at).format(DATE_FORMATS.DATE_TIME)
                    : null}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* RIGHT — Chip + Button */}
          <Grid
            size={{ xs: 5, sm: 5, md: 5 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              gap: 1.3,
            }}
          >
            {taskType && (
              <Chip
                icon={
                  isMobile ? (
                    <CommonIcon
                      name={taskTypeIconMap[taskType]}
                      color={taskTypeStyles[taskType].text}
                      size={16}
                    />
                  ) : undefined
                }
                label={isMobile ? null : `${taskType}`}
                sx={{
                  bgcolor: taskTypeStyles[taskType].bg,
                  color: taskTypeStyles[taskType].text,
                  fontWeight: theme.typography.h6.fontWeight,

                  height: 24,
                  width: isMobile ? 24 : "auto",

                  borderRadius: isMobile ? "50%" : "6px",

                  "& .MuiChip-label": {
                    display: isMobile ? "none" : "block",
                    px: 0.5,
                  },

                  "& .MuiChip-icon": {
                    ml: 0,
                    mr: isMobile ? 0 : 0.5,
                  },

                  px: isMobile ? 0 : 1,
                  justifyContent: "center",
                }}
              />
            )}

            {/* {!isMobile && !isBetweenSmAndMd && (
              <CommonButton
                variant="outlined"
                startIcon={<CommonIcon name="FileUp" />}
                onClick={onOpenForm}
                sx={{ whiteSpace: "nowrap" }}
              >
                View Uploadp
              </CommonButton>
            )} */}
               {!isMobile && !isBetweenSmAndMd && (
                          <CommonButton
                            variant="outlined"
                            startIcon={<CommonIcon name="File" />}
                            onClick={() => { onOpenForm?.()}}
                            sx={{
                              whiteSpace: "nowrap",
                              minWidth: isExactly1440 && formOpened ? "auto" : "120px",
                              px: isExactly1440 && formOpened ? 1 : undefined,
                              "& .MuiButton-startIcon": {
                                margin: isExactly1440 && formOpened ? 0 : undefined,
                              },
                            }}
                          >
                            {!(isExactly1440 && formOpened) && "View Form"}
                          </CommonButton>
                        )}
          </Grid>

          {isBetweenSmAndMd && !isMobile && (
            <Grid size={{ xs: 12 }}>
              <CommonButton
                fullWidth
                variant="outlined"
                startIcon={<CommonIcon name="FileUp" />}
                onClick={onOpenForm}
              >
                View Upload
              </CommonButton>
            </Grid>
          )}
          {isMobile && (
            <Grid size={{ xs: 12 }}>
              <CommonButton
                fullWidth
                variant="outlined"
                startIcon={<CommonIcon name="FileUp" />}
                onClick={onOpenForm}
              >
                View Upload
              </CommonButton>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* ASSIGN TO */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 12, md: 6 }} sx={{ mb: 3, width: "100%" }}>
            <CommonTextField
              label="Assign To"
              value={
                assigned_to_user
                  ? `${assigned_to_user?.userName ?? "--"} (${assigned_to_user?.role ? capitalize(assigned_to_user?.role) : ""})`
                  : "--"
              }
              disabled={true}
            />
          </Grid>
        </Grid>

        {/* SUMMARY GRID */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.4 }}>
              Full Name
            </Typography>
            <Typography variant="body1" color="text.primary">
              {patient?.userName ?? "--"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.4 }}>
              Date of Birth
            </Typography>
            <Typography variant="body1" color="text.primary">
              {patient?.dob ?? "--"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.4 }}>
              Contact Number
            </Typography>
            <Typography variant="body1" color="text.primary">
              {patient?.phoneNumber ?? "--"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.4 }}>
              Email Address
            </Typography>
            <Typography
              variant="body1"
              color="text.primary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {patient?.email ?? "--"}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* WARNING BOX */}
        <Box
          sx={{
            borderRadius: 1.5,
            bgcolor: adminStatusConfig.bg,
            border: `1px solid ${adminStatusConfig.border}`,
            p: 1.5,
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <CommonIcon
            name={adminStatusConfig.icon}
            color={adminStatusConfig.text}
          />
          <Typography variant="body2" sx={{ color: adminStatusConfig.text }}>
            {adminStatusConfig.message}
          </Typography>
        </Box>
      </Paper>

      {/* SECTION 2 — COMMENT AREA  */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="body1">Add Comment (Optional)</Typography>

          <Box
            sx={{
              minWidth: 28,
              height: 24,
              px: 1,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="overline">{comments.length}</Typography>
          </Box>
        </Box>

        {/* Comments list */}
        <Box
          sx={{
            maxHeight: 200,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mb: 2,
          }}
        >
          {!comments.length && !commentsLoading && (
            <Typography color="text.secondary">No comments yet</Typography>
          )}

          {comments.map((c) => (
            <CommentItem key={c.id} c={c} />
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Quick chips */}
        <Stack direction="row" gap={1} sx={{ flexWrap: "wrap", mb: 2 }}>
          {chipMessage.map((text) => (
            <Chip
              key={text}
              label={text}
              clickable
              variant="outlined"
              onClick={() => handleChipClick(text)}
              sx={{ borderColor: "primary.main" }}
            />
          ))}
        </Stack>

        {/* Comment input */}
        <BaseTextField
          startIcon={false}
          fullWidth
          multiline
          rows={3}
          placeholder="Add notes or comments for the team..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#F3F3F5",
              height: "96px",
            },
          }}
        />

        {/* Submit */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <CommonButton
            variant="contained"
            startIcon={<CommonIcon name="MessageSquare" />}
            disabled={posting || !comment.trim()}
            onClick={async () => {
              await addComment(comment);
              setComment("");
            }}
          >
            {posting ? "Posting..." : "Add Comment"}
          </CommonButton>
        </Box>
      </Paper>

      {/* SECTION 3 — ACTION BUTTONS */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid container spacing={2} justifyContent="center">
          {/* APPROVE BUTTON */}
          <Grid
            size={{ xs: 12, sm: 6 }}
            sx={{ cursor: isFinalized ? "not-allowed" : "pointer" }}
          >
            <CommonButton
              fullWidth
              variant="contained"
              loading={actionLoading}
              startIcon={<CommonIcon name="CircleCheckBig" />}
              disabled={isFinalized}
              onClick={async () => {
                // if (!approval || !form) return;
                if (isFinalized) return;
                await approve({
                  taskId: task.id,
                  submissionId: approval.id, //  list item id
                  isApproved: true,
                  isRejected: false,
                  // ...(comment.trim() ? { comment: { comment } } : {}), //  comment key omitted completely
                });

                onActionSuccess?.();
              }}
            >
              Approve
            </CommonButton>
          </Grid>

          {/* REJECT BUTTON */}
          <Grid
            size={{ xs: 12, sm: 6 }}
            sx={{ cursor: isFinalized ? "not-allowed" : "pointer" }}
          >
            <CommonButton
              fullWidth
              variant="outlined"
              color="error"
              loading={actionLoading}
              startIcon={<CommonIcon name="CircleX" />}
              disabled={isFinalized}
              onClick={async () => {
                // if (!approval || !form) return;
                if (isFinalized) return;
                await reject({
                  taskId: task?.id,
                  submissionId: approval.id,
                  isApproved: false,
                  isRejected: true,
                  // ...(comment.trim() ? { comment: { comment } } : {}), //  comment key omitted completely
                });

                onActionSuccess?.();
              }}
            >
              Reject
            </CommonButton>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminUploadsApprovalDetails;
