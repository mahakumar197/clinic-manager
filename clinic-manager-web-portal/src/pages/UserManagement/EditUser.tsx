import {
  CommonSelect,
  CommonTextField,
  CommonTextArea,
  ToggleSwitch,
  CommonButton,
  CommonIcon,
  CommonPageHeader,
  CommonPhoneInput,
} from "@/components/common";
import PageContainer from "@/components/layouts/PageContainer";
import { ROUTES } from "@/constants/routes.ts";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SuspendUserModal from "./SuspendUserModal.tsx";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import { useUserDetails } from "./hooks/useUserDetails";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType, UpdateUserPayload } from "@/services";
import { useUpdateUser } from "./hooks/useUpdateUser";
import {
  capitalize,
  formatPhoneNumberWithCountryCode,
  convertToCamelCase,
} from "@/utils/helpers.ts";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditUserSchema } from "./CreateUser/Schemas.ts";
import { z } from "zod";
import { TWO_FA_COLORS } from "@/components/common/commonTable/constants.ts";

type EditUserFormValues = z.infer<typeof EditUserSchema>;

const Card = ({ children, sx = {} }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        borderRadius: "14px",
        border: `1px solid ${theme.palette.divider}`,
        p: 3,
        width: "100%",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

const EditUser = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { userId } = useParams<{ userId: string }>();

  // Fetch user details
  const { user, loading } = useUserDetails(userId);

  // Fetch dropdown options
  const { options: departmentOptions } = useDropdown(
    DropdownType.USER_DEPARTMENT,
    false,
  );
  const { options: roleOptions } = useDropdown(DropdownType.USER_ROLE, false);

  // Update user hook
  const { updateUser, updating } = useUpdateUser();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [openSuspendModal, setOpenSuspendModal] = useState(false);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(EditUserSchema),
    mode: "onChange", // Changed from onBlur to onChange for instant validation
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      phoneCountryCode: "",
      department: null,
      role: null,
      additionalNotes: "",
      twoFaEnabled: false,
    },
  });

  // Helper function to find matching option
  const findMatchingOption = (options: any[], value: string) => {
    return options.find((opt) => opt.value.toString() === value) || null;
  };

  // Populate form when user data is loaded
  useEffect(() => {
    if (user) {
      // Split userName into firstName and lastName
      const nameParts = user.userName?.split(" ");

      form.reset({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        phoneCountryCode: "",
        additionalNotes: user.additionalNotes || "",
        twoFaEnabled: user.twoFaEnabled || false,
        department:
          departmentOptions.length > 0
            ? findMatchingOption(departmentOptions, user.departmentId)
            : null,
        role:
          roleOptions.length > 0
            ? findMatchingOption(roleOptions, user.roleId)
            : null,
      });
    }
  }, [user, departmentOptions, roleOptions]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const twoFaKey =
    user?.twoFaEnabled === true
      ? "ENABLED"
      : user?.twoFaEnabled === false
        ? "DISABLED"
        : undefined;

  const twoFaStyle = twoFaKey ? TWO_FA_COLORS[twoFaKey] : undefined;


  const handleSave = form.handleSubmit(async (data) => {
    try {
      // Format phone number: country code + space + number (e.g., "+44 7986588525")
      const formattedPhoneNumber = formatPhoneNumberWithCountryCode(
        data.phoneNumber,
        data.phoneCountryCode,
      );

      const payload: UpdateUserPayload = {
        userId: userId!,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: formattedPhoneNumber,
        role: data.role?.value?.toString() || "",
        department: data.department?.value?.toString() || "",
        twoFaEnabled: data.twoFaEnabled || false,
        additionalNotes: data.additionalNotes || "",
      };

      await updateUser(payload);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  });

  return (
    <PageContainer>
      <Grid container justifyContent="space-between">
        <Grid size={{ xs: 12, md: 8 }}>
          <CommonPageHeader
            enableBack
            title="Edit User"
            subtitle="Update user information and permissions"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ mt: { xs: 2, md: 0 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              justifyContent: "flex-end",
            }}
          >
            <CommonButton
              variant="outlined"
              sx={{
                color: "text.primary",
                border: `1px solid ${theme.palette.divider}`,
              }}
              onClick={() => navigate(ROUTES.USERS)}
              disabled={loading}
            >
              Cancel
            </CommonButton>

            {!isEditMode ? (
              <CommonButton
                variant="contained"
                startIcon={<CommonIcon name="Pencil" />}
                disabled={loading}
                onClick={handleEdit}
              >
                Edit
              </CommonButton>
            ) : (
              <CommonButton
                variant="contained"
                startIcon={<CommonIcon name="Save" />}
                disabled={loading || updating}
                onClick={handleSave}
              >
                {updating ? "Saving..." : "Save Changes"}
              </CommonButton>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* ===== CONTENT ===== */}
      {loading ? (
        <CommonSkeleton type="editUserPage" />
      ) : (
        <>
          <Grid
            container
            spacing={2}
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            {/* LEFT COLUMN */}
            <Grid
              size={{ xs: 12, md: 8, lg: 8, xl: 8 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
              }}
            >
              {/* Basic Information */}
              <Card>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Basic Information
                </Typography>

                <Box
                  component="form"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <Controller
                    name="firstName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <CommonTextField
                        {...field}
                        label="First Name *"
                        disabled={!isEditMode}
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="lastName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <CommonTextField
                        {...field}
                        label="Last Name *"
                        disabled={!isEditMode}
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <CommonTextField
                        {...field}
                        label="Email Address *"
                        disabled={!isEditMode}
                        fullWidth
                        onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="phoneNumber"
                    control={form.control}
                    render={({
                      field: phoneField,
                      fieldState: phoneFieldState,
                    }) => (
                      <Controller
                        name="phoneCountryCode"
                        control={form.control}
                        render={({ field: countryField }) => (
                          <CommonPhoneInput
                            value={phoneField.value || ""}
                            onChange={(value, info) => {
                              phoneField.onChange(value);
                              if (info?.countryCallingCode) {
                                countryField.onChange(
                                  `+${info.countryCallingCode}`,
                                );
                              }
                            }}
                            label="Phone Number"
                            defaultCountry="GB"
                            disabled={!isEditMode}
                            error={!!phoneFieldState.error}
                            helperText={phoneFieldState.error?.message}
                          />
                        )}
                      />
                    )}
                  />

                  <Controller
                    name="department"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <CommonSelect
                        label="Department *"
                        value={field.value}
                        onChange={field.onChange}
                        options={departmentOptions}
                        disabled={!isEditMode}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    name="role"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <CommonSelect
                        label="Role *"
                        value={field.value}
                        onChange={field.onChange}
                        options={roleOptions}
                        disabled={!isEditMode}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Box>
              </Card>

              {/* Security Settings */}
              <Card>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Security Settings
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2.5,
                    backgroundColor: "#F8FAFC",
                    borderRadius: "12px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CommonIcon
                      name="Shield"
                      size={20}
                      color={theme.palette.primary.main}
                    />
                    <Box>
                      <Typography variant="body2">
                        Two-Factor Authentication
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Require 2FA for enhanced security
                      </Typography>
                    </Box>
                  </Box>

                  <Controller
                    name="twoFaEnabled"
                    control={form.control}
                    render={({ field }) => (
                      <ToggleSwitch
                        disabled={!isEditMode}
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <CommonButton
                  variant="outlined"
                  startIcon={<CommonIcon name="Lock" />}
                  disabled
                >
                  Send Password Reset Link
                </CommonButton>

                <Typography
                  variant="caption"
                  sx={{ mt: 1.5, display: "block", color: "text.secondary" }}
                >
                  User will receive an email with instructions to reset their
                  password
                </Typography>
              </Card>

              {/* Additional Notes */}
              <Card>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Additional Notes
                </Typography>

                <Typography variant="button" sx={{ mb: 1 }}>
                  Internal Notes
                </Typography>

                <Box>
                  <Controller
                    name="additionalNotes"
                    control={form.control}
                    render={({ field }) => (
                      <CommonTextArea
                        {...field}
                        minRows={6}
                        placeholder="Add any internal notes about this user..."
                        disabled={!isEditMode}
                      />
                    )}
                  />
                </Box>

                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  These notes are only visible to administrators
                </Typography>
              </Card>
            </Grid>

            {/* RIGHT COLUMN */}
            <Grid
              size={{ xs: 12, md: 4, lg: 4, xl: 4 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
              }}
            >
              {/* User Preview */}
              <Card>
                <Typography variant="body1" mb={3}>
                  User Preview
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    mb: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      fontSize: 20,
                      backgroundColor: "#FFFBEB",
                      color: "warning.light",
                      mb: 2,
                    }}
                  >
                    {user?.userName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Avatar>

                  <Typography variant="body1">
                    {user?.userName || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {user?.email || "N/A"}
                  </Typography>

                  <Chip
                    label={
                      user?.roleLabel
                        ? convertToCamelCase(user?.roleLabel)
                        : "N/A"
                    }
                    size="small"
                    sx={{
                      backgroundColor: "#FFFBEB",
                      color: "#BB4D00",
                      fontWeight: theme.typography.button.fontWeight,
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Phone
                    </Typography>
                    <Typography variant="body2">
                      {user?.phoneNumber || "N/A"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Department
                    </Typography>
                    <Typography variant="body2">
                      {user?.deptLabel
                        ? convertToCamelCase(user?.deptLabel)
                        : "N/A"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      2FA Status
                    </Typography>
                    <Chip
                      label={
                        user?.twoFaEnabled === true
                          ? "Enabled"
                          : user?.twoFaEnabled === false
                            ? "Disabled"
                            : "Unknown"
                      }
                      size="small"
                      sx={{
                        backgroundColor: twoFaStyle?.bg,
                        color: twoFaStyle?.color,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Status
                    </Typography>
                    <Chip
                      label={capitalize(user?.status) || "Unknown"}
                      size="small"
                      sx={{
                        backgroundColor:
                          user?.status === "active" ? "#DCFCE7" : "#FEE2E2",
                        color:
                          user?.status === "active" ? "#008236" : "#DC2626",
                      }}
                    />
                  </Box>
                </Box>
              </Card>

              {/* Activity Summary */}
              <Card>
                <Typography variant="body1" mb={3}>
                  Activity Summary
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Last Login
                    </Typography>
                    <Typography variant="body2">
                      {user?.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Not yet logged in"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Join Date
                    </Typography>
                    <Typography variant="body2">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      User ID
                    </Typography>
                    <Typography variant="body2">
                      #{user?.userId?.slice(0, 8) || "N/A"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box
                  sx={{
                    backgroundColor: "#FFFBEB",
                    border: `1px solid #BEDBFF`,
                    padding: "12px 16px",
                    borderRadius: "10px",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "info.dark" }}>
                    This user has been active for {user?.usersActiveDays || 0}{" "}
                    days
                  </Typography>
                </Box>
              </Card>

              {/* Danger Zone */}
              <Card
                sx={{
                  backgroundColor: "#FEF2F2",
                  border: `1px solid ${theme.palette.error.light}`,
                }}
              >
                <Typography variant="body1" sx={{ mb: 2, color: "error.dark" }}>
                  Danger Zone
                </Typography>

                <Typography variant="body2" sx={{ mb: 3, color: "error.main" }}>
                  Irreversible actions that require careful consideration
                </Typography>

                <CommonButton
                  variant="outlined"
                  color="error"
                  startIcon={
                    <CommonIcon
                      name="Lock"
                      color={
                        user?.status === "suspended"
                          ? theme.palette.secondary.contrastText
                          : theme.palette.error.main
                      }
                    />
                  }
                  sx={{
                    borderRadius: "12px",
                    backgroundColor: "#FFFFFF",
                    textTransform: "none",
                    border: `1px solid ${theme.palette.error.main}`,
                    px: 3,
                    py: 1,
                  }}
                  onClick={() => setOpenSuspendModal(true)}
                  disabled={user?.status === "suspended"}
                >
                  Suspend User Account
                </CommonButton>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      <SuspendUserModal
        open={openSuspendModal}
        onClose={() => setOpenSuspendModal(false)}
        onSuccess={() => navigate(-1)}
        user={{
          userId: user?.userId,
          initials:
            user?.userName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "U",
          name: user?.userName || "N/A",
          email: user?.email || "N/A",
          status: user?.status || "Unknown",
        }}
      />
    </PageContainer>
  );
};

export default EditUser;
