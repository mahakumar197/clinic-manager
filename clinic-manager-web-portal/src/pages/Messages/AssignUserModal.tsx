import { CommonTextField } from "@/components/common";
import BaseModal from "@/components/common/BaseModal";
import CommonIcon from "@/components/common/CommonIcon";
import { Avatar, Box, Paper, Typography, useTheme } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import authService from "@/services/modules/auth.service";
import { capitalize } from "@/utils";

interface AssignUserModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    title?: string;
    submitLabel?: string;
}

const getInitials = (name: string) =>
    name
        .replace("Dr.", "")
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

export default function AssignUserModal({
    open,
    onClose,
    onSubmit,
    title = "Tag / Assign Colleague",
    submitLabel = "Submit",
}: AssignUserModalProps) {
    const theme = useTheme();

    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [initialLoading, setInitialLoading] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const form = useForm({
        defaultValues: {
            user: null,
        },
    });

    // Fetch users with debounce + AbortController
    useEffect(() => {
        if (!open) return;

        const timer = setTimeout(async () => {
            // Cancel previous request
            abortControllerRef.current?.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const data = await authService.getUsersByRole({
                    exclude: "ADMIN,PATIENT",
                    search: search,
                }, controller.signal);
                if (!controller.signal.aborted) {
                    setUsers(Array.isArray(data) ? data : []);
                    setInitialLoading(false);
                }
            } catch (error: any) {
                if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") return;
                console.error("Failed to fetch users", error);
                if (!controller.signal.aborted) {
                    setUsers([]);
                    setInitialLoading(false);
                }
            }
        }, 400);

        return () => {
            clearTimeout(timer);
        };
    }, [search, open]);

    // Reset search when modal opens
    useEffect(() => {
        if (open) {
            setSearch("");
            setInitialLoading(true);
            setSelectedUserIds([]);
        }
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [open]);

    const handleContinue = () => {
        onSubmit(selectedUserIds);
    };

    const toggleUser = (uId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(uId)
                ? prev.filter(id => id !== uId)
                : [...prev, uId]
        );
    };

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
                {/* Note Field Removed */}
                <CommonTextField
                    label="Search Colleague"
                    placeholder="Search by name..."
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 300, overflowY: 'auto' }}>
                    {initialLoading && <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>Loading...</Typography>}
                    {!initialLoading && users.length === 0 && <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>No colleagues found.</Typography>}
                    {users.map((u: any) => {
                        const uId = u.id || u._id || u.guid;
                        const isSelected = selectedUserIds.includes(uId);
                        return (
                            <Paper
                                key={uId}
                                elevation={0}
                                onClick={() => toggleUser(uId)}
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
                                {isSelected ? (
                                    <CommonIcon
                                        name="CheckSquare"
                                        size={20}
                                        color={theme.palette.primary.main}
                                    />
                                ) : (
                                    <CommonIcon
                                        name="Square"
                                        size={20}
                                        color={theme.palette.text.disabled}
                                    />
                                )}
                            </Paper>
                        );
                    })}
                </Box>
            </Box>
        </BaseModal>
    );
}
