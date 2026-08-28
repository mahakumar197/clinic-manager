import CommonIcon from "@/components/common/CommonIcon";
import { DATE_FORMATS } from "@/constants";
import { UploadUserApprovalList } from "@/services";
import { formatDropdownLabel } from "@/utils";
import { enableDayjsUTC } from "@/utils/date";
import { Box, Chip, Grid, Paper, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";

enableDayjsUTC();

type Props = {
  approvals: UploadUserApprovalList[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};
const UserUploadsApprovalsList = ({
  approvals,
  selectedId,
  onSelect,
}: Props) => {
  const theme = useTheme();

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
  // if (!approvals.length) {
  //     return (
  //       <Paper sx={{ p: 4 }}>
  //         <EmptyStateLoader
  //           title="No approvals available"
  //           subtitle="Nothing to show right now"
  //           height={200}
  //           icon="Inbox"
  //         />
  //       </Paper>
  //     );
  //   }
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper, // White inner card
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ height: "1030px", overflowY: "auto" }}>
        {approvals?.map((item) => {
          const isSelected = item.id === selectedId;
          const patientName = item.patient?.userName;
          const taskName = item.task?.task_name;
          const type = formatDropdownLabel(item?.type);
          const submittedAt = item.submitted_at;

          return (
            <Box
              key={item.id}
              onClick={() => onSelect(item.id)} //  UPDATED: selection via props
              sx={{
                p: 2.2,
                mb: 2,
                borderRadius: "10px",
                cursor: "pointer",
                border: "1px solid",
                borderColor: isSelected
                  ? theme.palette.primary.main
                  : theme.palette.divider,
                bgcolor: isSelected
                  ? theme.palette.primary.light
                  : theme.palette.background.paper,
                "&:hover": {
                  bgcolor: !isSelected
                    ? "#F7F8FA"
                    : theme.palette.primary.light,
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Grid container spacing={2}>
                {/* NAME + TASK TYPE  CHIP */}
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body1"
                      color="text.primary"
                      sx={{ mb: 0.2 }}
                    >
                      {patientName ?? "--"}
                    </Typography>

                    {type && (
                      <Chip
                        label={type ?? "--"}
                        size="small"
                        sx={{
                          bgcolor: taskTypeStyles[type]?.bg,
                          color: taskTypeStyles[type]?.text,
                          fontWeight: 600,
                          height: 22,
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {taskName ?? "--"}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CommonIcon
                      name="Clock"
                      color={theme.palette.text.secondary}
                    />
                    <Typography color="text.secondary" variant="caption">
                      {submittedAt
                        ? dayjs(submittedAt).format(DATE_FORMATS.DATE_TIME)
                        : "--"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default UserUploadsApprovalsList;
