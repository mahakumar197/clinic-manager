import {
  Box,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  Link,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { ROUTES } from "../../constants/routes";
import { ENDPOINTS } from "../../services/api/endpoints";
import {
  AuthAppleIcon,
  AuthFacebookIcon,
  AuthGoogleIcon,
} from "@/assets";
import { CommonCheckbox, CommonIcon, CommonTextField } from "@/components/common";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../../schemas/authSchema";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { login } from "../../features/auth/authSlice";
import { toast } from "@/utils/toast";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading: loading, error: authError } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();

  // Combine local form error with auth slice error
  const displayError = authError;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
      device:"website"
    },
  });

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Dispatch login action
      await dispatch(
        login({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
          device: data.device
        })
      ).unwrap();
      navigate(ROUTES.MESSAGES);
      toast.success("Login successful");
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error(displayError || "Invalid credentials");
      // Error is handled by the slice and accessible via authError
      // We can also set a local fallback if needed, but slice handles it.
    }
  };

  return (
    <AuthLayout showBackButton={false}>
      <Box sx={{ width: "100%" }}>
        {/* HEADING */}
        <Typography variant="h1" textAlign="center" mb={1}>
          Welcome back
        </Typography>

        <Typography
          variant="subtitle1"
          textAlign="center"
          color="text.secondary"
          mb={6}
        >
          Good to see you again
          {/* <Link
            underline="none"
            sx={{
              color: isBelowMd ? "primary.light" : "primary.main",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => navigate(ROUTES.REGISTER)}
          >
            Sign up
          </Link> */}
        </Typography>

        {/* {displayError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {displayError}
          </Alert>
        )} */}

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
                auth
                disabled={loading}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputLabelProps={{shrink:true}}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <CommonTextField
                {...field}
                auth
                sx={{ mb: 4 }}
                label="Your password"
                type={showPassword ? "text" : "password"}
                fullWidth
                autoComplete="current-password"
                disabled={loading}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputLabelProps={{shrink:true}}
                endIcon={
                  <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                        disabled={loading}
                      >
                         <CommonIcon name={showPassword ? "Eye" : "EyeClosed"} size= {24}/>
                      </IconButton>
                }
              />
            )}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Log in"}
          </Button>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
              alignItems: "center",
            }}
          >
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                 <CommonCheckbox
                  label="Remember me"
                  checked={field.value}
                  disabled={loading}
                  onChange={(_, checked) => field.onChange(checked)}
                />
              )}
            />

            <Typography
              variant="subtitle2"
              sx={{ color: "primary.main", cursor: "pointer" }}
            >
              <Link
                underline="none"
                sx={{
                  color: isBelowMd ? "primary.main" : "",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
              >
                Forgot password?
              </Link>
            </Typography>
          </Box>

          <Divider sx={{ my: 3, color: "text.secondary", typography: "body2" }}>
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
                  onClick={() => {
                    if (icon === AuthGoogleIcon) {
                      window.location.href = ENDPOINTS.AUTH.GOOGLE_LOGIN; // Or use full URL if endpoints not imported yet
                    }
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

export default Login;
