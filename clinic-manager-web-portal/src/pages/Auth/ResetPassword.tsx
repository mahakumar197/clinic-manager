import {
  Box,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  Link,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { ROUTES } from "../../constants/routes";
import {
  AuthAppleIcon,
  AuthFacebookIcon,
  AuthGoogleIcon,
} from "@/assets";
import { CommonIcon, CommonTextField } from "@/components/common";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "../../schemas/authSchema";
import authService from "../../services/modules/auth.service";
import { toast } from "@/utils/toast";

const Reset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshToken = sessionStorage.getItem("reset_refresh_token");
  // Retrieve email from state passed by EnterOtp
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      setError(
        "Missing email information. Please start the retrieval process again."
      );
      // Optional: Redirect to forgot password after a delay
    }
  }, [email]);

  useEffect(() => {
    if (!refreshToken) {
      toast.error("Session expired. Please verify OTP again.");
      navigate(ROUTES.FORGOT_PASSWORD);
    }
  }, [refreshToken, navigate]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!email) {
      setError("Missing email information. Please start over.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
     const res= await authService.resetPassword(email, data.password, refreshToken);
      navigate(ROUTES.LOGIN, {
        state: { message: "Password reset successfully. Please login." },
      });
      toast.success(res?.message);
    } catch (err: any) {
      console.error("Reset password failed:", err);
      const message =
        err.res?.data?.message ||
        err.message ||
        "Failed to reset password";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ width: "100%" }}>
        {/* HEADING */}
        <Typography variant="h1" textAlign="center" mb={4}>
          Reset Password?
        </Typography>
{/* 
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )} */}

        {/* FORM */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <CommonTextField
                {...field}
                label="New Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                autoComplete="new-password"
                sx={{ mb: 5 }}
                error={!!errors.password}
                helperText={errors.password?.message}
                auth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        <CommonIcon name={showPassword ? "Eye" : "EyeClosed"} size= {24}/>
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <CommonTextField
                {...field}
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                autoComplete="new-password"
                sx={{ mb: 5 }}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                auth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setshowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle password visibility"
                      >
                        <CommonIcon name={showConfirmPassword ? "Eye" : "EyeClosed"}  size= {24} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={isLoading || !email}
            sx={{ py: 1.5, mb: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Update Password"
            )}
          </Button>

          <Box sx={{ width: "100%" }}>
            <Typography
              variant="subtitle2"
              textAlign="center"
              color="text.secondary"
              mb={6}
            >
              Remembered Password?{" "}
              <Link
                underline="none"
                sx={{
                  color: isBelowMd ? "primary.light" : "primary.main",
                  "&:hover": { textDecoration: "underline" },
                  cursor: "pointer",
                }}
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Log in
              </Link>
            </Typography>
          </Box>
          <Divider sx={{ my: 3, color: "text.secondary", typography: "body1" }}>
            Or log in with
          </Divider>

          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            {[AuthGoogleIcon, AuthFacebookIcon, AuthAppleIcon].map(
              (icon, i) => (
                <Button
                  key={i}
                  fullWidth
                  variant="outlined"
                  startIcon={
                    <Box
                      component="img"
                      src={icon}
                      sx={{ width: 20, height: 20 }}
                    />
                  }
                  sx={{
                    textTransform: "none",
                    borderRadius: 1,
                    borderColor: "divider",
                  }}
                />
              )
            )}
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Reset;
