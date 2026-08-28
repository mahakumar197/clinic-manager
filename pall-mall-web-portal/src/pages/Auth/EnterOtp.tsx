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
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { ROUTES } from "../../constants/routes";
import { AuthAppleIcon, AuthFacebookIcon, AuthGoogleIcon } from "@/assets";
import { CommonTextField } from "@/components/common";
import authService from "../../services/modules/auth.service";
import { toast } from "@/utils/toast";

const Otp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(59);
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  // 6 digits for OTP
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      // If no email provided (direct access), redirect to forgot password
      // navigate(ROUTES.FORGOT_PASSWORD); // Optional: create this route usage or just let them be
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Allow pasting
    if (value.length > 1) {
      const pastedData = value.split("").slice(0, 6 - index);
      pastedData.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email not found. Please try Forgot Password again.");
      return;
    }

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.verifyOtp({ email, otp: otpValue });
      console.log("OTP verification response:", res);
      const refreshToken = res?.token;

      if (!refreshToken) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      // store temporarily
      sessionStorage.setItem("reset_refresh_token", refreshToken);
      navigate(ROUTES.RESET_PASSWORD, { state: { email } });
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Invalid OTP";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending || resendCount >= 1) return;
    if (!email) return;

    setIsResending(true);
    try {
      await authService.forgotPassword(email);
      setCountdown(59);
      setError(null); // Clear error on resend
      setResendCount((prev) => prev + 1);
      toast.success("OTP resent successfully");
    } catch (err) {
      console.error("Resend failed", err);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ width: "100%" }}>
        <Typography variant="h1" textAlign="center" fontWeight={700} mb={1}>
          Enter OTP
        </Typography>

        <Typography
          variant="subtitle1"
          textAlign="center"
          color="text.secondary"
          mb={5}
        >
          {/* We’ve sent an OTP code to your email {email ? `(${email})` : ""} */}
          We’ve sent an OTP code to your email
        </Typography>

        <Box component="form" onSubmit={handleVerifyOtp}>
          <Box display="flex" justifyContent="center" gap={1.5} mb={2}>
            {otp.map((digit, i) => (
              <CommonTextField
                key={i}
                inputRef={(el) => (inputRefs.current[i] = el)}
                value={digit}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                inputProps={{
                  maxLength: 6, // Allow paste, handle in onChange
                  inputMode: "numeric",
                }}
                sx={{
                  width: "48px", // Adjust width for 6 digits to fit
                  "& .MuiOutlinedInput-root": {
                    height: "70px",
                    borderRadius: 1.5,
                    padding: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "1.25rem",
                    textAlign: "center",
                    padding: 0,
                    paddingLeft: "0 !important", // Force override just in case
                    lineHeight: "56px",
                    height: "56px",
                  },
                }}
              />
            ))}
          </Box>

          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            mb={3}
          >
            We will resend the code in{" "}
            <Box
              component="span"
              sx={{
                color:
                  countdown > 0
                    ? "warning.main"
                    : isResending || resendCount >= 1
                    ? "text.disabled"
                    : "primary.main",
                cursor:
                  countdown === 0 && !isResending && resendCount < 1
                    ? "pointer"
                    : "default",
              }}
              onClick={handleResend}
            >
              {countdown > 0
                ? `${countdown} s`
                : isResending
                ? "Sending..."
                : resendCount >= 1
                ? "Resend limit reached"
                : "Resend"}
            </Box>
          </Typography>

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

          <Box display="flex" justifyContent="center" gap={3} mb={2}>
            {[AuthGoogleIcon, AuthFacebookIcon, AuthAppleIcon].map(
              (icon, i) => (
                <Button
                  key={i}
                  variant="outlined"
                  startIcon={
                    <Box
                      component="img"
                      src={icon}
                      sx={{ width: 20, height: 20 }}
                    />
                  }
                  sx={{
                    flex: 1,
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

export default Otp;
