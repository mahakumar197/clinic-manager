import { IconButton, Tooltip, SxProps } from "@mui/material";
import React from "react";

interface CommonIconButtonProps {
  icon: React.ReactNode;
  onClick?: any;
  tooltip?: string;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  sx?: SxProps;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "success"
    | "info"
    | "warning"
    | "inherit";
  primary?: boolean;
  fullWidth?: boolean;
}

const CommonIconButton = ({
  icon,
  onClick,
  tooltip,
  disabled = false,
  size = "medium",
  sx,
  color = "default",
  primary = false,
  fullWidth = false,
}: CommonIconButtonProps) => {
  const button = (
    <IconButton
      onClick={onClick}
      disabled={disabled}
      size={size}
      color={color}
      sx={{
        transition: "0.2s",
        ...(primary && {
          height: "40px",
          border: "1px solid",
          borderColor: "primary.main",
          borderRadius: "8px",
        }),
        ...(fullWidth && { width: "100%" }),
        ...sx,
      }}
    >
      {icon}
    </IconButton>
  );

  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
};

export default CommonIconButton;
