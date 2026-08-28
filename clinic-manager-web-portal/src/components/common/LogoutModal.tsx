import { useAppDispatch } from "@/app/store";
import CommonButton from "@/components/common/CommonButton";
import CommonIcon from "@/components/common/CommonIcon";
import Modal from "@/components/common/Modal";
import { ROUTES } from "@/constants";
import { logout } from "@/features/auth/authSlice";
import { Box, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
}

const LogoutModal = ({ open, onClose }: LogoutModalProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const handleNavigation = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error("Logout failed:", error);
      navigate(ROUTES.LOGIN);
    }
    return;
    // navigate(item.path);
  };
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "24px",
          margin: "0 auto",
        }}
      >
        <Typography
          variant="h3"
          fontWeight={600}
          color={theme.palette.text.primary}
        >
          Log Out
        </Typography>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            // border: "2px solid #E7000B",
            border: `2px solid ${theme.palette.error.main}`,
            bgcolor: "#FEFBF1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CommonIcon name="LogOut" size={46} color="#E7000B" />
        </Box>

        <Typography variant="body1" color={theme.palette.text.secondary}>
          Are you sure want to log out?
        </Typography>

        <Box sx={{ width: "100%", mt: 1 }}>
          <CommonButton
            fullWidth
            isBaseHeight
            variant="contained"
            color="error"
            onClick={() => {
              handleNavigation();
              onClose();
            }}
          >
            Log Out
          </CommonButton>

          {/* CANCEL BUTTON */}
          <CommonButton
            fullWidth
            isBaseHeight
            variant="outlined"
            sx={{
              mt: 2,
            }}
            onClick={onClose}
          >
            Cancel
          </CommonButton>
        </Box>
      </Box>
    </Modal>
  );
}
export default LogoutModal;
