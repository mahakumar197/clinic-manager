import {
  CommonButton,
  CommonCards,
  CommonIcon,
  CommonPageHeader,
} from "@/components/common";
import PageContainer from "@/components/layouts/PageContainer";
import { Box, Grid, useTheme } from "@mui/material";
import { useState } from "react";
import CreateUserModal from "./CreateUser/CreateUserModal";
import RolePermissionTable from "./RolePermissionTable";
import UserList from "./UserList";
import { useUserStats } from "./hooks/useUserStats";
import { useUserManagement } from "./hooks/useUserManagement";

const UserManagement = () => {
  const theme = useTheme();
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const { stats, loading, refetch } = useUserStats();
  const { loading: userLoading, refetch: userRefetch } = useUserManagement();

  const cards = [
    {
      id: 1,
      title: "Total users",
      value: stats?.total ?? 0,
      iconName: "Users",
      variant: "white",
    },
    {
      id: 2,
      title: "Active",
      value: stats?.active ?? 0,
      iconName: "UserCheck",
      variant: "green",
    },
    {
      id: 3,
      title: "2FA Enabled",
      value: stats?.twoFAEnabled ?? 0,
      iconName: "ShieldCheck",
      variant: "blue",
    },
    {
      id: 4,
      title: "Suspended",
      value: stats?.suspended ?? 0,
      iconName: "UserX",
      variant: "red",
    },
  ];

  const [activeView, setActiveView] = useState<"userList" | "permissionGrid">(
    "userList"
  );

  return (
    <PageContainer>
      <Grid
        container
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {/* LEFT TEXT */}
        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <Box>
            <CommonPageHeader
              title="User Management"
              subtitle="Manage team members and permissions"
            />
          </Box>
        </Grid>
        {/* BUTTON GROUP */}
        <Grid size={{ xs: 12, sm: 12, md: 8 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "end",
              width: { xs: "100%", md: "100%", sm: "auto" },
              gap: { xs: 1.5, sm: 1 },
              mt: { xs: 2, sm: 1 },
            }}
          >
            <CommonButton
              variant="outlined"
              startIcon={<CommonIcon name="Shield" />}
              onClick={() =>
                setActiveView(
                  activeView === "permissionGrid"
                    ? "userList"
                    : "permissionGrid"
                )
              }
            >
              {activeView === "permissionGrid"
                ? "User List"
                : "Permission Grid"}
            </CommonButton>

            {/* New Task Button */}
            <CommonButton
              variant="contained"
              startIcon={<CommonIcon name="Plus" />}
              onClick={() => setOpenAddUserModal(true)}
            >
              Add user
            </CommonButton>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <CommonCards {...c} loading={loading} />
          </Grid>
        ))}
      </Grid>
      {activeView === "permissionGrid" ? <RolePermissionTable /> : <UserList />}
      <CreateUserModal
        open={openAddUserModal}
        onClose={() => setOpenAddUserModal(false)}
        onSuccess={() => {
          refetch();
          userRefetch()
        }}
      />
    </PageContainer>
  );
};

export default UserManagement;
