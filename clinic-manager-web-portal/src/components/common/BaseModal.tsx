// BaseModal.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  useTheme,
  Divider,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CommonButton from "./CommonButton";

interface BaseModalProps {
  open: boolean;
  onClose: () => void;

  title: string;
  subtitle?: string;

  children: React.ReactNode;

  onBack?: () => void;
  onNext?: () => void;

  backLabel?: string;
  nextLabel?: string;

  disableBack?: boolean;
  disableNext?: boolean;
  headerContent?: React.ReactNode;
  loading?: boolean;
}

const BaseModal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Next",
  disableBack = false,
  disableNext = false,
  headerContent,
  loading = false,
}: BaseModalProps) => {
  const theme = useTheme();
  const isbelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      PaperProps={{
        sx: {
          width: 512,
          borderRadius: "16px",
          overflow: "hidden",
          padding: "20px 24px",
          maxHeight: isbelowMd ? "650px" : "775px",
        },
      }}
    >
      {/* Header */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <DialogTitle
              sx={{
                padding: 0,
                fontSize: "18px",
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {title}
            </DialogTitle>

            {subtitle && (
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: "13px",
                  color: "text.secondary",
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {/* stepper goes here */}
        {headerContent && <Box sx={{ mt: 2 }}>{headerContent}</Box>}
      </Box>

      {/* Body */}
      <DialogContent
        sx={{
          px: 1,
          py: 0,
          maxHeight: "70vh",
          overflowY: "auto",
          mb: 2,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          // '&::-webkit-scrollbar-thumb': {
          //   backgroundColor: 'rgba(0,0,0,0.12)',
          //   borderRadius: '2px',
          // },
        }}
      >
        {children}
      </DialogContent>

      {/* Footer */}
      <Divider />
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 1,
           px: 0,
        }}
      >
        <CommonButton
          variant="outlined"
          onClick={onBack}
          disabled={disableBack}
        >
          {backLabel}
        </CommonButton>

        <CommonButton
          variant="contained"
          onClick={() => {
            console.log("BASE MODAL BUTTON CLICKED");
            onNext?.();
          }}
          disabled={disableNext}
          loading={loading}
        >
          {nextLabel}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
};

export default BaseModal;
