import { CommonButton, CommonIconButton } from "@/components/common";
import CommonTextField from "@/components/common/BaseTextField";
import CommonIcon from "@/components/common/CommonIcon";
import { formatMessageTime } from "@/utils/date";
import { capitalize, handleEnterStart } from "@/utils/helpers";
import { getMediaDuration } from "@/utils/mediaHelpers";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Link,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useRef, useState, useEffect, useLayoutEffect } from "react";
import AssignUserModal from "./AssignUserModal";
import TagColleagueModal from "./TagColleagueModal";
import CustomAudioPlayer from "./CustomAudioPlayer";
import CustomVideoPlayer from "./CustomVideoPlayer";
import VoiceRecorder from "./VoiceRecorder";
import { useAppDispatch, useAppSelector } from "@/app/store";
import Modal from "@/components/common/Modal";
import {
  sendMessage,
  fetchThreadMessages,
  sendInternalNote,
  archiveThread,
  markThreadUnread,
  markThreadRead,
  deleteThread,
  starThread,
  assignThread,
} from "@/features/messages/thunks";
import { setSelectedMessage } from "@/features/messages/slice";
import { toast } from "@/utils/toast";
import { useAuthRole } from "@/hooks/useAuthRole";

interface Props {
  message: any; // The thread object
  onClose: any;
}

// Helper function to linkify URLs in text
const linkifyText = (text: string, isOwnMessage: boolean) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <Link
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: isOwnMessage ? "white" : "primary.main",
            textDecoration: "underline",
            wordBreak: "break-all",
            "&:hover": {
              textDecoration: "underline",
              textUnderlineOffset: "1px",
              opacity: 0.8,
            },
          }}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
};

// Message delivery status icon (pending/sent/read)
const MessageStatusIcon = ({ msg, isOwnMessage, color }: { msg: any; isOwnMessage: boolean; color: string }) => {
  if (!isOwnMessage) return null;
  
  const isPending = msg.message_id?.startsWith("temp_");
  const isRead = msg.status === "double";

  return (
    <CommonIcon
      name={isPending ? "Clock" : isRead ? "CheckCheck" : "Check"}
      size={isPending ? 12 : 14}
      color={color}
    />
  );
};

const MessageView = ({ message, onClose }: Props) => {
  if (!message) return null;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();
  const role = useAuthRole()
  // messages data from Redux
  const { currentThreadMessages } = useAppSelector((state) => state.messages);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "administrator"; // Basic check
  // Import dynamically if needed, or better: add import at top of file.
  // Since I can't add top-level import easily with this replace, I'll use require or assume it's available?
  // No, I should add the import first. But I can't do two replaces in one step unless multi-replace with large chunks.
  // I will assume I can add the import in a previous step or use dynamic import.
  // Dynamic import is safer for partial file editing.

  // Sync the passed message object with Redux store to get latest updates (like flagged status)
  const { list, filters } = useAppSelector((state) => state.messages);
  const currentThread =
    list.find((t) => t.thread_id === message?.thread_id) || message;


  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [reply, setReply] = useState("");
  const [openTagModal, setOpenTagModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replyInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [preUploadedKey, setPreUploadedKey] = useState<string | null>(null);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [mediaDuration, setMediaDuration] = useState<number | null>(null);


  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentStickyDate, setCurrentStickyDate] = useState<string | null>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dateRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    console.log("=== Thread Open useEffect ===");
    console.log("currentThread:", currentThread?.thread_id);
    console.log("currentThread.is_read:", currentThread?.is_read);
    console.log("currentThread.last_message:", currentThread?.last_message);
    if (currentThread && currentThread.thread_id) {
      dispatch(setSelectedMessage(currentThread.thread_id));
      dispatch(fetchThreadMessages(currentThread.thread_id));

      // Auto-mark as read (update last seen)
      console.log("last_message?.message_id:", currentThread.last_message?.message_id);
      if (currentThread.last_message?.message_id) {
        console.log(">>> Dispatching markThreadRead with:", {
          threadId: currentThread.thread_id,
          lastSeenMessageId: currentThread.last_message?.message_id,
        });
        dispatch(
          markThreadRead({
            threadId: currentThread.thread_id,
            lastSeenMessageId: currentThread.last_message?.message_id,
          }),
        );
      } else {
        console.log(">>> SKIPPED markThreadRead - no last_message.message_id");
      }
    } else {
      console.log(">>> SKIPPED - no currentThread or thread_id");
    }
    console.log("=== End Thread Open useEffect ===");
    return () => {
      dispatch(setSelectedMessage(null));
    };
  }, [dispatch, currentThread?.thread_id]); // Use optional chaining to avoid crash if null

  // Track if user was at bottom before messages change (for smart auto-scroll)
  const wasAtBottomRef = useRef(true);
  const isManualScrollingRef = useRef(false);
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is at bottom before messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesEndRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      wasAtBottomRef.current = distanceFromBottom < 100;
    }
  }, [currentThreadMessages]);

  // Smart auto-scroll: scroll to bottom if user was at bottom OR on initial thread load
  useLayoutEffect(() => {
    if (messagesEndRef.current && !isManualScrollingRef.current) {
      // Always scroll to bottom if they were at bottom (WhatsApp behavior)
      if (wasAtBottomRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
    }
  }, [currentThreadMessages]);

  // Scroll to bottom on thread change
  useEffect(() => {
    if (messagesEndRef.current && currentThread?.thread_id) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      wasAtBottomRef.current = true;
    }
  }, [currentThread?.thread_id]);

  // Auto-focus the reply input when user types anywhere on the page
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Skip if user is already focused on an input/textarea
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      // Skip modifier keys, function keys, navigation keys, etc.
      if (
        e.ctrlKey || e.metaKey || e.altKey ||
        e.key === 'Tab' || e.key === 'Escape' ||
        e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete' ||
        e.key.startsWith('Arrow') ||
        e.key.startsWith('F') && e.key.length > 1
      ) return;

      // Only focus for printable characters (single char keys)
      if (e.key.length === 1 && replyInputRef.current) {
        replyInputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (messagesEndRef.current) {
      // Mark that user is manually scrolling
      isManualScrollingRef.current = true;
      
      // Clear the flag after scrolling stops
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      manualScrollTimeoutRef.current = setTimeout(() => {
        isManualScrollingRef.current = false;
      }, 150);
      
      const { scrollTop, scrollHeight, clientHeight } = messagesEndRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
      // Update the ref so we know user's position for next message update
      wasAtBottomRef.current = isNearBottom;
      
      // Show date header while scrolling
      setIsScrolling(true);
      
      // Determine which date is currently visible at the top
      // We'll use the first message's date as the sticky date by default
      if (currentThreadMessages && currentThreadMessages.length > 0) {
        // Calculate approximately which message index is at the top based on scroll position
        const estimatedIndex = Math.floor(scrollTop / 100); // Rough estimate
        const clampedIndex = Math.min(Math.max(0, estimatedIndex), currentThreadMessages.length - 1);
        
        // Find the date section this message belongs to
        const currentMsg = currentThreadMessages[clampedIndex];
        const currentMsgDate = new Date(currentMsg.created_at).toDateString();
        
        setCurrentStickyDate(currentMsgDate);
        
        // Check if the static date divider for this date is visible
        const dateElement = dateRefs.current.get(currentMsgDate);
        if (dateElement) {
          const rect = dateElement.getBoundingClientRect();
          const scrollContainerRect = messagesEndRef.current.getBoundingClientRect();
          // Show sticky header only if static date has scrolled completely past the top
          // The static date is considered "out of view" if its bottom is above the container's top
          const isStaticDateOutOfView = rect.bottom < scrollContainerRect.top + 10;
          setShowStickyHeader(isStaticDateOutOfView);
        } else {
          setShowStickyHeader(false);
        }
      }
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Hide date header 1 second after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: 'smooth'
      });
      wasAtBottomRef.current = true;
    }
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const closeMenu = () => setAnchorEl(null);
  const openActionMenu = (e: React.MouseEvent<HTMLElement>) => setActionMenuAnchor(e.currentTarget);
  const closeActionMenu = () => setActionMenuAnchor(null);

  const handleArchive = () => {
    if (currentThread?.thread_id) {
      // Determine action based on current status or visibility
      // Attempt to infer if archived:
      const isArchived =
        currentThread.status === "archived" || currentThread.isArchived || filters.filter === "archived";
      // Note: 'status' field in Thread interface.

      const newStatus = !isArchived;
      dispatch(
        archiveThread({ threadId: currentThread.thread_id, status: newStatus }),
      );
      onClose();
    }
    closeMenu();
  };

  const handleUnread = () => {
    if (currentThread?.thread_id) {
      dispatch(markThreadUnread(currentThread.thread_id));
      onClose();
    }
    closeMenu();
  };

  const handleRead = () => {
    if (currentThread?.thread_id) {
      if (currentThread.last_message?.message_id) {
        dispatch(
          markThreadRead({
            threadId: currentThread.thread_id,
            lastSeenMessageId: currentThread.last_message?.message_id,
          }),
        );
      }
      onClose();
    }
    closeMenu();
  };

  const handleDelete = () => {
    closeMenu();
    setConfirmDelete(true);
  };

  const confirmDeleteThread = () => {
    if (currentThread?.thread_id) {
      dispatch(deleteThread(currentThread.thread_id));
      onClose();
    }
    setConfirmDelete(false);
  };

  const handleStar = () => {
    if (currentThread?.thread_id) {
      dispatch(starThread(currentThread.thread_id));
    }
  };

  const handleChooseClick = () => {
    fileInputRef.current?.click();
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setAttachedFile(file);
  //   console.log("Attached File:", file);
  // };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleDroppedFile(file);
    console.log("Attached File:", file);
    e.target.value = "";
  };

  const handleSend = async (voiceFile?: File) => {
    if (isSending) return; // Prevent duplicate sends

    // Validation
    const fileToSend = voiceFile || attachedFile;

    if (isInternalNote) {
      if (!reply.trim()) return;
    } else {
      if (!reply.trim() && !fileToSend) return;
    }

    setIsSending(true);

    // Handle Internal Note
    if (isInternalNote) {
      dispatch(
        sendInternalNote({
          content: reply,
          threadId: currentThread.thread_id,
        }),
      );
      setReply("");
      setIsSending(false);
      return;
    }

    let attachments: any[] = [];

    //  PRE-UPLOADED FILE IF AVAILABLE
    if (preUploadedKey && fileToSend) {
      let fileType = "doc";

      if (fileToSend.type.startsWith("image/")) fileType = "image";
      else if (fileToSend.type.startsWith("video/")) fileType = "video";
      else if (fileToSend.type.startsWith("audio/")) fileType = "audio";
      else if (fileToSend.type === "application/pdf") fileType = "pdf";

      attachments.push({
        file_url: preUploadedKey,
        file_type: fileType,
        ...(mediaDuration !== null && (fileType === 'video' || fileType === 'audio') && { duration: mediaDuration }),
      });
    }

    // if (fileToSend) {

    if (!preUploadedKey && fileToSend) {
      // For voice notes, extract duration before uploading (since they skip handleDroppedFile)
      let fileDuration: number | null = mediaDuration;
      if (voiceFile && fileDuration === null) {
        try {
          fileDuration = await getMediaDuration(voiceFile);
        } catch (err) {
          console.error('Failed to extract voice duration:', err);
        }
      }
      try {
        // Dynamically import mediaService
        const { mediaService } =
          await import("@/services/modules/media.service");

        const uploadResponse = await mediaService.uploadFile(fileToSend);
        // Extract URL and key from response
        const fileUrl =
          uploadResponse.data?.url ||
          uploadResponse.url ||
          uploadResponse.file_url ||
          (typeof uploadResponse === "string" ? uploadResponse : null);
        const fileKey = uploadResponse.data?.key || uploadResponse.key || null;

        // Determine file type category based on MIME type
        let fileType = "doc"; // Default fallback

        if (fileToSend.type.startsWith("image/")) {
          fileType = "image";
        } else if (
          fileToSend.type.startsWith("video/") ||
          fileToSend.type === "video/mp4"
        ) {
          fileType = "video";
        } else if (
          fileToSend.type.startsWith("audio/") ||
          fileToSend.type === "audio/mpeg"
        ) {
          fileType = "audio";
        } else if (
          fileToSend.type === "application/pdf" ||
          fileToSend.name.toLowerCase().endsWith(".pdf")
        ) {
          fileType = "pdf";
        } else if (
          fileToSend.type === "application/msword" ||
          fileToSend.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          fileToSend.name.toLowerCase().endsWith(".doc") ||
          fileToSend.name.toLowerCase().endsWith(".docx")
        ) {
          fileType = "doc";
        }

        if (fileKey) {
          attachments.push({
            file_url: fileKey,
            file_type: fileType,
            ...(fileDuration !== null && (fileType === 'video' || fileType === 'audio') && { duration: fileDuration }),
            // key: fileKey,
          });

          toast.success("Attachment uploaded successfully");
        }
      } catch (error) {
        console.error("File upload failed", error);
        toast.error("Failed to upload attachment");
        setIsSending(false);
        return;
      }
    }

    //  attachments.push({
    //         file_url: 'https://www.vsttractors.com/wp-content/uploads/2025/12/New-year-2026-2560-x-753.jpg',
    //         file_type: 'image'
    //       });

    // Dispatch send message action
    dispatch(
      sendMessage({
        content: reply,
        threadId: currentThread.thread_id,
        attachments, // Pass the processed attachments
      }),
    );

    console.log("Sent:", reply, fileToSend);
    setReply("");
    setAttachedFile(null);
    setPreUploadedKey(null);
    setMediaDuration(null);
    setIsRecording(false);
    setIsSending(false);
  };

  // HANDLE DRAG & DROP FILE
  const handleDroppedFile = async (file: File) => {
    setAttachedFile(file);

    // Preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Extract duration for video/audio files
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      try {
        const duration = await getMediaDuration(file);
        setMediaDuration(duration);
        console.log('Media duration extracted:', duration, 'seconds');
      } catch (error) {
        console.error('Failed to extract media duration:', error);
        // Continue without duration - not critical
      }
    }

    //  Early upload for image / video / audio / pdf / doc
    const shouldPreUpload =
      file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      file.type.startsWith("audio/") ||
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (shouldPreUpload) {
      try {
        setUploadingPreview(true);

        const { mediaService } =
          await import("@/services/modules/media.service");

        const res = await mediaService.uploadFile(file);
        const key = res?.data?.key || res?.key;

        if (key) {
          setPreUploadedKey(key);
          toast.success("File uploaded successfully");
        }
      } catch (err) {
        console.error("Pre-upload failed", err);
        toast.error("Upload failed. Please try again.");
      } finally {
        setUploadingPreview(false);
      }
    }
  };

  return (
    <Box
      sx={{
        height: "90vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid #E5E5E5",
        bgcolor: "white",
      }}
    >
      {/* HEADER - STATIC */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: { xs: "12px 16px", sm: "16px", md: "24px" },
          bgcolor: "white",
          zIndex: 1,
          position: "sticky",
          top: 0,
        }}
      >
        {/* Back icon - Mobile only */}
        <CommonIconButton
          color="default"
          onClick={onClose}
          icon={<CommonIcon name="ArrowLeft" size={20} />}
          sx={{ mr: 1 }}
        />

        <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, flex: 1, minWidth: 0 }}>
          <Avatar sx={{ 
            bgcolor: "primary.light", 
            color: "primary.main",
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            fontSize: { xs: "14px", sm: "16px" }
          }}>
            {capitalize(currentThread?.patient?.name?.[0])}
          </Avatar>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0, flex: 1 }}>
            {/* Name and chip - inline on mobile */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography 
                variant="body1" 
                fontWeight={500}
                sx={{ 
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: { xs: "14px", sm: "16px" }
                }}
              >
                {capitalize(currentThread?.patient?.name)}
              </Typography>

              {/* Role chip inline with name */}
              {/* <Chip
                label={
                  currentThread?.assigned_users?.[0]?.role
                    ? currentThread.assigned_users[0].role
                    : "Unassigned"
                }
                size="small"
                sx={{
                  height: { xs: 18, sm: 20 },
                  fontSize: { xs: "10px", sm: "11px" },
                  bgcolor: "transparent",
                  border: "1px solid",
                  borderColor: "primary.main",
                  color: "primary.main",
                }}
              /> */}
            </Box>

            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
                fontSize: { xs: "12px", sm: "14px" }
              }}
            >
              {currentThread?.subject || "No Subject"}
            </Typography>

            {currentThread?.assigned_users?.[0]?.name && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: { xs: "none", sm: "block" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                { role === "admin" ? `Assigned to ${currentThread.assigned_users[0].name} (${capitalize(currentThread.assigned_users[0].role)})` : "Assigned to you"} 
              </Typography>
            )}
          </Box>
        </Box>

        {/* RIGHT ICONS */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CommonIconButton
            sx={{ color: currentThread?.flagged ? "#FFC107" : "inherit" }}
            icon={
              <CommonIcon
                name="Flag"
                fill={currentThread?.flagged ? "currentColor" : "none"}
              />
            }
            onClick={handleStar}
          />
          <CommonIconButton
            color="inherit"
            onClick={openMenu}
            icon={<CommonIcon name="EllipsisVertical" />}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            color="inherit"
          >
            <MenuItem onClick={handleArchive}>
              <CommonIcon
                name={
                  currentThread?.status === "archived" ||
                  currentThread?.isArchived ||
                  filters.filter === "archived"
                    ? "ArchiveRestore"
                    : "Archive"
                }
              />
              <Typography sx={{ ml: 1 }} variant="body2">
                {currentThread?.status === "archived" ||
                currentThread?.isArchived ||
                filters.filter === "archived"
                  ? "Unarchive"
                  : "Archive"}
              </Typography>
            </MenuItem>

            <MenuItem onClick={handleUnread}>
              <CommonIcon name="Mail" />
              <Typography sx={{ ml: 1 }} variant="body2">
                Mark as Unread
              </Typography>
            </MenuItem>
            {/* <MenuItem onClick={handleDelete}>
              <CommonIcon name="Trash2" />
              <Typography sx={{ ml: 1 }} variant="body2">
                Delete
              </Typography>
            </MenuItem> */}
          </Menu>
          
          {/* X close icon - Desktop only */}
          {/* <CommonIconButton
            color="inherit"
            onClick={onClose}
            icon={<CommonIcon name="X" size={20} />}
            sx={{ display: { xs: "none", sm: "flex" } }}
          /> */}
        </Box>
      </Box>

      <Divider />

      {/* THREAD - ONLY THIS SCROLLS */}
      <Box
        ref={messagesEndRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 3,
          bgcolor: "background.default",
          position: "relative",
        }}
      >
        {currentThreadMessages?.map((msg, i) => {
          const isOwnMessage = msg.sender_id === user?.id;
          const isInternalNote = msg.visibility === "internal";
          
          // Date divider logic
          const currentDate = new Date(msg.created_at);
          const previousDate = i > 0 ? new Date(currentThreadMessages[i - 1].created_at) : null;
          
          // Check if we need to show a date divider
          const showDateDivider = !previousDate || 
            currentDate.toDateString() !== previousDate.toDateString();
          
          // Format date for divider
          const formatDateDivider = (date: Date) => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (date.toDateString() === today.toDateString()) {
              return "Today";
            } else if (date.toDateString() === yesterday.toDateString()) {
              return "Yesterday";
            } else {
              return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            }
          };
          
          return (
            <>
              {/* Static Date Divider - Always visible */}
              {showDateDivider && (
                <Box
                  ref={(el: HTMLDivElement | null) => {
                    if (el) {
                      dateRefs.current.set(currentDate.toDateString(), el);
                    }
                  }}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    bgcolor:"background.default",
                    my: 2,
                  }}
                >
                  <Chip
                    label={formatDateDivider(currentDate)}
                    size="small"
                    sx={{
                      bgcolor: "action.hover",
                      color: "text.secondary",
                      fontWeight: 500,
                      fontSize: "12px",
                      backgroundColor: "#F5F5F5",
                      width:"100px"
                    }}
                  />
                </Box>
              )}
              
              {/* Floating Sticky Header - Fades in/out while scrolling */}
              {showDateDivider && currentDate.toDateString() === currentStickyDate && showStickyHeader && (
                <Box
                  sx={{
                    position: "sticky",
                    top: 8,
                    display: "flex",
                    justifyContent: "center",
                    py: 0.5,
                    mb: -5,
                    zIndex: 1000,
                    opacity: isScrolling ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none",
                  }}
                >
                  <Chip
                    label={formatDateDivider(currentDate)}
                    size="small"
                    sx={{
                      bgcolor: "action.hover",
                      color: "text.secondary",
                      fontWeight: 500,
                      fontSize: "12px",
                      backgroundColor: "#F5F5F5",
                      width:"100px"
                    }}
                  />
                </Box>
              )}
              
              {/* Message Bubble */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                  mb: 1.5,
                }}
              >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  maxWidth: "70%",
                  flexDirection: isOwnMessage ? "row-reverse" : "row",
                }}
              >
                {/* Avatar - only show for receiver messages */}
                {!isOwnMessage && (
                  <Avatar
                    sx={{
                      bgcolor: "primary.light",
                      color: "primary.main",
                      width: 32,
                      height: 32,
                      fontSize: "14px",
                    }}
                  >
                    {capitalize(msg.sender_name?.[0])}
                  </Avatar>
                )}

                {/* Message Bubble */}
                <Box sx={{ display: "inline-block" }}>
                  <Box
                    sx={{
                      bgcolor: isInternalNote
                        ? "#FFF6D8"
                        : isOwnMessage
                        ? "#f0b01e"
                        : "#F3F3F5",
                      color: isOwnMessage && !isInternalNote ? "white" : "text.primary",
                      p: 1.5,
                      borderRadius: isOwnMessage
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      border: isInternalNote ? "1px solid" : "none",
                      borderColor: isInternalNote ? theme.palette.warning.light : "transparent",
                    }}
                  >
                    {/* Sender name for receiver messages */}
                    {!isOwnMessage && (
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{
                          display: "block",
                          mb: 0.5,
                          color: isInternalNote ? "text.primary" : "text.secondary",
                        }}
                      >
                        {capitalize(msg.sender_name || "Unknown")}
                        {isInternalNote && (
                          <Chip
                            label="Internal Note"
                            size="small"
                            sx={{
                              ml: 1,
                              height: 18,
                              fontSize: "10px",
                              bgcolor: "transparent",
                              border: "1px solid",
                              borderColor: "secondary.contrastText",
                            }}
                          />
                        )}
                      </Typography>
                    )}

                    {/* Message text and timestamp in same line */}
                    {msg.message_text && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          component="div"
                          sx={{
                            wordBreak: "break-word",
                            whiteSpace: "pre-wrap",
                            flex: 1,
                          }}
                        >
                          {linkifyText(msg.message_text, isOwnMessage)}
                        </Typography>
                        
                        {/* Timestamp inline with text ONLY if no attachments */}
                        {!msg.attachments?.filter((att: any) => att.file_url && att.file_url !== "string")?.length && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.3,
                              flexShrink: 0,
                              alignSelf: "flex-end",
                              pb: 0.2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "10px",
                                opacity: 0.7,
                                color: isOwnMessage && !isInternalNote ? "white" : "text.secondary",
                                lineHeight: 1,
                              }}
                            >
                              {formatMessageTime(msg.created_at)}
                            </Typography>
                            {!isInternalNote && (
                              <Box sx={{ opacity: 0.7, display: "flex", alignItems: "center" }}>
                                <MessageStatusIcon
                                  msg={msg}
                                  isOwnMessage={isOwnMessage}
                                  color={isOwnMessage ? "white" : "text.secondary"}
                                />
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Attachments */}
                    {msg.attachments
                      ?.filter(
                        (att: any) => att.file_url && att.file_url !== "string",
                      )
                      .map((att: any) => {
                        const type = att.file_type?.toLowerCase();
                        const url = att.file_url || "";

                        const isExtensionAudio =
                          /\.(mp3|wav|ogg|m4a|aac|weba|webm)(\?.*)?$/i.test(url);
                        const isExtensionVideo = /\.(mp4|mov)(\?.*)?$/i.test(url);

                        const isImage =
                          type === "image" ||
                          (!type &&
                            /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url));
                        const isAudio = isExtensionAudio || type === "audio";
                        const isVideo =
                          (type === "video" && !isExtensionAudio) ||
                          isExtensionVideo;

                        return (
                          <Box key={att.attachment_id} sx={{ mt: 1 }}>
                            {isImage ? (
                              <Box
                                component="a"
                                href={att.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ display: "inline-block" }}
                              >
                                <Box
                                  component="img"
                                  src={att.file_url}
                                  alt="Attachment"
                                  sx={{
                                    maxWidth: "100%",
                                    maxHeight: 200,
                                    borderRadius: 1,
                                    cursor: "pointer",
                                  }}
                                />
                              </Box>
                            ) : isVideo ? (
                              <Box sx={{ maxWidth: "100%", width: 280 }}>
                                <video
                                  controls
                                  src={att.file_url}
                                  style={{
                                    width: "100%",
                                    borderRadius: "8px",
                                  }}
                                />
                              </Box>
                            ) : isAudio ? (
                              <CustomAudioPlayer
                                src={att.file_url}
                                isOwnMessage={isOwnMessage}
                              />
                            ) : (
                              <Box
                                component="a"
                                href={att.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  p: 1,
                                  borderRadius: "8px",
                                  bgcolor: isOwnMessage
                                    ? "rgba(255, 255, 255, 0.2)"
                                    : "rgba(0, 0, 0, 0.05)",
                                  textDecoration: "none",
                                  color: isOwnMessage ? "white" : "text.primary",
                                  maxWidth: 250,
                                  transition: "background-color 0.2s",
                                  "&:hover": {
                                    bgcolor: isOwnMessage
                                      ? "rgba(255, 255, 255, 0.3)"
                                      : "rgba(0, 0, 0, 0.08)",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: isOwnMessage
                                      ? "rgba(255, 255, 255, 0.3)"
                                      : "#F44336",
                                    borderRadius: "6px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: isOwnMessage ? "white" : "white",
                                    flexShrink: 0,
                                  }}
                                >
                                  <CommonIcon
                                    name="FileText"
                                    color="white"
                                    size={20}
                                  />
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={500}
                                    noWrap
                                    sx={{ fontSize: "13px" }}
                                  >
                                    {decodeURIComponent(
                                      att.file_url
                                        .split("/")
                                        .pop()
                                        ?.split("?")[0] || "file",
                                    )}
                                  </Typography>
                                </Box>
                                <CommonIcon
                                  name="Download"
                                  size={16}
                                  color={isOwnMessage ? "white" : theme.palette.text.secondary}
                                />
                              </Box>
                            )}
                          </Box>
                        );
                      })}

                    {/* Timestamp at bottom when there are attachments */}
                    {msg.attachments?.filter((att: any) => att.file_url && att.file_url !== "string")?.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 0.3,
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "10px",
                            opacity: 0.7,
                            color: isOwnMessage && !isInternalNote ? "white" : "text.secondary",
                          }}
                        >
                          {formatMessageTime(msg.created_at)}
                        </Typography>
                        {!isInternalNote && (
                          <Box sx={{ opacity: 0.7, display: "flex", alignItems: "center" }}>
                            <MessageStatusIcon
                              msg={msg}
                              isOwnMessage={isOwnMessage}
                              color={isOwnMessage ? "white" : "text.secondary"}
                            />
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
            </>
          );
        })}

        {/* Floating Scroll to Bottom Button */}
        {showScrollButton && (
          <Box
            sx={{
              position: "sticky",
              bottom: 16,
              display: "flex",
              justifyContent: "flex-end",
              // pr: 1,
              zIndex: 1000,
            }}
          >
            <CommonIconButton
              onClick={scrollToBottom}
              icon={<CommonIcon name="ChevronsDown" size={20} color={theme.palette.primary.main} />}
              sx={{
                bgcolor: "background.default",
                boxShadow: 3,
                "&:hover": {
                  bgcolor: "background.default",
                },
                width: 40,
                height: 40,
              }}
            />
          </Box>
        )}
      </Box>

      {/* REPLY SECTION - STATIC AT BOTTOM */}
      <Box
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleDroppedFile(file);
        }}
        sx={{
          flexShrink: 0,
          borderTop: "1px solid #E5E5E5",
          bgcolor: "white",
          p: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        {/* QUICK REPLY BUTTONS - Hidden on mobile */}
        <Stack 
          direction="row" 
          gap={1} 
          sx={{ 
            display: { xs: "none", sm: "flex" },
            flexWrap: "nowrap",
            mb: 2,
            overflowX: "auto",
            overflowY: "visible"
          }}
        >
          {[
            "Hi!",
            "Good progress!",
            "We'll reply shortly",
            "Reviewing docs",
          ].map((text) => (
            <Chip
              key={text}
              label={text}
              variant="outlined"
              onClick={() => {
                setReply((prev) => (prev ? `${prev} ${text}` : text));
                // Focus the reply input so Enter sends the message
                setTimeout(() => replyInputRef.current?.focus(), 0);
              }}
              clickable
              sx={{ 
                borderColor: "primary.main",
                flexShrink: 1,
                fontSize: "13px",
                height: "32px"
              }}
            ></Chip>
          ))}
        </Stack>

        {/* REPLY INPUT */}
        <Box>
          {isRecording ? (
            <Box sx={{ mb: 2 }}>
              <VoiceRecorder
                onCancel={() => setIsRecording(false)}
                onSend={(file) => handleSend(file)}
                isSending={isSending}
              />
            </Box>
          ) : (
            <>
              {attachedFile && previewUrl && (
                <Box
                  sx={{
                    mb: 2,
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  <Tooltip title={attachedFile.name} arrow placement="right">
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        position: "relative",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                        cursor: "pointer",
                        "&:hover .overlay": {
                          opacity: 1,
                        },
                      }}
                      onClick={() => window.open(previewUrl, "_blank")}
                    >
                      {attachedFile.type.startsWith("image/") ? (
                        <Box
                          component="img"
                          src={previewUrl}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : attachedFile.type.startsWith("video/") ? (
                        <Box
                          component="video"
                          src={previewUrl}
                          muted
                          preload="metadata"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : attachedFile.type.startsWith("audio/") ? (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "background.default",
                          }}
                        >
                          <CommonIcon name="Mic" size={24} />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "background.default",
                          }}
                        >
                          <CommonIcon name="FileText" size={24} />
                        </Box>
                      )}

                      <Box
                        className="overlay"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          bgcolor: "rgba(0,0,0,0.55)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "0.2s ease",
                        }}
                      >
                        <CommonIcon name="Eye" size={18} color="#fff" />
                      </Box>
                    </Box>
                  </Tooltip>
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttachedFile(null);
                      setPreviewUrl(null);
                      setPreUploadedKey(null);
                    }}
                    sx={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      bgcolor: "rgba(0,0,0,0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 5,
                      transition: "0.2s ease",
                      "&:hover": {
                        bgcolor: "rgba(0,0,0,0.75)",
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <CommonIcon name="X" size={12} color="#fff" />
                  </Box>
                  {uploadingPreview && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "8px",
                        bgcolor: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 3,
                        pointerEvents: "none",
                      }}
                    >
                      <CircularProgress
                        size={18}
                        sx={{ color: "primary.main" }}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* Single line input with all actions */}
              <Box display="flex" gap={1} alignItems="center">
                {/* Container for Plus, Attach icons and Text field */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: isInternalNote ? "#FFF6D8" : "#F3F3F5",
                    borderRadius: "24px",
                    border: isInternalNote ? "1px solid #FFC107" : "none",
                    px: 2,
                    py: 1,
                    minHeight: "48px",
                    maxHeight: "120px",
                    overflowY: "auto",
                  }}
                >
                  {/* Plus menu button */}
                  {
                    role === "admin" && (
                  <CommonIconButton
                    color="default"
                    onClick={openActionMenu}
                    icon={<CommonIcon name="Plus" size={20} />}
                    sx={{
                      flexShrink: 0,
                      alignSelf: "flex-end",
                    }}
                  />
                    )
                  }
                  <Menu
                    anchorEl={actionMenuAnchor}
                    open={Boolean(actionMenuAnchor)}
                    onClose={closeActionMenu}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                  >
                    <MenuItem onClick={() => { setOpenTagModal(true); closeActionMenu(); }}>
                      <CommonIcon name="AtSign" />
                      <Typography sx={{ ml: 1 }} variant="body2">Tag Colleague</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => { setOpenAssignModal(true); closeActionMenu(); }}>
                      <CommonIcon name="UserPlus" />
                      <Typography sx={{ ml: 1 }} variant="body2">Assign User</Typography>
                    </MenuItem>
                  </Menu>

                  {/* Text field - multiline, flexible width */}
                  <CommonTextField
                    inputRef={replyInputRef}
                    multiline={true}
                    maxRows={4}
                    placeholder={
                      isInternalNote
                        ? (isMobile ? "Internal note" : "Type an internal note (Admins only)...")
                        : (isMobile ? "Message..." : "Type your message...")
                    }
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        border: "none",
                        padding: 0,
                        "& fieldset": {
                          border: "none !important",
                        },
                        "&:hover fieldset": {
                          border: "none !important",
                        },
                        "&.Mui-focused fieldset": {
                          border: "none !important",
                        },
                        "& textarea": {
                          padding: 0,
                          lineHeight: 1.5,
                        },
                      },
                    }}
                    startIcon={false}
                    onKeyDown={(e: any) => handleEnterStart(e, () => handleSend())}
                  />

                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isInternalNote}
                  />

                  {/* Attach icon button */}
                  <CommonIconButton
                    color="default"
                    onClick={handleChooseClick}
                    icon={<CommonIcon name="Paperclip" size={20} />}
                    sx={{
                      flexShrink: 0,
                      alignSelf: "flex-end",
                    }}
                  />
                </Box>

                {/* Show Mic button when empty, Send button when there's text */}
                {!isInternalNote && !reply.trim() && !attachedFile ? (
                  <CommonIconButton
                    onClick={() => setIsRecording(true)}
                    color="inherit"
                    size="large"
                    disabled={isSending}
                    sx={{
                      flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: "primary.main",
                      color: "white",
                      ":hover": {
                        backgroundColor: "primary.dark",
                      },
                    }}
                    icon={<CommonIcon name="Mic" size={18} />}
                  />
                ) : (
                  <CommonIconButton
                    onClick={() => handleSend()}
                    color="inherit"
                    size="large"
                    disabled={isSending || uploadingPreview}
                    sx={{
                      flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: "primary.main",
                      color: "white",
                      ":hover": {
                        backgroundColor: "primary.dark",
                      },
                    }}
                    icon={
                      isSending ? (
                        <CircularProgress size={18} sx={{ color: "white" }} />
                      ) : (
                        <CommonIcon name="SendHorizontal" size={18} />
                      )
                    }
                  />
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* TAG COLLEAGUE MODAL */}
      {/* TAG COLLEAGUE MODAL (Functionality 1: Send Note) */}
      <TagColleagueModal
        open={openTagModal}
        title="Tag Colleague"
        submitLabel="Tag"
        threadId={currentThread?.thread_id}
        onClose={() => setOpenTagModal(false)}
        onSubmit={(data) => {
          console.log("Tagging colleague:", data);
          let noteText = data.note || "";

          // Only add mention syntax if user selected
          if (data.user?.name) {
            noteText = `@${data.user.name} ${noteText}`;
          }

          if (noteText.trim()) {
            dispatch(
              sendInternalNote({
                content: noteText,
                threadId: currentThread.thread_id,
                taggedUserIds: data.userId ? [data.userId] : [],
              }),
            );
          }

          setOpenTagModal(false);
        }}
      />

      {/* ASSIGN USER MODAL (Functionality 2: Assign) */}
      <AssignUserModal
        open={openAssignModal}
        title="Assign User"
        submitLabel="Assign"
        onClose={() => setOpenAssignModal(false)}
        onSubmit={async (ids) => {
          console.log("Assigning users:", ids);
          if (ids && ids.length > 0) {
            try {
              await dispatch(
                assignThread({
                  threadId: currentThread.thread_id,
                  assignedUserIds: ids,
                }),
              ).unwrap();
              toast.success("User has been assigned successfully");
            } catch (error) {
              console.error("Assignment failed:", error);
              toast.error("Failed to assign user: Only Doctors and Nurses are allowed");
            }
          }
          setOpenAssignModal(false);
        }}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete Conversation"
        maxWidth="xs"
        actions={
          <>
            <CommonButton variant="outlined" onClick={() => setConfirmDelete(false)}>
              Cancel
            </CommonButton>
            <CommonButton
              variant="contained"
              onClick={confirmDeleteThread}
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
    </Box>
  );
};

export default MessageView;
