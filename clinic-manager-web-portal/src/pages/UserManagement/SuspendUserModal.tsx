import {
  CommonSelect,
  CommonTextField,
  CommonButton,
  CommonIcon,
  Modal,
} from "@/components/common";
import {
  Box,
  Divider,
  List,
  ListItem,
  Typography,
  useTheme,
  Avatar,
} from "@mui/material";
import { useState } from "react";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
import { SelectOption } from "@/types/select";
import { useSuspendUser } from "./hooks/useSuspendUser";
import { capitalize, getInitials } from "@/utils";

interface SuspendUserModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    userId?: string;
    initials: string;
    name: string;
    email: string;
    status: string;
  };
  onSuccess?: () => void;
}

const SuspendUserModal = ({
  open,
  onClose,
  user,
  onSuccess,
}: SuspendUserModalProps) => {
  const theme = useTheme();
  const { options: durationOptions, loading: durationLoading } = useDropdown(
    DropdownType.SUSPENSION_DURATION,
    false,
  );

  // Use suspend user hook
  const { suspendUser, suspending } = useSuspendUser();

  const [duration, setDuration] = useState<SelectOption | null>(null);
  const [reason, setReason] = useState("");

  const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    Active: {
      bg: "#E6F4EA",
      color: "#2E7D32",
    },
    active: {
      bg: "#E6F4EA",
      color: "#2E7D32",
    },
    Suspended: {
      bg: theme.palette.error.light,
      color: theme.palette.error.main,
    },
    suspended: {
      bg: theme.palette.error.light,
      color: theme.palette.error.main,
    },
    Disabled: {
      bg: "#F2F2F2",
      color: "#6E6E6E",
    },
    disabled: {
      bg: "#F2F2F2",
      color: "#6E6E6E",
    },
    Unknown: {
      bg: "#FFF4E5",
      color: "#B76E00",
    },
  };

  const statusStyle = STATUS_STYLES[user.status] ?? STATUS_STYLES["Unknown"];

  const handleSuspend = async () => {
    if (!duration || !reason.trim()) {
      return;
    }

    if (!user.userId) {
      return;
    }

    try {
      await suspendUser(user.userId, String(duration.value), reason.trim());

      onSuccess?.();
      onClose();

      // Reset form
      setDuration(null);
      setReason("");
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <Modal
      open={open}
      onClose={suspending ? undefined : onClose}
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
          <CommonIcon name="AlertTriangle" size={20} color="red" />
          Suspend User Account
        </Box>
      }
    >
      {/* Subtitle */}
      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        Temporarily or permanently restrict access for this user
      </Typography>

      {/* User Info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderRadius: "12px",
          bgcolor: "#F8FAFC",
          mb: 2,
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: "#FFFBEB",
            color: "primary.main",
            display: { xs: "none", sm: "flex" },
            fontWeight: 400,
            fontSize: 16,
            mr: 2,
          }}
        >
          {getInitials(user.name)}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Typography
              sx={{
                fontSize: theme.typography.body1,
                fontWeight: theme.typography.body1,
              }}
            >
              {user.name}
            </Typography>

            {/* ICON badge  */}
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                color: statusStyle.color,
                width: 28,
                height: 28,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CommonIcon
                name={
                  user.status === "Active" || user.status === "active"
                    ? "CircleCheckBig"
                    : user.status === "Suspended" || user.status === "suspended"
                      ? "CircleSlash"
                      : user.status === "Disabled" || user.status === "disabled"
                        ? "Ban"
                        : "OctagonAlert"
                }
                size={18}
              />
            </Box>
          </Box>

          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            {user.email}
          </Typography>
        </Box>

        {/* badge  on SM and above  */}
        <Box
          sx={{
            ml: "auto",
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              bgcolor: statusStyle.bg,
              color: statusStyle.color,
              borderRadius: "8px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {capitalize(user.status)}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <CommonSelect
        label="Suspension Duration"
        name="duration"
        value={duration}
        onChange={(value: SelectOption) => setDuration(value)}
        options={durationOptions}
        disabled={durationLoading || suspending}
        required
      />

      {/* Reason for Suspension */}
      <Box sx={{ mt: 3 }}>
        <CommonTextField
          fullWidth
          autoHeight
          multiline
          rows={4}
          label="Reason for Suspension"
          placeholder="Explain why this user is being suspended..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={suspending}
          required
        />
      </Box>

      <Typography
        sx={{
          color: "text.secondary",
          fontSize: 13,
          mt: 1,
          mb: 2,
        }}
      >
        This reason will be logged and visible to administrators
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          p: 2.5,
          borderRadius: "12px",
          bgcolor: "#FDECEA",
          border: "1px solid #F5C2C7",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <CommonIcon name="AlertTriangle" color="red" size={20} />
          <Typography variant="button" color="error.main">
            Warning
          </Typography>
        </Box>

        <List
          sx={{
            color: "error.dark",
            fontSize: 15,
            lineHeight: 1.4,
            ml: 5,
            py: 0,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {[
            "User will be immediately logged out",
            "All active sessions will be terminated",
            "Access to all portal features will be restricted",
            "This action will be logged in the audit trail",
          ].map((text, index) => (
            <ListItem
              key={index}
              disableGutters
              sx={{
                padding: 0,
                display: "list-item",
              }}
            >
              <Typography variant="body2" color="error.dark">
                {text}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* ACTION BUTTONS */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 3,
          gap: 1,
        }}
      >
        <CommonButton
          variant="outlined"
          onClick={onClose}
          disabled={suspending}
        >
          Cancel
        </CommonButton>

        <CommonButton
          variant="contained"
          color="error"
          startIcon={<CommonIcon name="CircleX" />}
          onClick={handleSuspend}
          loading={suspending}
          disabled={!duration || !reason.trim()}
        >
          Suspend User
        </CommonButton>
      </Box>
    </Modal>
  );
};

export default SuspendUserModal;
