import {
  AuthAppleIcon,
  AuthEyeClosedIcon,
  AuthEyeIcon,
  AuthFacebookIcon,
  AuthGoogleIcon,
} from "@/assets";
import { CommonPhoneInput, CommonTextField } from "@/components/common";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import AuthLayout from "./AuthLayout";


const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(ROUTES.MESSAGES);
  };

  const theme = useTheme();

  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const PasswordIcon = showPassword ? AuthEyeIcon : AuthEyeClosedIcon;
  return (
    <AuthLayout>
      <Box sx={{ width: "100%" }}>
        {/* HEADING (centered like login page) */}
        {/* <Typography variant="h1" textAlign="center" fontWeight={700} mb={1}>
          Hey there
        </Typography> */}
        <Typography variant="h1" textAlign="center" mb={1}>
          Hey there
        </Typography>

        <Typography
          variant="h4"
          textAlign="center"
          color="text.secondary"
          fontWeight={400}
          mb={isBelowMd ? 3 : 6}
        >
          Already have an account?{" "}
          <Link
            underline="none"
            sx={{ color: isBelowMd ? "primary.light" : "primary.main" }}
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Log in
          </Link>
        </Typography>

        {/* FORM */}
        <Box component="form" onSubmit={handleRegister}>
          <CommonTextField
            auth
            label="Full name"
            fullWidth
            sx={{ mb: isBelowMd ? 3 : 4 }}
          />

          <CommonTextField
            auth
            label="Email address"
            type="email"
            fullWidth
            sx={{ mb: isBelowMd ? 3 : 4 }}
          />

          {/* <CommonTextField
            label="Phone Number"
            fullWidth
            sx={{ mb: isBelowMd ? 3 : 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ mr: 1 }}>🇺🇸 +1</Box>
                </InputAdornment>
              ),
            }}
          />  */}

          <CommonPhoneInput
            value={phone}
            onChange={(value, info) => {
              setPhone(value);
              console.log("Valid?", info?.isValid);
            }}
            sx={{ mb: isBelowMd ? 3 : 4 }}
          />

          <CommonTextField
            auth
            label="Birth Date"
            type="date"
            fullWidth
            sx={{ mb: isBelowMd ? 3 : 4 }}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <CommonTextField
            auth
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            sx={{ mb: isBelowMd ? 1.5 : 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <Box component="img" src={PasswordIcon} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            sx={{ mb: isBelowMd ? 2 : 4 }}
            control={<Checkbox />}
            label="Remember me"
          />

          {/* REGISTER BUTTON */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            sx={{ py: 1.5, mb: isBelowMd ? 1 : 3 }}
          >
            Sign Up
          </Button>

          {/* SOCIAL OPTIONS */}
          <Divider sx={{ my: 3, color: "text.secondary", typography: "body1" }}>
            Or sign up with
          </Divider>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Box component="img" src={AuthGoogleIcon} />}
              sx={{
                textTransform: "none",
                borderRadius: 1,
                borderColor: "#E5E5E5",
              }}
            />

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Box component="img" src={AuthFacebookIcon} />}
              sx={{
                textTransform: "none",
                borderRadius: 1,
                borderColor: "#E5E5E5",
              }}
            />

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Box component="img" src={AuthAppleIcon} />}
              sx={{
                textTransform: "none",
                borderRadius: 1,
                borderColor: "#E5E5E5",
              }}
            />
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Register;
