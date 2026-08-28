import { Box, IconButton, Paper, Typography, useTheme } from "@mui/material";
import { Controller } from "react-hook-form";
import { CommonTextField, CommonIcon, ToggleSwitch } from "@/components/common";
import { useEffect, useState } from "react";


const Step2PasswordSetup = ({ form }) => {
   const { trigger } = form;
  const theme = useTheme();
  const twoFAEnabled = form.watch("twoFactor");
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);

  useEffect(() => {
    if (confirmPassword) {
      form.trigger("confirmPassword");
    }
  }, [password, confirmPassword, form]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <CommonTextField
            {...field}
              type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            label="Password  *"
            placeholder="Enter password (min. 8 characters)"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            onChange={(e) => {
              field.onChange(e.target.value);
              
              trigger("password");
            }}
            endIcon={
                  <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        <CommonIcon name={showPassword ? "Eye" : "EyeClosed"} size= {24}/>
                      </IconButton>
                }
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={form.control}
        render={({ field, fieldState }) => (
          <CommonTextField
            {...field}
              type={showConfirmPassword ? "text" : "password"}
            label="Confirm Password  *"
            placeholder="Re-enter password"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            onChange={(e) => {
              field.onChange(e.target.value);
              
              trigger("confirmPassword");
            }}
            endIcon={
                  <IconButton
                        onClick={() => setshowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle password visibility"
                      >
                         <CommonIcon name={showConfirmPassword ? "Eye" : "EyeClosed"}  size= {24} />
                      </IconButton>
                }
          />
        )}
      />

      <Controller
        name="twoFactor"
        control={form.control}
        render={({ field }) => (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <CommonIcon
                name="Shield"
                size={20}
                color={theme.palette.primary.main}
              />

              <Box>
                <Typography variant="body2">
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Require 2FA for enhanced security
                </Typography>
              </Box>
            </Box>

            <ToggleSwitch
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          </Paper>
        )}
      />

      {twoFAEnabled && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: "8px",
            border: "1px solid #BEDBFF",
            backgroundColor: "#EFF6FF",
            p: 2,
          }}
        >
          <Typography variant="body2" color="#193CB8">
            The user will be prompted to set up 2FA on their first login if
            enabled.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Step2PasswordSetup;
