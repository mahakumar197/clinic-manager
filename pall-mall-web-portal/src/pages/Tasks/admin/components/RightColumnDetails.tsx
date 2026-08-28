import { Box, Grid, Typography, Chip } from "@mui/material";
import AttachmentSection from "./AttachmentSection";
import AssignmentSection from "./AssignmentSection";
import { CommonIcon } from "@/components/common";
import dayjs from "dayjs";
import { DATE_FORMATS } from "@/constants";
import {
  Card,
  Dot,
  IconImg,
  commentsDummy,
  attachmentsDummy,
} from "@/pages/Tasks/admin/components/common/TaskUIHelpers";
import { convertToCamelCase } from "@/utils";
const RightColumn = ({
  task,
  theme,
  attachments,
  handleChooseSidebarFile,
  handleSidebarFileChange,
  handleDownload,
  sidebarFile,
  attachmentLoading,
  sidebarFileRef,
  setReassignOpen,
  activity,
  tablePalette,
}: any) => {
  const getStatusColors = (status: string) => {
    const statusKey = status?.toLowerCase() || "";

    if (statusKey === "pending") {
      return {
        bg: tablePalette.tableTextBackground.pending,
        text: tablePalette.tableText.pending,
      };
    }
    if (statusKey === "inprogress" || statusKey === "in progress") {
      return {
        bg: tablePalette.tableTextBackground.manager,
        text: tablePalette.tableText.manager,
      };
    }
    if (statusKey === "completed") {
      return {
        bg: tablePalette.tableTextBackground.active,
        text: tablePalette.tableText.active,
      };
    }
    if (statusKey === "overdue") {
      return {
        bg: tablePalette.tableTextBackground.overdue,
        text: tablePalette.tableText.suspended,
      };
    }
    if (statusKey === "deleted") {
      return {
        bg: tablePalette.tableTextBackground.suspended,
        text: tablePalette.tableText.suspended,
      };
    }
    return {
      bg: tablePalette.tableTextBackground.header,
      text: "text.primary",
    };
  };

  const statusColors = getStatusColors(task.status);

  return (
    <Grid
      size={{ xs: 12, md: 4, lg: 4, xl: 4 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
      }}
    >
      {/* Task Status */}
      <Card>
        <Typography variant="body1" mb={3}>
          Task Status
        </Typography>

        <Typography
          variant="button"
          fontSize={theme.typography.body2.fontSize}
          sx={{ color: "text.primary" }}
        >
          Status
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Chip
            label={task.status}
            size="small"
            sx={{
              backgroundColor: statusColors.bg,
              color: statusColors.text,
              fontWeight: 600,
              borderRadius: "6px",
              textTransform: "capitalize",
            }}
          />
        </Box>
      </Card>

      {/* Assignment */}
      <Card>
        <AssignmentSection
          assignedUser={{ userName: task.assignedUser?.userName || "-" }}
          onReassign={() => setReassignOpen(true)}
          disabled={task.status === "Deleted" || task.status === "Completed"}
        />
      </Card>

      {/* Key Dates */}
      <Card>
        <Typography variant="body1" sx={{ mb: 6 }}>
          Key Dates
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Row Item */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CommonIcon name="Calendar" color="#90A1B9" />
              <Typography variant="body2" sx={{ color: "text.primary" }}>
                Due Date
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", ml: 4 }}>
              {task.due_date}
            </Typography>
          </Box>

          {/* Row Item */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CommonIcon name="Clock" color="#90A1B9" />
              <Typography variant="body2" sx={{ color: "text.primary" }}>
                Created
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: "text.secondary", ml: 4 }}>
              {dayjs(task.created_at).format(DATE_FORMATS.DATE)}
            </Typography>
          </Box>

          {/* Row Item */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CommonIcon name="User" color="#90A1B9" />
              <Typography variant="body2" sx={{ color: "text.primary" }}>
                Created By
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: "text.secondary", ml: 4 }}>
              {`${convertToCamelCase(
                activity?.[0]?.performedByUser?.role,
              )} Team`}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Attachments */}
      <AttachmentSection
        attachments={attachments}
        handleChooseSidebarFile={handleChooseSidebarFile}
        handleSidebarFileChange={handleSidebarFileChange}
        handleDownload={handleDownload}
        sidebarFile={sidebarFile}
        theme={theme}
        tablePalette={tablePalette}
        attachmentLoading={attachmentLoading}
        sidebarFileRef={sidebarFileRef}
        disabled={task.status === "Deleted" || task.status === "Completed"}
      />
    </Grid>
  );
};

export default RightColumn;
