import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";
import { ReactNode } from "react";
import CommonIcon from "./CommonIcon";
import CommonIconButton from "./CommonIconButton";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  titleIcon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  width?: string;
}

/**
 * Custom Modal component wrapper around MUI Dialog
 * Provides consistent modal styling with title, optional icon, and close button
 */
const Modal = ({
  open,
  onClose,
  title,
  titleIcon,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  width,
}: ModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={{
        "& .MuiPaper-root": {
          width: width,
        },
      }}
    >
      {title ? (
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {titleIcon && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {titleIcon}
                </Box>
              )}
              <Typography variant="h6" component="div">
                {title}
              </Typography>
            </Box>
            <CommonIconButton
              aria-label="close"
              onClick={onClose}
              sx={{ padding: 0 }}
              icon={<CommonIcon name="X" />}
            />
          </Box>
        </DialogTitle>
      ) : (
        <DialogTitle sx={{ display: "flex", justifyContent: "end" }}>
          <CommonIconButton
            aria-label="close"
            onClick={onClose}
            sx={{ padding: 0 }}
            icon={<CommonIcon name="X" />}
          />
        </DialogTitle>
      )}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions sx={{ padding: "0px 24px 16px 24px" }}>{actions}</DialogActions>}
    </Dialog>
  );
};

export default Modal;
