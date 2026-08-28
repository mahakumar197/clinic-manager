import { Box, Typography, Paper, Avatar, Chip, useTheme } from "@mui/material";
import { useMemo, useState } from "react";
import { BaseModal, CommonButton, CommonTextField } from "@/components/common";
import CommonIcon from "@/components/common/CommonIcon";
// import CommonSkeleton from "@/components/common/CommonSkeleton";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import { useUserList } from "@/hooks/useUserList";
import { useReassignTask } from "../hooks/useReassignTask";
import { convertToCamelCase } from "@/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  taskId: string;
  onSuccess: () => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const ReassignTaskModal = ({ open, onClose, taskId, onSuccess }: Props) => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // exclude ADMIN & PATIENT
  const { users, loading } = useUserList({
    exclude: "ADMIN,PATIENT",
    search,
  });

  const { reassign, loading: reassignLoading } = useReassignTask(taskId, () => {
    onSuccess();
    onClose();
  });


const filteredUsers = useMemo(() => {
  const searchText = search?.toLowerCase() || "";

  return users.filter((u) =>
    u?.userName?.toLowerCase()?.includes(searchText)
  );
}, [users, search]);


  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Reassign Task"
      subtitle="Select a user to reassign this task"
      onNext={() => reassign(selectedUser.id)}
      nextLabel="Reassign"
      backLabel="Cancel"
      loading={reassignLoading}
      disableNext={!selectedUser}
      onBack={onClose}
    >
      <Box sx={{ mt: 2 }}>
        {/* Search */}
        <CommonTextField
          fullWidth
          label="Search User"
          placeholder="Search by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2.5 }}
        />

        {/* Loading */}
        {loading && (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <CommonSkeleton key={index} type="patientList" />
            ))}
          </>
        )}

        {/* Empty */}
        {!loading && filteredUsers.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No users found
          </Typography>
        )}

        {/* List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filteredUsers.map((user) => {
            const isActive = selectedUser?.id === user.id;

            return (
              <Paper
                key={user.id}
                elevation={0}
                onClick={() => setSelectedUser(user)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: "10px 14px",
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: isActive ? "primary.main" : "divider",
                  backgroundColor: isActive ? "primary.light" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: "14px",
                    bgcolor: isActive ? "primary.main" : "#FFF7E9",
                    color: isActive ? "primary.contrastText" : "primary.main",
                  }}
                >
                  {getInitials(user.userName)}
                </Avatar>

                {/* Name + Role */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ mb: 0.3 }}>
                    {user.userName}
                  </Typography>
                  {/* <Typography variant="body2" color="text.secondary">
                    {user.role}
                  </Typography> */}
                </Box>

                {/* Role chip */}
                <Chip
                  label={convertToCamelCase(user.role)}
                  size="small"
                  sx={{
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: "divider",
                    fontSize: "12px",
                    height: "22px",
                    bgcolor: "transparent",
                  }}
                />

                {/* Active icon */}
                {isActive && (
                  <CommonIcon
                    name="CircleCheckBig"
                    size={20}
                    color={theme.palette.primary.main}
                  />
                )}
              </Paper>
            );
          })}
        </Box>
      </Box>
    </BaseModal>
  );
};

export default ReassignTaskModal;
