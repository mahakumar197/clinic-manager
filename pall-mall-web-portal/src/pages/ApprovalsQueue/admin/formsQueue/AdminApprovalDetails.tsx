import { useAuthRole } from "@/hooks/useAuthRole";
import { capitalize, convertToCamelCase, getInitials, handleEnterStart } from "@/utils";
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
import { useState, useRef } from "react";
import { useAdminApprovalsDetails } from "../hooks/formHooks/useAdminApprovalsDetails";
import { useApprovalComments } from "../hooks/formHooks/useApprovalsComments";
import { DATE_FORMATS } from "@/constants";
enableDayjsUTC();

type Props = {
  approvalId: string | null;
  onBack?: () => void;
  onOpenForm?: () => void;
  onActionSuccess?: () => void;
  formOpened?: boolean;
};

const AdminApprovalDetails = ({
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
    "(min-width:477px) and (max-width:510px)"
  );
  const isExactly1440 = useMediaQuery(
    "(min-width:1400px) and (max-width:1500px)"
  );

  const { details: approval, loading } = useAdminApprovalsDetails(approvalId);

  const [comment, setComment] = useState("");
  const MAX_COMMENT_LENGTH = 250;
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  const {
    comments,
    loading: commentsLoading,
    posting,
    addComment,
    approve,
    reject,
    actionLoading,
  } = useApprovalComments(approvalId);

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

  const { form, patient, assigned_to_user, submitted_at } = approval;

  const handleChipClick = (text: string) => {
    setComment((prev) => (prev ? `${prev} ${text}` : text));
    // Focus the comment input so Enter sends the message
    setTimeout(() => commentInputRef.current?.focus(), 0);
  };

  /** Match urgency chip colors with ApprovalsList */
  const urgencyStyles: Record<
    "High" | "Mid" | "Low",
    { bg: string; text: string }
  > = {
    High: { bg: theme.palette.error.light, text: theme.palette.error.main },
    Mid: { bg: "#FEF3C6", text: theme.palette.warning.main },
    Low: { bg: theme.palette.success.light, text: theme.palette.success.main },
  };

  const chipMessage =
    role === "admin"
      ? [
          "Hi!",
          "Reviewing Your Documents",
          "Good progress!",
          "Update received, we'll reply shortly",
        ]
      : ["Needs further consultation", "Happy to proceed"];

  type Urgency = "High" | "Mid" | "Low";

  const urgencyIconMap: Record<
    Urgency,
    "AlertTriangle" | "AlertCircle" | "Info"
  > = {
    High: "AlertTriangle",
    Mid: "AlertCircle",
    Low: "Info",
  };
  const priority = form?.priority as Urgency | undefined;

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

  const handleSendComment = async () => {
    if (!comment.trim() || comment.length > MAX_COMMENT_LENGTH) return;
    await addComment(comment);
    setComment("");
  };

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
          <Grid size={{ xs: 8, md: 8 }}>
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
                  {form?.name ?? "--"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Patient: {patient?.userName ?? "Guest User"}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ textWrapMode: "nowrap" ,lineHeight: 1.8 }}>
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
            size={{ xs: 4, sm: 4, md: 4 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              gap: 1.3,
            }}
          >
            {priority && (
              <Chip
                icon={
                  isMobile ? (
                    <CommonIcon
                      name={urgencyIconMap[priority]}
                      color={urgencyStyles[priority].text}
                      size={16}
                    />
                  ) : undefined
                }
                label={isMobile ? null : `${priority} Priority`}
                sx={{
                  bgcolor: urgencyStyles[priority].bg,
                  color: urgencyStyles[priority].text,
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
                startIcon={<CommonIcon name="File" />}
                onClick={onOpenForm}
              >
                View Form
              </CommonButton>
            </Grid>
          )}
          {isMobile && (
            <Grid size={{ xs: 12 }}>
              <CommonButton
                fullWidth
                variant="outlined"
                startIcon={<CommonIcon name="File" />}
                onClick={onOpenForm}
              >
                View Form
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

        {/* CONDITIONAL AREA */}
        {form?.form_type === "Health Questionnaire" ? (
          <Grid container spacing={3} sx={{ mb: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.4 }}
              >
                Previous Surgeries
              </Typography>
              <Typography variant="body1" color="text.primary">
                {"--"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.4 }}
              >
                Allergies
              </Typography>
              <Typography variant="body1" color="text.primary">
                {"--"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.4 }}
              >
                Current Medications
              </Typography>
              <Typography variant="body1" color="text.primary">
                {"--"}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ mb: 1 }}>
            {[
              "I consent to the proposed surgical procedure",
              "I understand the risks and complications",
              "I have read and understood the information provided",
            ].map((label, i) => (
              <Box
                key={i}
                sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mb: 1.5 }}
              >
                <Box sx={{ mt: 0.2, flexShrink: 0 }}>
                  <CommonIcon
                    name="CircleCheckBig"
                    color={theme.palette.primary.main}
                    size={20}
                  />
                </Box>
                <Typography 
                  variant="body2"
                  sx={{
                    flex: 1,
                    lineHeight: 1.6,
                    wordBreak: "break-word"
                  }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
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
          inputRef={commentInputRef}
          startIcon={false}
          fullWidth
          multiline
          rows={3}
          placeholder="Add notes or comments for the team..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e: any) => handleEnterStart(e, handleSendComment)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#F3F3F5",
              height: "96px",
            },
          }}
        />
        {comment.length > MAX_COMMENT_LENGTH && (
          <Typography
            variant="caption"
            sx={{ color: theme.palette.error.main, mb: 1, display: "block" }}
          >
            Only {MAX_COMMENT_LENGTH} characters are allowed
          </Typography>
        )}


        {/* Submit */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <CommonButton
            variant="contained"
            startIcon={<CommonIcon name="MessageSquare" />}
            // disabled={posting || !comment.trim()}
            disabled={
              posting ||
              !comment.trim() ||
              comment.length > MAX_COMMENT_LENGTH
            }
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
                  formId: form.id,
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
                  formId: form.id,
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

export default AdminApprovalDetails;
