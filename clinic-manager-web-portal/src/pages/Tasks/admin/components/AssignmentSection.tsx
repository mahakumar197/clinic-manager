import { CommonButton, CommonIcon } from "@/components/common";
import { Avatar, Box, Typography, useTheme } from "@mui/material";


const AssignmentSection = ({
  assignedUser,
  onReassign,
  disabled,
}: {
  assignedUser: { userName: string };
  onReassign: () => void;
  disabled?: boolean;
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        borderRadius: "14px",
        border: `1px solid ${theme.palette.divider}`,
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="body1" sx={{ mb: 2 }}>
        Assignment
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2.5,
          backgroundColor: "#F8FAFC",
          borderRadius: "12px",
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            backgroundColor: "#FEF3C6",
            color: "#D97706", // example color
          }}
        >
          {assignedUser.userName[0]}
        </Avatar>

        <Box>
          <Typography variant="body2">{assignedUser.userName}</Typography>
          <Typography variant="caption" sx={{ color: "text.primary" }}>
            Assignee
          </Typography>
        </Box>
      </Box>

      <CommonButton
        fullWidth
        variant="outlined"
        sx={{
          color: "text.primary",
          border: `1px solid ${theme.palette.divider}`,
        }}
        startIcon={<CommonIcon name="UserPlus" color={`${theme.palette.text.primary}`} />}
        onClick={onReassign}
        disabled={disabled}
      >
        <Typography variant="button">Reassign Task</Typography>
      </CommonButton>
    </Box>
  );
};

export default AssignmentSection;