import {CommonIcon, ToggleSwitch } from "@/components/common";
import { Menu, MenuItem, Typography, useTheme } from "@mui/material";


interface Props {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;

  rule: {
    id: string;
    status: boolean;
    title: string;
    trigger?: string; // Optional for escalation
    channels: string[];
    assigned: string[];
    condition?: string; // Optional for notification
    action?: string; // Optional for notification
  };

  type: "notification" | "escalation";

  onToggleStatus: (id: string, type: "notification" | "escalation") => void;
  onEdit: (id: string, type: "notification" | "escalation") => void;
  onDelete: (id: string, type: "notification" | "escalation") => void;
}

export default function RuleActionsMenu({
  anchorEl,
  open,
  onClose,
  rule,
  type,
  onToggleStatus,
  onEdit,
  onDelete,
}: Props) {
  const theme = useTheme();

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      sx={{
        display: { xs: "block", sm: "none" },
        "& .MuiPaper-root": {
          borderRadius: "12px",
          minWidth: "150px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.12)",
        },
        "& .MuiList-root": {
          paddingTop: "4px",
          paddingBottom: "4px",
        },
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      {/* 1️ Toggle */}
      <MenuItem
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          paddingY: "6px",
          paddingX: "12px",
          minHeight: "36px",
        }}
      >
        <CommonIcon
          name={rule.status ? "CheckCircle" : "CircleSlash"}
          size={16}
          color={
            rule.status
              ? theme.palette.success.main
              : theme.palette.error.main
          }
        />

        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {rule.status ? "Active" : "Inactive"}
        </Typography>

        <ToggleSwitch
          checked={rule.status}
          onChange={() => {
            onToggleStatus(rule.id, type);
            onClose();
          }}
        />
      </MenuItem>

      {/* 2️ Edit */}
      <MenuItem
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          paddingY: "6px",
          paddingX: "12px",
          minHeight: "36px",
        }}
        onClick={() => {
          onEdit(rule.id, type);
          onClose();
        }}
      >
        <CommonIcon name="SquarePen" size={16} />
        <Typography variant="body2">Edit</Typography>
      </MenuItem>

      {/* 3️ Delete */}
      <MenuItem
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          paddingY: "6px",
          paddingX: "12px",
          minHeight: "36px",
          color: theme.palette.error.main,
        }}
        onClick={() => {
          onDelete(rule.id, type);
          onClose();
        }}
      >
        <CommonIcon
          name="Trash2"
          size={16}
          color={theme.palette.error.main}
        />
        <Typography variant="body2">Delete</Typography>
      </MenuItem>
    </Menu>
  );
}