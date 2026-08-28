import {
  Box,
  Typography,
  Grid,
  Avatar,
  Divider,
  useTheme,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";

import { Height, WarningAmber } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { Card, Dot, IconImg, commentsDummy, attachmentsDummy, DotWithLine } from "@/pages/Tasks/admin/components/common/TaskUIHelpers";

import { useNavigate, useParams } from "react-router-dom";
import PageContainer from "@/components/layouts/PageContainer";
import CommonIcon from "@/components/common/CommonIcon";
import {
  CommonIconButton,
  CommonButton,
  Modal,
  CommonPageHeader,
  BaseTextField,
} from "@/components/common";
import { useRef } from "react";
import CreateTaskModal from "./CreateTask/CreateTaskModal";
// import CommonSkeleton from "@/components/common/CommonSkeleton";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import { useTaskDetails } from "../hooks/useTaskDetails";
import dayjs from "dayjs";
import { tasksService } from "@/services/modules/tasks.service";
import { toast } from "@/utils/toast";
import { ROUTES, DATE_FORMATS } from "@/constants";
import { useTaskComments } from "../hooks/useTaskComments";
import { useTaskAttachments } from "../hooks/useTaskAttachments";
import { convertToCamelCase, getInitials } from "@/utils";
import ReassignTaskModal from "./ReassignTaskModal";
import { tablePalette } from "@/theme/tablePalette";
import { ta } from "zod/v4/locales";
import CommonTextArea from "@/components/common/CommonTextArea";
import CommentItem from "./components/CommentItem";
import CommentsSection from "./components/CommentsSection";
import AttachmentSection from "./components/AttachmentSection";
import AssignmentSection from "./components/AssignmentSection";
import RightColumn from "./components/RightColumnDetails";


const AdminTaskDetails = () => {
  const { taskId } = useParams<{ taskId: string }>();

  const { task, activity, loading, refetch, comments, attachments } =
    useTaskDetails(taskId!);

  const {
    addAttachment,
    loading: attachmentLoading,
    handleDownload,
  } = useTaskAttachments(taskId!, refetch);
  const [reassignOpen, setReassignOpen] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const { addComment, loading: commentLoading } = useTaskComments(
    taskId!,
    refetch,
  );
  const [pendingAttachmentId, setPendingAttachmentId] = useState<string | null>(
    null,
  );
  const [pendingAttachmentName, setPendingAttachmentName] = useState<
    string | null
  >(null);

  const commentFileRef = useRef<HTMLInputElement | null>(null);

  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [commentPreviewUrl, setCommentPreviewUrl] = useState<string | null>(
    null,
  );
  const [commentUploading, setCommentUploading] = useState(false);

  const sidebarFileRef = useRef<HTMLInputElement | null>(null);
  const [sidebarFile, setSidebarFile] = useState<File | null>(null);

  const handleChooseCommentFile = () => {
    commentFileRef.current?.click();
  };

  const handleAttach = async (file: File) => {
    const attachmentId = await addAttachment(file, true);

    if (!attachmentId) return;

    setPendingAttachmentId(attachmentId);
    setPendingAttachmentName(file.name);
  };

  useEffect(() => {
    if (!(commentFile instanceof File)) {
      setCommentPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(commentFile);
    setCommentPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [commentFile]);

  const handleRemoveCommentAttachment = () => {
    setCommentFile(null);
    setCommentPreviewUrl(null);
    setPendingAttachmentId(null);
    setPendingAttachmentName(null);

    // reset file input so same file can be selected again
    if (commentFileRef.current) {
      commentFileRef.current.value = "";
    }
  };



  const handleCommentFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🔹 UI FLOW (preview)
    setCommentFile(file);

    try {
      // 🔹 BACKEND FLOW
      setCommentUploading(true);

      const attachmentId = await addAttachment(file, true);
      if (!attachmentId) return;

      setPendingAttachmentId(attachmentId);
      setPendingAttachmentName(file.name);
    } finally {
      setCommentUploading(false);
    }

    e.target.value = "";
  };

  const handleChooseSidebarFile = () => {
    sidebarFileRef.current?.click();
  };

  const handleSidebarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await addAttachment(file);
    setSidebarFile(null);
  };

  const isOverdue =
    task &&
    dayjs(task.due_date).isBefore(dayjs(), "day") &&
    task.status !== "Completed";

  if (loading) {
    return (
      <PageContainer>
        <CommonSkeleton type="taskDetailsPage" />
      </PageContainer>
    );
  }

  if (!task) return null;

  const handleDeleteTask = async () => {
    if (!taskId) return;

    try {
      setDeleting(true);

      await tasksService.deleteTask(taskId);

      toast.success("Task deleted successfully");

      setDeleteOpen(false);

      navigate(ROUTES.TASKS);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const handleRevokeTask = async () => {
    if (!taskId) return;

    try {
      setRevoking(true);

      await tasksService.recoverTask(taskId);

      toast.success("Task revoked successfully");

      setRevokeOpen(false);
      
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to recover task");
    } finally {
      setRevoking(false);
    }
  };

  const toCapitalCase = (value?: string) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

  const handlePostComment = async () => {
    await addComment(comment, pendingAttachmentId);

    setComment("");
    setPendingAttachmentId(null);
    setPendingAttachmentName(null);
  };

  return (
    <PageContainer>
      {/* Header */}
      <Grid container justifyContent="space-between">
        <Grid size={{ xs: 12, md: 8 }}>
          <CommonPageHeader
            enableBack
            title={task?.task_name}
            subtitle={`Task • ${task?.patient?.userName}`}
            titleSx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
            subtitleSx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}

          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ mt: { xs: 2, md: 0 } }}>
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="flex-end"
          >
            {/* EDIT */}
            {/* <Grid size={{ xs: 10, sm: "auto" }}> */}
            <Grid size={{ xs: task?.status === "Deleted" ? 12 : 10, sm: "auto" }}>
              <CommonButton
                variant="outlined"
                startIcon={<CommonIcon name="SquarePen" />}
                sx={{
                  color: "text.primary",
                  border: `1px solid ${theme.palette.divider}`,
                  width: { xs: "100%", sm: "auto" },
                }}
                onClick={() => setOpenTaskModal(true)}
                disabled={loading || task?.status === "Deleted" || task?.status === "Completed"}
              >
                Edit
              </CommonButton>
            </Grid>

            {/* DELETE / RECOVER */}
            <Grid
              // size={{ xs: 2, sm: "auto" }}
              size={{ xs: task?.status === "Deleted" ? 12 : 2, sm: "auto" }}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              {task?.status === "Deleted" ? (
                <CommonButton
                  variant="contained"
                  startIcon={<CommonIcon name="RotateCcw" />}
                  sx={{
                    backgroundColor: "primary.main",
                    color: "background.paper",
                    width: { xs: "100%", sm: "auto" },
                  }}
                  onClick={() => setRevokeOpen(true)}
                  disabled={loading}
                >
                  Recover Task
                </CommonButton>
              ) : (
                <CommonIconButton
                  icon={
                    <CommonIcon
                      name="Trash2"
                      color={loading || task?.status === "Completed"  ? "#BDBDBD" : theme.palette.error.main}
                      size={24}
                    />
                  }
                  onClick={() => setDeleteOpen(true)}
                  disabled={loading || task?.status === "Completed" }
                />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {loading ? (
        <CommonSkeleton type="taskDetailsPage" />
      ) : (
        <>
          {/* Warning Box */}
          {isOverdue && (
            <Card
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                backgroundColor: "error.light",
                border: "1px solid #FFC9C9",
              }}
            >
              <CommonIcon name="CircleAlert" size={26} color="#E7000B" />

              <Box>
                <Typography variant="subtitle2" sx={{ color: "#82181A" }}>
                  Task Overdue
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: tablePalette.tableText.suspended }}
                >
                  This task was due on {task.due_date} and has not yet been
                  completed by the patient. Please provide support or follow up
                  as needed.
                </Typography>
              </Box>
            </Card>
          )}
          <Grid
            container
            spacing={2}
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            {/* LEFT COLUMN (8 columns) */}
            <Grid
              size={{ xs: 12, md: 8, lg: 8, xl: 8 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
              }}
            >
              {/* Task Details */}
              <Card>
                {/* Title */}
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Task Details
                </Typography>

                {/* Description Section */}
                <Typography
                  variant="button"
                  fontSize={theme.typography.body2.fontSize}
                  sx={{ color: "text.primary" }}
                >
                  Description
                </Typography>

                <Typography variant="body1" sx={{ mt: 0.5, mb: 2 }}>
                  {task?.task_description || "—"}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Two Column Grid */}
                <Grid container spacing={3}>
                  {/* LEFT COLUMN */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="button"
                      fontSize={theme.typography.body2.fontSize}
                      sx={{ color: "text.primary" }}
                    >
                      Patient Name
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {task?.patient?.userName}
                    </Typography>

                    <Typography
                      variant="button"
                      fontSize={theme.typography.body2.fontSize}
                      sx={{ color: "text.primary", mt: 3, display: "block" }}
                    >
                      Procedure Type
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {task?.procedure_type}
                    </Typography>
                  </Grid>

                  {/* RIGHT COLUMN */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ color: "text.primary" }}
                    >
                      Patient ID
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {task?.patient_id}
                    </Typography>

                    <Typography
                      variant="button"
                      fontWeight={500}
                      fontSize={theme.typography.body2.fontSize}
                      sx={{ color: "text.primary", mt: 3, display: "block" }}
                    >
                      Phase
                    </Typography>

                    <Chip
                      label={task?.phase}
                      variant="outlined"
                      sx={{
                        mt: 0.5,
                        height: 24,
                        borderRadius: "8px",
                        borderColor: theme.palette.divider,
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "text.primary",
                      }}
                    />
                  </Grid>
                </Grid>
              </Card>
              {/* Comments */}
              <Card>
                <CommentsSection
                  comments={comments}
                  comment={comment}
                  setComment={setComment}
                  commentFile={commentFile}
                  commentPreviewUrl={commentPreviewUrl}
                  pendingAttachmentName={pendingAttachmentName}
                  handleChooseCommentFile={handleChooseCommentFile}
                  handleCommentFileChange={handleCommentFileChange}
                  handleRemoveCommentAttachment={handleRemoveCommentAttachment}
                  handlePostComment={handlePostComment}
                  commentLoading={commentLoading}
                  commentUploading={commentUploading}
                  commentFileRef={commentFileRef}
                  disabled={task.status === "Deleted" || task?.status === "Completed"}
                />
              </Card>

              {/* Activity Timeline */}

              <Card sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Activity Timeline
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    maxHeight: 160, 
                    overflowY: "auto",
                    pr: 1,
                  }}
                >
                  {activity.map((a,index) => (
                    <Box key={a?.id} sx={{ display: "flex", gap: 1.5 }}>
                      {/* <Dot /> */}
                       <DotWithLine isLast={index === activity.length - 1} />
                      <Box>
                        <Typography variant="body2">
                          <b>{a?.performedByUser?.userName}</b> {a.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(a?.performed_at).format(DATE_FORMATS.DATE_TIME)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>

            </Grid>

            {/* RIGHT COLUMN */}
            <RightColumn
              task={task}
              theme={theme}
              attachments={attachments}
              handleChooseSidebarFile={handleChooseSidebarFile}
              handleSidebarFileChange={handleSidebarFileChange}
              handleDownload={handleDownload}
              sidebarFile={sidebarFile}
              attachmentLoading={attachmentLoading}
              sidebarFileRef={sidebarFileRef}
              activity={activity}
              tablePalette={tablePalette}
              setReassignOpen={setReassignOpen}
            />
          </Grid>
        </>
      )}

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
            <CommonIcon name="AlertTriangle" size={20} color="red" />
            Delete Task
          </Box>
        }
        actions={
          <>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                gap: 1.5,
                justifyContent: "flex-end",
                // paddingRight: 2,
              }}
            >
              <CommonButton
                variant="outlined"
                onClick={() => setDeleteOpen(false)}
              >
                <Typography variant="body2">Cancel</Typography>
              </CommonButton>

              <CommonButton
                onClick={handleDeleteTask}
                variant="contained"
                loading={deleting}
                sx={{
                  backgroundColor: "error.main",
                  color: "background.paper",
                  whiteSpace: "nowrap",
                }}
                startIcon={<CommonIcon name="Trash2" />}
              >
                Delete Task
              </CommonButton>
            </Box>
          </>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Temporarily or permanently restrict access for this user
          </Typography>

          {/* User card */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              backgroundColor: "background.default",
              borderRadius: "8px",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                backgroundColor: "primary.light",
                display: { xs: "none", sm: "flex" },
                color: "warning.dark",
              }}
            >
              {task?.patient?.userName[0]}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="body1">{task?.patient?.userName}</Typography>
              <Typography variant="body2">
                Assigned To {task?.assignedUser?.userName}
              </Typography>
            </Box>

            {/* Updated Status using Chip */}
            <Box sx={{ ml: "auto", display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
              <Chip
                label="Active"
                size="small"
                sx={{
                  backgroundColor: tablePalette.tableTextBackground.active,
                  color: tablePalette.tableText.active,
                  fontWeight: 600,
                  borderRadius: "6px",
                  // textTransform: "uppercase",
                }}
              />
            </Box>
            {/* Mobile icon badge */}
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                color: tablePalette.tableText.active,
                width: 28,
                height: 28,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CommonIcon name="CircleCheckBig" size={18} />
            </Box>
          </Box>

          <Typography variant="body1">
            Are you sure you want to delete this task?
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              p: 2,
              backgroundColor: "error.light",
              border: `1px solid ${theme.palette.warning.main}`,
              borderRadius: "8px",
            }}
          >
            <CommonIcon name="AlertTriangle" color="red" size={20} />
            <Box>
              <Typography variant="button" sx={{ color: "error.main" }}>
                Warning
              </Typography>
              <Typography variant="body2" sx={{ color: "error.dark" }}>
                This action will permanently remove the selected task for this
                patient.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Recover Modal */}
      <Modal
        open={revokeOpen}
        onClose={() => setRevokeOpen(false)}
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
            <CommonIcon name="RotateCcw" size={20} color={theme.palette.primary.main} />
            Recover Task
          </Box>
        }
        actions={
          <>
            {/* <Box
              sx={{
                mb: 2,
                display: "flex",
                gap: 1.5,
                justifyContent: "flex-end",
                // paddingRight: 2,
              }}
            > */}
            <Grid container spacing={1.5} sx={{ width: "100%", mx: 0, mb: 2 }}>
              <Grid size={{ xs: 12, sm: "auto" }} sx={{ ml: { sm: "auto" } }}>
                <CommonButton
                  variant="outlined"
                  onClick={() => setRevokeOpen(false)}
                  sx={{ width: "100%" }}
                >
                  <Typography variant="body2">Cancel</Typography>
                </CommonButton>
              </Grid>
              <Grid size={{ xs: 12, sm: "auto" }}>
                <CommonButton
                  onClick={handleRevokeTask}
                  variant="contained"
                  loading={revoking}
                  sx={{
                    backgroundColor: "primary.main",
                    color: "background.paper",
                    width: "100%",
                  }}
                  startIcon={<CommonIcon name="RotateCcw" />}
                >
                  Recover Task
                </CommonButton>
              </Grid>
            </Grid>
            {/* </Box> */}
          </>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Recover access for this task
          </Typography>

          {/* User card */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              backgroundColor: "background.default",
              borderRadius: "8px",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                backgroundColor: "primary.light",
                display: { xs: "none", sm: "flex" },
                color: "warning.dark",
              }}
            >
              {task?.patient?.userName[0]}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="body1">{task?.patient?.userName}</Typography>
              <Typography variant="body2">
                Assigned To {task?.assignedUser?.userName}
              </Typography>
            </Box>
            <Box sx={{ ml: "auto", display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
              <Chip
                label="Deleted"
                size="small"
                sx={{
                  backgroundColor: tablePalette.tableTextBackground.suspended,
                  color: tablePalette.tableText.suspended,
                  fontWeight: 600,
                  borderRadius: "6px",
                }}
              />
            </Box>
            {/* Mobile icon badge */}
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                color: tablePalette.tableText.suspended,
                width: 28,
                height: 28,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CommonIcon name="Trash2" size={18} />
            </Box>
          </Box>

          <Typography variant="body1">
            Are you sure you want to recover this task?
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              p: 2,
              backgroundColor: "primary.light",
              border: `1px solid ${theme.palette.primary.main}`,
              borderRadius: "8px",
            }}
          >
            <CommonIcon name="Info" color={theme.palette.primary.main} size={20} />
            <Box>
              <Typography variant="button" sx={{ color: "primary.main" }}>
                Note
              </Typography>
              <Typography variant="body2" sx={{ color: "primary.dark" }}>
                This action will recover the selected task for this patient.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Modal>
      {/* Reassign Modal */}
      <ReassignTaskModal
        open={reassignOpen}
        onClose={() => setReassignOpen(false)}
        taskId={taskId!}
        onSuccess={refetch}
      />
      <CreateTaskModal
        open={openTaskModal}
        onClose={() => setOpenTaskModal(false)}
        mode="edit"
        taskDetails={task}
        onSuccess={() => {
          refetch();
          setOpenTaskModal(false);
        }}
      />
    </PageContainer>
  );
};

export default AdminTaskDetails;
