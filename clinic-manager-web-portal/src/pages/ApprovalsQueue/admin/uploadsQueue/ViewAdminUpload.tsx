import { PallMallIconWithText } from "@/assets";
import { CommonIcon, CommonImage, EmptyStateLoader } from "@/components/common";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAdminUploadView } from "../hooks/uploadHooks/useAdminUploadView";
import { useState } from "react";

type Props = {
  submissionId: string | null;
  onClose: () => void;
  onResetButtonState?: () => void;
};

const ViewAdminUpload = ({ submissionId, onClose,  onResetButtonState, }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data, loading } = useAdminUploadView(submissionId);
  const [hasError, setHasError] = useState(false);

  if (loading)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (!data) {
    return (
      <Paper
        elevation={0}
        sx={{
          height: "auto",
          display: "flex",
          flexDirection: "column",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <EmptyStateLoader
          title="Upload data not available"
          height={220}
          icon="FileX"
        />
        <Box
          sx={{
            p: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              width: 250,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Close
          </Button>
        </Box>
      </Paper>
    );
  }

  const { type, assets } = data;
  const asset = assets?.[0];

  // Dummy URLs for testing
  const dummyImage = "https://www.w3schools.com/w3images/photographer.jpg";
  const dummyPDF = "https://pdfobject.com/pdf/sample.pdf";

  const isValidUrl = (url: any) => {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim();
    if (trimmed === "" || trimmed === "undefined" || trimmed === "null")
      return false;
    return (
      trimmed.startsWith("http") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
    );
  };

  const isImage = (url: string) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    if (url.startsWith("data:image/") || url.startsWith("blob:")) return true;

    // Clean URL by removing query parameters before checking extension
    const cleanUrl = url.split(/[?#]/)[0];
    const extension = cleanUrl.split(".").pop()?.toLowerCase();

    return extension ? imageExtensions.includes(extension) : false;
  };

  const renderContent = () => {
    const activeUrl = asset?.file_url;

    if (!isValidUrl(activeUrl) || hasError) {
      return (
        <EmptyStateLoader
          title={`${type === "e_signature" ? "Signature" : "File"} not available`}
          height={220}
          icon="FileX"
        />
      );
    }

    // Unified logic for Signatures and Images
    if (type === "e_signature" || isImage(activeUrl)) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CommonImage
            src={activeUrl}
            alt="Preview"
            onError={() => setHasError(true)}
            sx={{
              maxWidth: "100%",
              maxHeight: "500px",
              objectFit: "contain",
              borderRadius: 1,
              boxShadow: 3,
            }}
          />
        </Box>
      );
    }

    if (type === "file_upload") {
      // Correctly appending toolbar options to URLs (checking for existing params)
      const cleanPdfUrl = `${activeUrl}#toolbar=0&navpanes=0`

      return (
        <Box
          sx={{
            width: "100%",
            height: isMobile ? "70vh" : "600px",
            minHeight: "400px",
            bgcolor: "#fff",
          }}
        >
          <iframe
            src={cleanPdfUrl}
            title="PDF Viewer"
            width="100%"
            height="100%"
            style={{ border: "none", borderRadius: "8px" }}
          />
        </Box>
      );
    }

    return (
      <EmptyStateLoader
        title="Unsupported upload type"
        height={220}
        icon="AlertTriangle"
      />
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          width: "100%",
          bgcolor: theme.palette.primary.main,
          p: "17px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={PallMallIconWithText}
          alt="Pall Mall Logo"
          sx={{
            width: 94,
            height: 100,
            objectFit: "contain",
          }}
        />

        {isValidUrl(asset?.file_url) && (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<CommonIcon name="ExternalLink" size={16} />}
            onClick={() => window.open(asset?.file_url, "_blank")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "#fff",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            Open in New Tab
          </Button>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: isMobile ? 2 : 4,
          py: 3,
          maxWidth: isMobile ? "100%" : 700,
          width: "100%",
          mx: "auto",
        }}
      >
        {renderContent()}
      </Box>

      <Box
        sx={{
          p: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "center",
          flexShrink: 0,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Button
          variant="contained"
           onClick={() => {
            onResetButtonState?.();
            onClose();
          }}
          sx={{
            width: 250,
            bgcolor: theme.palette.primary.main,
            color: "#fff",
            fontWeight: 600,
            borderRadius: 2,
            py: 1.2,
            textTransform: "none",
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          Close
        </Button>
      </Box>
    </Paper>
  );
};

export default ViewAdminUpload;
