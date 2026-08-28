import { CommonButton, CommonIcon, Modal } from "@/components/common";
import { Box, Divider, Typography, useTheme } from "@mui/material";

interface ContentDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  preview: {
    title: string;
    type: string;
    status: "Published" | "Draft";
  } | null;
}

const TYPE_ICON_MAP = {
  Image: "Image",
  Video: "Video",
  Blog: "FileText",
  "E-learning": "GraduationCap",
} as const;

const ContentDeleteModal = ({
  open,
  onClose,
  onDelete,
  preview,
}: ContentDeleteModalProps) => {
  const theme = useTheme();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CommonIcon
            name="AlertTriangle"
            size={20}
            color={theme.palette.error.dark}
          />
          <Typography variant="h6">Delete Content</Typography>
        </Box>
      }
    >
      {/* Subtitle */}
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        This action will remove the selected content from the platform.
      </Typography>

      {/* preview */}
      {preview && (
        <Box
          sx={{
            p: 2,
            borderRadius: "12px",
            bgcolor: "#F8FAFC",
            mb: 2,
          }}
        >
          {/* ================= XS LAYOUT ================= */}
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1,
              }}
            >
              {/* Avatar */}
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50px",
                  bgcolor: "#FFFBEB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CommonIcon
                  name={
                    TYPE_ICON_MAP[preview.type as keyof typeof TYPE_ICON_MAP] ??
                    "FileText"
                  }
                  color={theme.palette.primary.main}
                  size={20}
                />
              </Box>

              {/* TYPE BADGE */}
              <Box
                sx={{
                  px: 1.5,
                  py: 0.8,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  {preview.type}
                </Typography>
              </Box>

              {/* STATUS ICON */}
              <Box sx={{ ml: "auto" }}>
                <CommonIcon
                  name={
                    preview.status === "Draft"
                      ? "CircleSlash"
                      : "CircleCheckBig"
                  }
                  size={17}
                  color={
                    preview.status === "Draft"
                      ? theme.palette.primary.main
                      : "#2E7D32"
                  }
                />
              </Box>
            </Box>

            {/* TITLE BELOW */}
            <Typography variant="body1">{preview.title}</Typography>
          </Box>

          {/* ================= SM LAYOUT ================= */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Avatar */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50px",
                bgcolor: "#FFFBEB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CommonIcon
                name={
                  TYPE_ICON_MAP[preview.type as keyof typeof TYPE_ICON_MAP] ??
                  "FileText"
                }
                color={theme.palette.primary.main}
                size={20}
              />
            </Box>

            {/* Title + Type */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1">{preview.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {preview.type}
              </Typography>
            </Box>

            {/* Status Badge */}
            <Box
              sx={{
                px: 1.5,
                py: 0.4,
                borderRadius: "999px",
                fontSize: 12,
                fontWeight: 500,
                bgcolor:
                  preview.status === "Draft"
                    ? theme.palette.primary.main
                    : "#E6F4EA",
                color:
                  preview.status === "Draft"
                    ? theme.palette.primary.contrastText
                    : "#2E7D32",
              }}
            >
              {preview.status}
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ mb: 1.5 }} />

      <Typography variant="subtitle2" sx={{ mb: 1.5, textAlign: "center" }}>
        Are you sure you want to delete this content?
      </Typography>

      {/* warn mes*/}
      <Box
        sx={{
          p: 2,
          borderRadius: "12px",
          bgcolor: "#FDECEA",
          border: "1px solid #F5C2C7",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <CommonIcon name="AlertTriangle" color="#E7000B" size={18} />
          <Typography variant="button" color="error.dark">
            Warning
          </Typography>
        </Box>

        <Typography variant="body2" color="error.dark" sx={{ ml: 3 }}>
          Once deleted, this content will no longer be available to patients and
          cannot be restored.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
        }}
      >
        <CommonButton variant="outlined" onClick={onClose}>
          Cancel
        </CommonButton>

        <CommonButton
          variant="contained"
          color="error"
          startIcon={<CommonIcon name="CircleX" />}
          onClick={onDelete}
        >
          Delete
        </CommonButton>
      </Box>
    </Modal>
  );
};

export default ContentDeleteModal;
