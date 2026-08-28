import {
  BaseTextField,
  CommonIcon,
  BaseSelect,
  CommonTable,
} from "@/components/common";
import type { Column } from "@/components/common";
import { ROUTES } from "@/constants";
import { Box, Grid, useTheme } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SuspendUserModal from "./SuspendUserModal.tsx";
import { useUserManagement } from "./hooks/useUserManagement";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
import { SelectOption } from "@/types/select";

const UserList = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch dropdown options
  const { options: roleOptions } = useDropdown(DropdownType.USER_ROLE);
  const { options: statusOptions } = useDropdown(DropdownType.USER_STATUS);

  // User management hook
  const {
    users,
    pagination,
    loading,
    isFetching,
    updateFilters,
    changePage,
    changeLimit,
    refetch,
  } = useUserManagement();

  // Filter states
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<SelectOption | null>(null);
  const [status, setStatus] = useState<SelectOption | null>(null);

  // Modal state
  const [openSuspendModal, setOpenSuspendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const userColumns: Column[] = [
    {
      id: "userName",
      label: "User",
      avatar: true,
      avatarNameKey: "userName",
      avatarEmailKey: "email",
    },
    {
      id: "roleLabel",
      label: "Role",
    },
    {
      id: "status",
      label: "Status",
      color: true,
    },
    {
      id: "lastLogin",
      label: "Last Login",
    },
    {
      id: "twoFA",
      label: "2FA",
    },
    {
      id: "actions",
      label: "Actions",
      actionType: "menu",
      menuItems: [
        {
          label: "Edit",
          icon: "Pencil",
          onClick: (row) => {
            navigate(`${ROUTES.EDITUSER}/${row.userId}`);
          },
        },
        {
          label: "Suspend",
          icon: "Ban",
          color: "red",
          disabled: (row) => row.status?.toLowerCase() === "suspended",
          onClick: (row) => {
            console.log("Suspending user:", row);
            setSelectedUser(row);
            setOpenSuspendModal(true);
          },
        },
      ],
    },
  ];

  // Transform API data to table format
  const tableData = users.map((user) => ({
    ...user,
    twoFA: user.two_fa_enabled ? "Enabled" : "Disabled",
  }));

  return (
    <>
      <Box
        sx={{
          p: 2,
          borderRadius: "16px",
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: "#fff",
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{
            display: "flex",
            flexWrap: { xs: "wrap", lg: "nowrap" },
          }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <BaseTextField
              placeholder="Search by name or email..."
              startIcon={<CommonIcon name="Search" />}
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                updateFilters({ search: value || undefined });
              }}
            />
          </Grid>

          {/* Role */}
          <Grid
            size={{ xs: 12, sm: 3, md: 3, lg: 2 }}
            sx={{ ml: { lg: "auto" } }}
          >
            <BaseSelect
              placeholder="Roles"
              name="role"
              value={role}
              onChange={(value) => {
                setRole(value);
                updateFilters({
                  role: !value || value.value === "" ? undefined : String(value.value),
                });
              }}
              options={roleOptions}
            />
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12, sm: 3, md: 3, lg: 2 }}>
            <BaseSelect
              placeholder="Status"
              name="status"
              value={status}
              onChange={(value) => {
                setStatus(value);
                updateFilters({
                  status: !value || value.value === "" ? undefined : String(value.value),
                });
              }}
              options={statusOptions}
            />
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CommonTable
            title="User Management"
            columns={userColumns}
            data={tableData}
            loading={loading}
            isFetching={isFetching}
            pageMeta={pagination}
            onPageChange={changePage}
            onRowsPerPageChange={changeLimit}
          />

          <SuspendUserModal
            open={openSuspendModal}
            onClose={() => setOpenSuspendModal(false)}
            user={{
              userId: selectedUser?.userId,
              initials: selectedUser?.userName?.slice(0, 2).toUpperCase() || "??",
              name: selectedUser?.userName || "",
              email: selectedUser?.email || "",
              status: selectedUser?.status || "",
            }}
            onSuccess={() => {
              // Refetch user list after successful suspension
              refetch();
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default UserList;
