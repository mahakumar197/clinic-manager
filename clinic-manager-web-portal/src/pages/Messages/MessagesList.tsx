import {
  Box,
  Typography,
  Avatar,
  Grid,
  Chip,
  useTheme,
  Divider,
  useMediaQuery,
  Fade,
  List,
  ListItemButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Flag } from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { fetchThreads, archiveThread, markThreadRead, markThreadUnread, deleteThread } from "@/features/messages/thunks";
import { setSearch, setRoleGroup } from "@/features/messages/slice";
import Modal from "@/components/common/Modal";
import { contentPreviewStyle, messageCardStyle, timeStyle } from "./styles";
import { formatMessageTime } from "@/utils/date";
import {
  BaseTextField,
  CommonIconButton,
  CommonButton,
  BaseSelect,
  CommonIcon,
} from "@/components/common";
// import CommonSkeleton from "@/components/common/CommonSkeleton";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import { emptyMessage } from "@/assets";
import { capitalize } from "@/utils";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";

interface Props {
  onSelect: (item: any) => void;
  selectedMessage: any;
  isOpen: any;
}

const MessagesList = ({ onSelect, selectedMessage, isOpen }: Props) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { list: messages, loading, pagination, filters, counts } = useAppSelector((state) => state.messages);
  const isAboveMd = useMediaQuery(theme.breakpoints.up("md"));
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { options: roleOptions } = useDropdown(DropdownType.USER_ROLE, false);
  const [form, setForm] = useState({ productType: null });
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [deleteThreadId, setDeleteThreadId] = useState<string | null>(null);

  // Effect to fetch threads when filters change
  useEffect(() => {
    dispatch(fetchThreads({
      page: 1,
      limit: 10,
      filter: filters.filter,
      search: filters.search,
      roleGroup: filters.roleGroup
    }));
  }, [dispatch, filters.filter, filters.search, filters.roleGroup]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== filters.search) {
        dispatch(setSearch(localSearch));
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [localSearch, dispatch, filters.search]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 1) {
      if (!loading && pagination && pagination.page < pagination.totalPages) {
        dispatch(fetchThreads({
          page: pagination.page + 1,
          limit: pagination.limit || 10,
          filter: filters.filter,
          search: filters.search,
          roleGroup: filters.roleGroup
        }));
      }
    }
  };

  const renderFilterButton = (
    <CommonIconButton
      sx={{
        p: 1,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "8px",
      }}
      icon={<CommonIcon name="Funnel" />}
    />
  );

  return (
    <>
    <Box
      onScroll={handleScroll}
      sx={{ height: "90vh", overflowY: "auto", overflowX: "hidden" }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid
            size={{
              xs: 2,
              sm: 2,
              md: selectedMessage ? 2 : 1,
              lg: selectedMessage ? 2 : 1,
              xl: selectedMessage ? 2 : 1,
            }}
            sx={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            <CommonIconButton
              icon={<CommonIcon name="ListFilter" />}
              sx={{
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
              }}
              onClick={() => isOpen(true)}
            />
          </Grid>

          <Grid
            size={{
              xs: 10,
              sm: 5,
              md: selectedMessage ? 10 : 6,
              lg: selectedMessage ? 10 : 6,
              xl: selectedMessage ? 10 : 6,
            }}
            sx={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            <BaseTextField
              placeholder="Search messages..."
              value={localSearch}
              onChange={(e: any) => setLocalSearch(e.target.value)}
            />
          </Grid>
{/* 
          <Fade in={isBelowMd || !!selectedMessage} timeout={220}>
            <Grid
              size={{
                xs: 2,
                sm: 2,
                md: selectedMessage ? 2 : 0,
                lg: selectedMessage ? 2 : 0,
                xl: selectedMessage ? 2 : 0,
              }}
              sx={{
                display: isBelowMd || selectedMessage ? "flex" : "none",
                justifyContent: "flex-end",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              {renderFilterButton}
            </Grid>
          </Fade> */}

          <Grid
            size={{
              xs: 12,
              sm: 5,
              md: selectedMessage ? 12 : 5,
              lg: selectedMessage ? 12 : 5,
              xl: selectedMessage ? 12 : 5,
            }}
            sx={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            <BaseSelect
              placeholder="Filter by Role Group"
              name="roleGroup"
              value={roleOptions.find(opt => opt.value === filters.roleGroup) || null}
              onChange={(newValue: any) => {
                const newRole = newValue?.value || "";
                if (newRole !== filters.roleGroup) {
                  dispatch(setRoleGroup(newRole));
                }
              }}
              options={roleOptions.filter(opt => opt.label !== "Admin")}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider />
      {/* Messages or Skeleton */}
      {/* Messages or Skeleton */}
      {loading && messages.length === 0 ? (
        // Show skeleton only on initial load or empty list
        Array.from({ length: 7 }).map((_, i) => (
          <CommonSkeleton key={i} type="messageCard" />
        ))
      ) : messages.length === 0 ? (
        // Empty State
        <Box sx={{ 
          p: 4, 
          textAlign: "center", 
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          height: "calc(90vh - 180px)"
        }}>
          <Box
            component="img"
            src={emptyMessage}
            alt="No messages"
            sx={{
              width: { xs: 200, sm: 230 },
              height: "auto",
              mb: 1
            }}
          />
          <Typography variant="subtitle2" fontWeight={700} color="secondary.contrastText">
            {filters.roleGroup
              ? `No messages found for ${filters.roleGroup} role.`
              : `Nothing in ${filters.filter === 'all' ? 'All Messages' : capitalize(filters.filter)}`}
          </Typography>
        </Box>
      ) : (
        // Message List
        <List disablePadding>
          {messages.map((msg) => {
            const isActive = selectedMessage?.thread_id === msg.thread_id;
            
            return (
              <ListItemButton
                key={msg.thread_id}
                sx={{
                  ...messageCardStyle,
                  bgcolor: isActive ? "#919eab29" : "background.paper",
                  borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : "4px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover .message-actions": { opacity: 1 },
                  "&:hover .time": { opacity: isAboveMd ? 0 : 1 },
                }}
                onClick={() => onSelect(msg)}
              >
              <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "start",
                    gap: 2,
                    width: "70%",
                  }}
                >
                  <Avatar
                    sx={{ bgcolor: "primary.light", color: "primary.main" }}
                  >
                    {capitalize(msg.patient.name?.[0])}
                  </Avatar>

                  <Box
                    sx={{
                      flex: 1,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      {capitalize(msg.patient.name)}
                    </Typography>
                    <Typography variant="body2">{msg.subject || "No Subject"}</Typography>
                    <Typography sx={contentPreviewStyle} variant="body2">
                      {msg.last_message?.text}
                      {msg.last_message?.attachments && msg.last_message.attachments.length > 0 && (
                        <span style={{ marginLeft: "4px" }}>📎</span>
                      )}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <Chip
                        label={
                          msg.assigned_users?.[0]?.role
                            ? msg.assigned_users[0].role.charAt(0).toUpperCase() +
                            msg.assigned_users[0].role.slice(1).toLowerCase()
                            : "Unassigned"
                        }
                        size="small"
                        variant="outlined"
                        color="warning"
                        sx={{
                          height: 20,
                          fontSize: "11px",
                        }}
                      />
                      {msg.flagged && (
                        <Flag
                          sx={{
                            fontSize: theme.typography.overline,
                            color: "orange",
                          }}
                        />
                      )}
                      {!msg.is_read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            bgcolor: "info.main",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ textAlign: "right", width: "30%" }}>
                  <Typography className="time" variant="caption" sx={timeStyle}>
                    {formatMessageTime(msg.last_message?.created_at)}
                  </Typography>

                  {isAboveMd && (
                    <Box
                      className="message-actions"
                      sx={{ opacity: 0, transition: "0.2s" }}
                    >
                      {/* <CommonIconButton
                        icon={<CommonIcon name="Trash2" />}
                        tooltip="Bin"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteThreadId(msg.thread_id);
                        }}
                      /> */}
                      <CommonIconButton
                        icon={<CommonIcon name={(msg.status === 'archived' || filters.filter === 'archived') ? "ArchiveRestore" : "Archive"} />}
                        tooltip={(msg.status === 'archived' || filters.filter === 'archived') ? "Unarchive" : "Archive"}
                        onClick={(e) => {
                          e.stopPropagation();
                          const isArchived = msg.status === 'archived' || filters.filter === 'archived';
                          dispatch(archiveThread({ threadId: msg.thread_id, status: !isArchived }));
                        }}
                      />
                      <CommonIconButton
                        icon={<CommonIcon name={msg.is_read ? "Mail" : "MailOpen"} />}
                        tooltip={msg.is_read ? "Mark as Unread" : "Mark as Read"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (msg.is_read) {
                            dispatch(markThreadUnread(msg.thread_id));
                          } else {
                            if (msg.last_message?.message_id) {
                              dispatch(markThreadRead({
                                threadId: msg.thread_id,
                                lastSeenMessageId: msg.last_message?.message_id
                              }));
                            }
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </ListItemButton>
            );
          })}
          {loading && messages.length > 0 && pagination.page > 1 && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="caption">Loading more...</Typography>
            </Box>
          )}
        </List>
      )}
    </Box>

    {/* DELETE CONFIRMATION DIALOG */}
    <Modal
      open={!!deleteThreadId}
      onClose={() => setDeleteThreadId(null)}
      title="Delete Conversation"
      maxWidth="xs"
      actions={
        <>
          <CommonButton variant="outlined" onClick={() => setDeleteThreadId(null)}>
            Cancel
          </CommonButton>
          <CommonButton
            variant="contained"
            onClick={() => {
              if (deleteThreadId) dispatch(deleteThread(deleteThreadId));
              setDeleteThreadId(null);
            }}
            sx={{ bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}
          >
            Delete
          </CommonButton>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary">
        Are you sure you want to delete this conversation? This action cannot be undone.
      </Typography>
    </Modal>
    </>
  );
};

export default MessagesList;
