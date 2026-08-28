import CommonIcon from "@/components/common/CommonIcon";
import { DATE_FORMATS } from "@/constants";
import { UserApprovalList } from "@/services";
import { enableDayjsUTC } from "@/utils/date";
import { Box, Chip, Grid, Paper, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";

enableDayjsUTC();

type Props = {
  approvals: UserApprovalList[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};
const UserApprovalsList = ({ approvals, selectedId, onSelect }: Props) => {
  const theme = useTheme();

  /** Urgency styles based on theme */
  const priorityStyles: Record<
    "Completed" | "Pending" | "Rejected",
    { bg: string; text: string }
  > = {
    Completed: {
      bg: theme.palette.success.light,
      text: theme.palette.success.main,
    },
    Pending: { bg: "#FEF3C6", text: theme.palette.warning.main },
    Rejected: { bg: theme.palette.error.light, text: theme.palette.error.main },
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ height: "1030px", overflowY: "auto" }}>
        {approvals?.map((item) => {
          const isSelected = item.id === selectedId;
          const patientName = item.patient_details?.userName;
          const formName = item.form?.name;
          const priority = item?.form_flag;
          const submittedAt = item.submitted_at;

          return (
            <Box
              key={item.id}
              onClick={() => onSelect(item.id)}
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
                {/* NAME + PRIORITY  CHIP */}
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

                    {priority && (
                      <Chip
                        label={priority ?? "--"}
                        size="small"
                        sx={{
                          bgcolor: priorityStyles[priority]?.bg,
                          color: priorityStyles[priority]?.text,
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
                    {formName ?? "--"}
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

export default UserApprovalsList;
