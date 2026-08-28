import { ToggleSwitch } from "@/components/common";
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Skeleton,
} from "@mui/material";
import { useRolePermissions } from "./hooks/useRolePermissions";
import { useState } from "react";
import { capitalize } from "@/utils";
import { toast } from "@/utils/toast";

const RolePermissionTable = () => {
  const theme = useTheme();
  const { permissions, loading, updatePermission, updating } = useRolePermissions();
  const [togglingCell, setTogglingCell] = useState<string | null>(null);

  const handleToggle = async (roleKey: string, moduleKey: string, currentValue: boolean) => {
    const cellKey = `${roleKey}-${moduleKey}`;
    setTogglingCell(cellKey);

    try {
      await updatePermission({
        role: roleKey,
        module: moduleKey,
        enabled: !currentValue,
      });
    } catch (error) {
      console.error("Failed to update permission", error);
    } finally {
      setTogglingCell(null);
    }
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              borderRadius: "14px",
              border: "1px solid #E5E7EB",
              width: "100%",
              p: 3,
            }}
          >
            <Skeleton variant="text" width={250} height={30} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={400} />
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (!permissions) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              borderRadius: "14px",
              border: "1px solid #E5E7EB",
              width: "100%",
              p: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Failed to load permissions
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            borderRadius: "14px",
            border: "1px solid #E5E7EB",
            width: "100%",
            p: 3,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              maxWidth: "fit-content",
              px: 1,
              mb: 1,
            }}
          >
            <Typography variant="body1" color="text.primary">
              Role-Based Permission Grid
            </Typography>
          </Box>

          {/* Table */}
          <Box sx={{ mt: 2 }}>
            <TableContainer
              sx={{
                boxShadow: "none",
                border: "none",
                bgcolor: "transparent",
              }}
            >
              <Table
                sx={{
                  "& .MuiTableCell-root": {
                    borderBottom: "1px solid #E5E7EB",
                  },
                  "& .MuiTableHead .MuiTableCell-root": {
                    borderBottom: "2px solid #E5E7EB",
                    fontWeight: 700,
                    bgcolor: "#F9FAFB",
                  },
                }}
              >
                <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                  <TableRow>
                    <TableCell>Module</TableCell>
                    {permissions.roles.map((role) => (
                      <TableCell key={role.key}>{capitalize(role.label)}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {permissions.modules
                    .filter((module) => module.label !== "Patient Tracker") // Hide Patient Tracker
                    .map((module) => {
                    // Convert module label to snake_case key for permissions lookup
                    const modulePermissionKey = module.label
                      .toLowerCase()
                      .replace(/\s+/g, "_");

                    return (
                      <TableRow key={module.key}>
                        <TableCell>{module.label}</TableCell>
                        {permissions.roles.map((role) => {
                          const isEnabled =
                            permissions.permissions[role.key]?.[modulePermissionKey] ?? false;
                          const cellKey = `${role.key}-${module.key}`;
                          const isToggling = togglingCell === cellKey;
                        
                          //Disable usermanagement for all users
                          const isUserManagement = module.key === "125";

                          // Tasks module is admin-only: force OFF and block changes for non-admin role columns
                          const isTasksModule = modulePermissionKey === "tasks";
                          const isAdminRole = role.key === "95";
                          const isTasksNonAdmin = isTasksModule && !isAdminRole;

                          // Approvals module logic: Block changes and force OFF for Manager (99) and Coordinator (101)
                          const isApprovalsModule = modulePermissionKey === "approvals";
                          const isApprovalsBlockedRole = ["99", "101"].includes(role.key);
                          const isApprovalsLocked = isApprovalsModule && isApprovalsBlockedRole;

                          // Rule Notifications logic: Admin-only, block changes and force OFF for non-admin
                          const isRuleNotificationsModule = modulePermissionKey === "rule_notification";
                          const isRuleNotificationsNonAdmin = isRuleNotificationsModule && !isAdminRole;

                          return (
                            <TableCell key={role.key}>
                              <ToggleSwitch
                                checked={
                                  isTasksNonAdmin ? false :
                                  isApprovalsLocked ? false :
                                  isRuleNotificationsNonAdmin ? false :
                                  isEnabled
                                }
                                onChange={() =>{
                                  if(isUserManagement){
                                    toast.error("User Management permission cannot be modified");
                                    return;
                                  }
                                  if (isTasksNonAdmin) {
                                    toast.error("The Tasks module is only accessible to Admins. Permissions for other roles cannot be modified.");
                                    return;
                                  }
                                  if (isApprovalsLocked) {
                                    toast.error("The Approvals module is restricted to Admins, Doctors, and Nurses. Permissions for other roles cannot be modified.");
                                    return;
                                  }
                                  if (isRuleNotificationsNonAdmin) {
                                    toast.error("The Rule Notifications module is only accessible to Admins. Permissions for other roles cannot be modified.");
                                    return;
                                  }
                                  handleToggle(role.key, module.key, isEnabled)
                                }}
                                disabled={isToggling || updating}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Warning Box */}
            <Box
              sx={{
                border: "1px solid",
                borderColor: theme.palette.primary.main,
                bgcolor: "#FFF6D8",
                p: 2,
                borderRadius: "10px",
                mt: 5,
                display: "inline-flex",
                width: 1197,
                maxWidth: "100%",
                alignItems: "center",
              }}
            >
              <Typography variant="body1" color="error.dark">
                Changes to permissions are applied immediately and will affect
                all users in the respective roles.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default RolePermissionTable;
