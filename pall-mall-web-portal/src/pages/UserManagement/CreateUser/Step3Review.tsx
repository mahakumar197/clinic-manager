// Step3Review.tsx
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { ROLE_PERMISSIONS } from "./RolePermissions";
import { ToggleSwitch, CommonIcon, CommonTextField, CommonTextArea } from "@/components/common";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";

const Step3Review = ({ form }) => {
  const values = form.getValues();
  const theme = useTheme();

  // Fetch dropdown options
  const { options: roleOptions } = useDropdown(DropdownType.USER_ROLE, false);
  const { options: departmentOptions } = useDropdown(
    DropdownType.USER_DEPARTMENT,
    false
  );

  const initials = `${values.firstName?.[0] ?? ""}${
    values.lastName?.[0] ?? ""
  }`.toUpperCase();

  const findOption = (options: any[] = [], value?: string | number | null) => {
    if (!value) return null;
    return options.find((o) => String(o.value) === String(value)) ?? null;
  };

  // Extract value from role and department objects
  const roleValue = values.role?.value || values.role || "";
  const departmentValue = values.department?.value || values.department || "";

  // Find the matching option to get the label
  const roleOption = findOption(roleOptions, roleValue);
  const departmentOption = findOption(departmentOptions, departmentValue);

  const role = roleOption?.label || roleValue || "";
  console.log(role,'rolettttt');
  const department = departmentOption?.label || departmentValue || "";

  // Permissions based on selected Role (use roleValue for lookup, not label)
  const permissions = ROLE_PERMISSIONS[roleValue] || [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="button" color={theme.palette.text.primary}>User Summary</Typography>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#F8FAFC",
          p: 2.5,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "primary.light",
              color: "primary.main",
              fontWeight: 600,
              fontSize: "18px",
            }}
          >
            {initials}
          </Avatar>

          <Box>
            <Typography variant="body1">
              {values.firstName} {values.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {values.email}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Role:
          </Typography>

          <Chip
            label={role}
            size="small"
            sx={{
              bgcolor: "#DBEAFE",
              color: "#1447E6",
              height: 26,
              fontSize: 12,
              borderRadius: "8px",
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Two-Factor Auth:
          </Typography>

          {values.twoFactor ? (
            <Chip
              icon={<CommonIcon name="Shield" size={12} color="#1447E6" />}
              label="Enabled"
              size="small"
              sx={{
                bgcolor: "#DBEAFE",
                color: "#1447E6",
                height: 26,
                fontSize: 12,
                borderRadius: "8px",
              }}
            />
          ) : (
            <Chip
              icon={
                <CommonIcon
                  name="ShieldOff"
                  size={12}
                  color={theme.palette.text.secondary}
                />
              }
              label="Disabled"
              size="small"
              sx={{
                bgcolor: "#E6E6E6",
                color: "text.secondary",
                borderRadius: "6px",
                height: 24,
              }}
            />
          )}
        </Box>

        {/* Permissions */}
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" width="200px">
            Permissions:
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "end",
              gap: 1,
            }}
          >
            {permissions.map((perm) => (
              <Chip
                key={perm}
                label={perm}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "transparent",
                  color: "text.primary",
                  fontSize: 12,
                  borderRadius: "8px",
                }}
              />
            ))}
          </Box>
        </Box> */}
      </Paper>

      {/* Additional Notes */}
      <Controller
        name="additionalNotes"
        control={form.control}
        render={({ field, fieldState }) => (
          // <CommonTextField
          //   {...field}
          //   fullWidth
          //   autoHeight
          //   multiline
          //   rows={3}
          //   label="Additional Notes"
          //   placeholder="Add any additional information about this user..."
          //   value={field.value || ""}
          //   error={!!fieldState.error}
          //   helperText={fieldState.error?.message}
          // />
          <CommonTextArea 
          {...field}
          placeholder="Add any additional information about this user..."
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          minRows={4}
          // maxRows={6}
          />
        )}
      />

      <Divider />

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
        <Box sx={{ lineHeight: 1 }}>
          <Typography variant="body2">Send Welcome Email</Typography>
          <Typography variant="caption" color="text.secondary">
            Email login credentials to the user
          </Typography>
        </Box>

        <Controller
          name="sendWelcomeEmail"
          control={form.control}
          render={({ field }) => (
            <ToggleSwitch
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
      </Paper>
      <Box
        sx={{
          bgcolor: "#F0FDF4",
          border: "1px solid #B9F8CF",
          color: "#2E7D32",
          p: 2,
          borderRadius: "8px",
          fontSize: 13,
        }}
      >
        <Typography variant="body2" color="#016630">
          User will be created with "Active" status and can log in immediately.
        </Typography>
      </Box>
    </Box>
  );
};

export default Step3Review;
