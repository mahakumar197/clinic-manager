import { CommonTextField } from "@/components/common";
import BaseModal from "@/components/common/BaseModal";
import CommonIcon from "@/components/common/CommonIcon";
import { Avatar, Box, Paper, Typography, useTheme } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { messagesService } from "@/services/modules/messages.service";
import { capitalize } from "@/utils";

interface TagColleagueModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title?: string;
  submitLabel?: string;
  threadId: string; // Required for this modal
}

const getInitials = (name: string) =>
  name
    .replace("Dr.", "")
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export default function TagColleagueModal({
  open,
  onClose,
  onSubmit,
  title = "Tag Colleague",
  submitLabel = "Tag",
  threadId,
}: TagColleagueModalProps) {
  const theme = useTheme();

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const form = useForm({
    defaultValues: {
      note: "",
      userId: null,
      user: null,
    },
  });

  // Fetch users with debounce + AbortController
  useEffect(() => {
    if (!open || !threadId) return;

    const timer = setTimeout(async () => {
      // Cancel previous request
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await messagesService.getThreadAssignedUsers(threadId, search, controller.signal);
        if (!controller.signal.aborted) {
          setUsers(Array.isArray(data) ? data : []);
          setInitialLoading(false);
        }
      } catch (error: any) {
        if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") return;
        console.error("Failed to fetch thread assigned users", error);
        if (!controller.signal.aborted) {
          setUsers([]);
          setInitialLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search, open, threadId]);

  // Reset search when modal opens
  useEffect(() => {
    if (open) {
      setSearch("");
      setInitialLoading(true);
      form.reset();
    }
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [open, form]);

  const handleContinue = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle=""
      onBack={onClose}
      backLabel="Cancel"
      onNext={handleContinue}
      nextLabel={submitLabel}
    >
      <Box>
        <Controller
          name="note"
          control={form.control}
          render={({ field }) => (
            <CommonTextField
              fullWidth
              autoHeight
              multiline
              rows={4}
              label="Internal Note (Optional)"
              placeholder="Add detailed Internal note..."
              {...field}
              sx={{ mb: 2, mt: 1 }}
            />
          )}
        />
        <CommonTextField
          label="Search Colleague"
          placeholder="Search by name..."
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Controller
          name="userId"
          control={form.control}
          render={({ field }) => (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 300, overflowY: 'auto' }}>
              {initialLoading && <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>Loading...</Typography>}
              {!initialLoading && users.length === 0 && <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>No colleagues found.</Typography>}
              {users.map((u: any) => {
                const uId = u.user_id || u._id || u.guid;
                const isSelected = field.value === uId;
                return (
                  <Paper
                    key={uId}
                    elevation={0}
                    onClick={() => {
                      field.onChange(uId);
                      form.setValue("user", u);
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: "10px 14px",
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: isSelected ? "primary.main" : "divider",
                      backgroundColor: isSelected
                        ? "primary.light"
                        : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: "14px",
                        bgcolor: isSelected ? "primary.main" : "#FFF7E9",
                        color: isSelected
                          ? "primary.contrastText"
                          : "primary.main",
                      }}
                    >
                      {getInitials(u.name || u.userName || u.username || "Unknown")}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ mb: 0.3 }}>
                        {u.name || u.userName || u.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {capitalize(u.role) || "Colleague"}
                      </Typography>
                    </Box>
                    {isSelected && (
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
          )}
        />
      </Box>
    </BaseModal>
  );
}
