import {
  Box,
  Typography,
  Button,
  Divider,
  Link,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { ROUTES } from "../../constants/routes";
import { AuthAppleIcon, AuthFacebookIcon, AuthGoogleIcon } from "@/assets";
import { CommonTextField } from "@/components/common";
import authService from "../../services/modules/auth.service";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "../../schemas/authSchema";
import { toast } from "@/utils/toast";

const Forgot = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await authService.forgotPassword(data.email);
      toast.success("OTP sent to your email");
      // Navigate to OTP page with email in state
      navigate(ROUTES.OTP, { state: { email: data.email } });
    } catch (err: any) {
      console.error("Forgot password failed:", err);
      // Check if error response has message
      const message =
        err.response?.data?.message || err.message || "Something went wrong";
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ width: "100%" }}>
        {/* HEADING */}
        <Typography variant="h1" textAlign="center" mb={1}>
          Forget Your Password?
        </Typography>

        <Typography
          variant="subtitle1"
          textAlign="center"
          color="text.secondary"
          mb={6}
        >
          Please input your email address
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {apiError}
          </Alert>
        )}

        {/* FORM */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <CommonTextField
                {...field}
                label="Email address"
                fullWidth
                sx={{ mb: 4 }}
                disabled={isLoading}
                error={!!errors.email}
                helperText={errors.email?.message}
                auth
              />
            )}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={isLoading}
            sx={{ py: 1.5, mb: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Submit"
            )}
          </Button>

          <Box>
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

export default Forgot;
